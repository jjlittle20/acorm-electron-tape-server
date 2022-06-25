// PlayUEF

function uef2wave(
  uefData,
  baud,
  sampleRate,
  stopPulses,
  phase,
  carrierFactor,
  highBitFreq,
) {
  'use strict';
  // Create 16-bit array of a sine wave for given frequency, cycles and phase
  function generateTone(label, frequency, cycles, phase, sampleRate) {
    const samples = Math.floor((sampleRate / frequency) * cycles);
    const array = new Int16Array(samples);
    for (let i = 0; i < samples; i++) {
      array[i] = Math.floor(
        Math.sin(phase + (i / sampleRate) * (frequency * 2 * Math.PI)) * 0x7fff,
      );
    }
    const info =
      label +
      ': ' +
      Math.floor((1000000 * array.length) / sampleRate) +
      'us (' +
      cycles +
      ' pulses at ' +
      frequency +
      'Hz)';
    if (label !== null) console.log('label null------->', info);
    return array;
  }

  // Create mini-samples of audio bit encoding
  const carrier = generateTone('carrier', baud * 2, 2, phase, sampleRate);
  const bit0 = generateTone('bit0   ', baud, 1, phase, sampleRate);
  const bit1 = generateTone('bit1   ', highBitFreq, 2, phase, sampleRate);
  const stopbit = generateTone(
    'stopbit',
    baud * 2,
    stopPulses / 2,
    phase,
    sampleRate,
  );
  const highwave = generateTone(null, baud * 2, 1, phase, sampleRate);

  const isValidUEF = function () {
    return String.fromCharCode.apply(null, uefData.slice(0, 9)) == 'UEF File!';
  };

  // check if the UEF is in fact zipped
  // if (isValidUEF() == false) {
  //   try {
  //     const gunzip = new Zlib.gunzip(uefData);
  //     uefData = gunzip.decompress();
  //   } catch (e) {
  //     handleError('Invalid UEF/ZIP file<BR>', e);
  //   }
  // }

  if (isValidUEF() == false) {
    handleError('Invalid UEF file', 0);
  }

  // TODO - letiables passed to decode and WAV creation
  const uefChunks = [];
  const samplesPerCycle = Math.floor(sampleRate / baud); // Audio samples per base cycle
  let uefPos = 12; // skip over "UEF File!"
  const uefDataLength = uefData.length;
  let parityInvert = 0;
  const uefCycles = 0;

  function decodeUEF(uefData) {
    console.log(uefData);
    function decodeChunk(UEFchunk) {
      console.log('ID------->', UEFchunk.id);
      switch (UEFchunk.id) {
        case 0x0000: // originInformation
          const info = String.fromCharCode.apply(null, UEFchunk.data);
          console.log('UEF info: ' + info);
          const match = info.match(/MakeUEF\D+(\d+)\.(\d+)/i);
          if (match) {
            const version = match[1];
            if (version < 3) {
              parityInvert = 1;
              console.log(
                'PlayUEF : MakeUEF v2.x or below - 0x0104 parity will be inverted',
              );
            }
          }
          break;
        case 0x0100: // dataBlock
          const header = acornBlockInfo(UEFchunk.data);
          console.log('chunkData-------->', UEFchunk.data);
          uefChunks.push({
            type: 'dataBlock',
            header: header,
            data: UEFchunk.data,
            cycles: 10 * UEFchunk.data.length,
          });
          blockNumber++;
          break;

        case 0x0104: // definedDataBlock
          const data = UEFchunk.data.slice(3);
          const format = {
            bits: UEFchunk.data[0],
            parity: chr(UEFchunk.data[1]),
            stopBits: UEFchunk.data[2],
          };
          const cycles = cyclesPerPacket(format) * data.length;
          uefChunks.push({
            type: 'definedDataBlock',
            format: format,
            header: 'Defined format data chunk ' + hex(blockNumber),
            data: data,
            cycles: cycles,
          });
          blockNumber++;
          break;

        case 0x0110: // carrierTone
          uefChunks.push({
            type: 'carrierTone',
            cycles: carrierAdjust(wordAt(UEFchunk.data, 0)),
          });
          break;

        case 0x0112: // integerGap
          blockNumber = 0;
          uefChunks.push({
            type: 'integerGap',
            cycles: wordAt(UEFchunk.data, 0) * 2,
          });
          break;

        case 0x0111: // carrierToneWithDummyByte
          uefChunks.push({
            type: 'carrierTone',
            cycles: wordAt(UEFchunk.data, 0),
          }); // before cycles
          uefChunks.push({
            type: 'dataBlock',
            data: [0xaa],
            cycles: 10,
            header: '',
          }); // Dummy Byte
          uefChunks.push({
            type: 'carrierTone',
            cycles: wordAt(UEFchunk.data, 2),
          }); // after byte
          break;

        case 0x0114: // securityCycles - REPLACED WITH CARRIER TONE
          uefChunks.push({
            type: 'carrierTone',
            cycles: doubleAt(UEFchunk.data, 0) & 0x00ffffff,
          });
          break;

        case 0x0116: // floatingPointGap - APPROXIMATED
          blockNumber = 0;
          uefChunks.push({
            type: 'integerGap',
            cycles: carrierAdjust(Math.ceil(floatAt(UEFchunk.data, 0) * baud)),
          });
          break;
      }
    }

    function cyclesPerPacket(format) {
      return 1 + format.bits + (format.parity == 'N' ? 0 : 1) + format.stopBits;
    }

    // Adjust carrier tone accoring to parameter
    function carrierAdjust(cycles) {
      if (carrierFactor == 0) {
        return blockNumber > 0 ? 12000 / carrier.length : cycles; // minimal interblock
      } else {
        return cycles * carrierFactor;
      }
    }

    // Cassette Filing System header http://beebwiki.mdfs.net/Acorn_cassette_format
    function acornBlockInfo(data) {
      if (data[0] == 0x2a && data.length > 24) {
        function isZero(element) {
          return element == 0;
        }
        const strend = data.findIndex(isZero);
        const filename = String.fromCharCode.apply(null, data.slice(1, strend));
        const loadAddress = doubleAt(data, strend + 1);
        const executionAddress = doubleAt(data, strend + 5);
        const blockNumber = wordAt(data, strend + 9);
        return (
          filename +
          ' ' +
          ('00' + blockNumber.toString(16)).substr(-2) +
          ' ' +
          hex4(loadAddress) +
          ' ' +
          hex4(executionAddress)
        );
      } else {
        return '';
      }
    }

    function readChunk(uefData, pos) {
      const UEFchunk = {
        id: wordAt(uefData, pos),
        data: uefData.slice(pos + 6, doubleAt(uefData, pos + 2) + pos + 6),
      };
      return UEFchunk;
    }

    // Decode all UEF chunks
    let blockNumber = 0;
    while (uefPos < uefDataLength) {
      const UEFchunk = readChunk(uefData, uefPos);
      // console.log('UEF read chunk-------->', UEFchunk);
      decodeChunk(UEFchunk);
      uefPos += UEFchunk.data.length + 6;
    }
    console.log('prechucmks ------->', uefChunks);
    return uefChunks;
  }

  function createWAV(uefChunks) {
    // Write array to audio buffer
    const writeSample = function (array) {
      const length = array.length;
      for (let i = 0; i < length; i++) {
        sampleData[samplePos + i] = array[i];
      }
      samplePos += length;
    };

    // Write bit to audio buffer
    const writeBit = function (bit) {
      bit == 0 ? writeSample(bit0) : writeSample(bit1);
    };

    // Standard BBC Micro / Acorn Electron 8N1 format data
    const writeStandardBlock = function (chunk) {
      const length = chunk.data.length;
      for (let i = 0; i < length; i++) {
        let byte = chunk.data[i];
        writeSample(bit0);
        for (let b = 0; b < 8; b++) {
          const bit = byte & 1;
          writeBit(bit);
          byte = byte >> 1;
        }
        writeSample(bit1);
      }
    };

    // Custom block data format and Acorn Atom
    const writeDefinedByte = function (byte, format) {
      let paritybit = byte;
      if (format.parity != 'N') {
        paritybit ^= paritybit >> 4;
        paritybit ^= paritybit >> 2;
        paritybit ^= paritybit >> 1;
        paritybit = format.parity == 'O' ? (paritybit & 1) ^ 1 : paritybit & 1;
        paritybit ^= parityInvert;
      }
      writeSample(bit0); // Write start bit 0
      for (let b = 0; b < format.bits; b++) {
        const bit = byte & 1;
        writeBit(bit);
        byte = byte >> 1;
      }
      if (format.parity != 'N') {
        writeBit(paritybit);
      }
      for (let i = 0; i < format.stopBits; i++) {
        writeSample(bit1);
      }
      if (format.extraWave == 1) {
        writeSample(highwave);
      }
    };

    // Write defined format data byte
    const writeDefinedBlock = function (chunk) {
      const length = chunk.data.length;
      for (let i = 0; i < length; i++) {
        writeDefinedByte(chunk.data[i], chunk.format);
      }
    };

    // Write carrier tone
    const writeTone = function (chunk) {
      for (let i = 0; i < chunk.cycles; i++) {
        writeSample(carrier);
      }
    };

    // Gap advances sample position pointer, assumes array is zero filled
    const writeGap = function (chunk) {
      samplePos += samplesPerCycle * chunk.cycles;
    };

    // Define functions to apply to uefChunk tokens
    const functions = {
      integerGap: writeGap,
      carrierTone: writeTone,
      dataBlock: writeStandardBlock,
      definedDataBlock: writeDefinedBlock,
    };

    let uefCycles = 0;
    const numChunks = uefChunks.length;

    for (let i = 0; i < numChunks; i++) {
      uefCycles += uefChunks[i].cycles;
    }

    const estLength = uefCycles * samplesPerCycle; // Estimate WAV length from UEF decode
    const waveBuffer = new ArrayBuffer(44 + estLength * 2); // Header is 44 bytes, sample is 16-bit * sampleLength
    const sampleData = new Int16Array(waveBuffer, 44, estLength);
    let samplePos = 0;
    const re = /[^\x20-\xff]/g;
    // Parse all chunk objects and write WAV
    for (let i = 0; i < numChunks; i++) {
      const chunk = uefChunks[i];
      uefChunks[i].timestamp = samplePos; // Record start position in audio WAV, given in samples
      functions[chunk.type].apply(this, [chunk]);

      // Array to string for console display
      if (uefChunks[i].data != null) {
        const str = String.fromCharCode.apply(null, uefChunks[i].data); //
        uefChunks[i].datastr = str.replace(re, '.');
      }
    }

    console.log(
      Math.floor((10 * samplePos) / sampleRate) / 10 +
        's WAV audio at ' +
        baud +
        ' baud',
    );
    console.log('WAV BUFFER ------>', waveBuffer);
    return new Uint8Array(buildWAVheader(waveBuffer, samplePos, sampleRate));
  }

  console.time('Decode UEF');
  console.log('UEF DATA----------->', uefData);
  const uefChunkss = decodeUEF(uefData);
  console.log('UEF CHUNCKS-------->', uefChunkss);
  console.timeEnd('Decode UEF');
  console.time('Create WAV');
  const wavfile = createWAV(uefChunkss);
  console.timeEnd('Create WAV');
  return { wav: wavfile, uef: uefChunks };
}

// const wordAt = (array, position) => {
//   const bytes = array.slice(position, position + 2);
//   console.log('bytes---->', bytes);
//   const buffer = Buffer.from(bytes);
//   console.log('buffer-------->', buffer);
//   // console.log(buffer);
//   const uintArray = new Uint16Array(buffer)[0];
//   console.log('unitArray-------->', uintArray);
//   // console.log(uintArray);
//   return uintArray;
// };
const wordAt = function (array, position) {
  const bytes = array.slice(position, position + 2);
  console.log('bytes---->', bytes);
  return new Uint16Array(bytes)[0];
};

const doubleAt = (array, position) => {
  const bytes = array.slice(position, position + 4);
  const buffer = Buffer.from(bytes);
  return new Uint32Array(buffer)[0];
};

const floatAt = (array, position) => {
  const bytes = array.slice(position, position + 4);
  return new Float32Array(bytes)[0];
};

const hex = (value) => {
  return ('00000000' + value.toString(16)).substr(-8);
};
const hex4 = (value) => {
  return ('0000' + value.toString(16)).substr(-4);
};
const chr = (value) => {
  return String.fromCharCode(value);
};

// Create WAV header for audio buffer
const buildWAVheader = (waveBuffer, sampleLength, sampleRate) => {
  const numFrames = sampleLength;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const dv = new DataView(waveBuffer);
  let p = 0;

  function writeString(s) {
    for (let i = 0; i < s.length; i++) {
      dv.setUint8(p + i, s.charCodeAt(i));
    }
    p += s.length;
  }
  function writeUint32(d) {
    dv.setUint32(p, d, true);
    p += 4;
  }
  function writeUint16(d) {
    dv.setUint16(p, d, true);
    p += 2;
  }

  writeString('RIFF'); // ChunkID
  writeUint32(dataSize + 36); // ChunkSize
  writeString('WAVE'); // Format
  writeString('fmt '); // Subchunk1ID
  writeUint32(16); // Subchunk1Size
  writeUint16(1); // AudioFormat
  writeUint16(numChannels); // NumChannels
  writeUint32(sampleRate); // SampleRate
  writeUint32(byteRate); // ByteRate
  writeUint16(blockAlign); // BlockAlign
  writeUint16(bytesPerSample * 8); // BitsPerSample
  writeString('data'); // Subchunk2ID
  writeUint32(dataSize); // Subchunk2Size

  return waveBuffer;
};
function handleError(text, next) {
  console.error(text, next);
}
export default uef2wave;
