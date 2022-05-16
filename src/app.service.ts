import { Injectable } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import axios from 'axios';
import { Readable } from 'stream';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getAcorn(): any {
    const arr = [
      {
        parent: '4thDimension/',
        files: [
          'ArcadeSoccer_E.zip',
          'EType_E.zip',
          'HoledOutExtraCoursesVol1_E.zip',
          'HoledOutExtraCoursesVol2_E.zip',
          'HoledOut_E.zip',
          'Inertia_E.zip',
          'WhiteMagic_E.zip',
        ],
      },
      {
        parent: 'ASP/',
        files: ['SavagePond-Starcade_E.zip', 'TheValley_E.zip'],
      },
      {
        parent: 'Aardvark/',
        files: ['FrakV11_E.zip', 'FrakV2_E.zip', 'Zalaga_E.zip'],
      },
      { parent: 'AcornUser/', files: ['AcornUserGamesCompendium_E.zip'] },
      {
        parent: 'Acornsoft/',
        files: [
          'Arcadians-German_E.zip',
          'Arcadians_E.zip',
          'Boxer_E.zip',
          'CastleOfRiddles_E.zip',
          'Chess-Acornsoft_E.zip',
          'CrazyTracer_E.zip',
          'DraughtsAndReversi_E.zip',
          'Elite_E.zip',
          'Firebug_E.zip',
          'FreeFall-German_E.zip',
          'Freefall_E.zip',
          'Go_E.zip',
          'Hopper_E.zip',
          'MagicMushrooms_E.zip',
          'Maze_E.zip',
          'Meteors-German_E.zip',
          'Meteors_E.zip',
          'Monsters_E.zip',
          'PhilosophersQuest_E.zip',
          'Planetoid-German_E.zip',
          'Planetoid_E.zip',
          'Snapper_E.zip',
          'Snooker-Acornsoft_E.zip',
          'SphinxAdventure_E.zip',
          'StarshipCommand-German_E.zip',
          'StarshipCommand_E.zip',
        ],
      },
      // { parent: 'Addictive/', files: [] },
      // { parent: 'Adventuresoft/', files: [] },
      // { parent: 'Alligata/', files: [] },
      // { parent: 'Alternative/', files: [] },
      // { parent: 'AnF/', files: [] },
      // { parent: 'Anco/', files: [] },
      // { parent: 'Anirog/', files: [] },
      // { parent: 'Antartic/', files: [] },
      // { parent: 'AshleyGreenup/', files: [] },
      // { parent: 'Atarisoft/', files: [] },
      // { parent: 'Atlantis/', files: [] },
      // { parent: 'Audiogenic/', files: [] },
      // { parent: 'BBCSoft/', files: [] },
      // { parent: 'BeauJolly/', files: [] },
      // { parent: 'BitTwiddlers/', files: [] },
      // { parent: 'BlueRibbon/', files: [] },
      // { parent: 'Brainbox/', files: [] },
      // { parent: 'BrassingtonEnterprises/', files: [] },
      // { parent: 'Britannia/', files: [] },
      // { parent: 'BugByte/', files: [] },
      // { parent: 'CDS/', files: [] },
      // { parent: 'CRL/', files: [] },
      // { parent: 'CSM/', files: [] },
      // { parent: 'Cascade/', files: [] },
      // { parent: 'Cases/', files: [] },
      // { parent: 'Codemasters/', files: [] },
      // { parent: 'ComputerConcepts/', files: [] },
      // { parent: 'Comsoft/', files: [] },
      // { parent: 'DWGore/', files: [] },
      // { parent: 'Dacc/', files: [] },
      // { parent: 'Database/', files: [] },
      // { parent: 'DeeKay/', files: [] },
      // { parent: 'Doctorsoft/', files: [] },
      // { parent: 'Domark/', files: [] },
      // { parent: 'Duckworth/', files: [] },
      // { parent: 'Durell/', files: [] },
      // { parent: 'Dynabyte/', files: [] },
      // { parent: 'Elite/', files: [] },
      // { parent: 'ElkAdventureClub/', files: [] },
      // { parent: 'Empire/', files: [] },
      // { parent: 'English/', files: [] },
      // { parent: 'Epic/', files: [] },
      // { parent: 'Firebird/', files: [] },
      // { parent: 'FirstStar/', files: [] },
      // { parent: 'Garland/', files: [] },
      // { parent: 'Gemini/', files: [] },
      // { parent: 'Godax/', files: [] },
      // { parent: 'Goldstar/', files: [] },
      // { parent: 'Gremlin/', files: [] },
      // { parent: 'Haresoft/', files: [] },
      // { parent: 'Hewson/', files: [] },
      // { parent: 'Hollsoft/', files: [] },
      // { parent: 'IJK/', files: [] },
      // { parent: 'Icon/', files: [] },
      // { parent: 'Imagine/', files: [] },
      // { parent: 'Impact/', files: [] },
      // { parent: 'Incentive/', files: [] },
      // { parent: 'Interceptor/', files: [] },
      // { parent: 'JKeyne/', files: [] },
      // { parent: 'Kansas/', files: [] },
      // { parent: 'Labyrinth/', files: [] },
      // { parent: 'Larsoft/', files: [] },
      // { parent: 'Lee/', files: [] },
      // { parent: 'Livewire/', files: [] },
      // { parent: 'Logotron/', files: [] },
      // { parent: 'Longman/', files: [] },
      // { parent: 'Lothlorien/', files: [] },
      // { parent: 'MP/', files: [] },
      // { parent: 'MRJ/', files: [] },
      // { parent: 'MRM/', files: [] },
      // { parent: 'Macsen/', files: [] },
      // { parent: 'Magus/', files: [] },
      // { parent: 'Mandarin/', files: [] },
      // { parent: 'Martech/', files: [] },
      // { parent: 'Mastertronic/', files: [] },
      // { parent: 'MelbourneHouse/', files: [] },
      // { parent: 'Microbyte/', files: [] },
      // { parent: 'Microdeal/', files: [] },
      // { parent: 'Micropower/', files: [] },
      // { parent: 'Mirrorsoft/', files: [] },
      // { parent: 'Ocean/', files: [] },
      // { parent: 'Optyx/', files: [] },
      // { parent: 'Opus/', files: [] },
      // { parent: 'Orbit/', files: [] },
      // { parent: 'PCW/', files: [] },
      // { parent: 'Peaksoft/', files: [] },
      // { parent: 'Players/', files: [] },
      // { parent: 'Postern/', files: [] },
      // { parent: 'Potter/', files: [] },
      // { parent: 'PowerHouse/', files: [] },
      // { parent: 'Qualsoft/', files: [] },
      // { parent: 'Quicksilva/', files: [] },
      // { parent: 'RedShift/', files: [] },
      // { parent: 'Riverdale/', files: [] },
      // { parent: 'Robico/', files: [] },
      // { parent: 'Romik/', files: [] },
      // { parent: 'Samurai/', files: [] },
      // { parent: 'Shards/', files: [] },
      // { parent: 'Softek/', files: [] },
      // { parent: 'SoftwareCommunications/', files: [] },
      // { parent: 'SoftwareForAll/', files: [] },
      // { parent: 'SoftwareInvasion/', files: [] },
      // { parent: 'Squaresoft/', files: [] },
      // { parent: 'Squirrelsoft/', files: [] },
      // { parent: 'Superior/', files: [] },
      // { parent: 'SuperiorReRelease/', files: [] },
      // { parent: 'Supersoft/', files: [] },
      // { parent: 'Talent/', files: [] },
      // { parent: 'TopTen/', files: [] },
      // { parent: 'Tynesoft/', files: [] },
      // { parent: 'USGold/', files: [] },
      // { parent: 'Unreleased/', files: [] },
      // { parent: 'Virgin/', files: [] },
      // { parent: 'Visions/', files: [] },
      // { parent: 'Wgames/', files: [] },
      // { parent: 'Yes/', files: [] },
      // { parent: 'app/', files: [] },
      // { parent: 'cheat/', files: [] },
      // { parent: 'educ/', files: [] },
      // { parent: 'hardware/', files: [] },
      // { parent: 'lang/', files: [] },
      // { parent: 'leisure/', files: [] },
      // { parent: 'magtapes/', files: [] },
      // { parent: 'util/', files: [] },
    ];

    return arr;
  }
  sendFile = (req, res) => {
    res.status(200);
    const url = `http://www.stairwaytohell.com/electron/uefarchive/${req.body.parent}${req.body.file}.zip`;

    axios({
      url: url,
      method: 'GET',
      responseType: 'arraybuffer',
    })
      .then((response) => {
        return this.handleZip({
          file: response.data,
          name: `${req.body.file}.zip`,
        });
      })
      .then((data) => {
        //  res.send({ file: data, name: req.body.file }
        const readable = new Readable();
        readable._read = () => {
          null;
        }; // _read is required but you can noop it
        readable.push(data);
        readable.push(null);

        readable.pipe(res);
      });
  };

  handleZip(input) {
    const filedata = input.file;
    const filename = input.name;
    let unzippedFile;

    if (filename.split('.').pop().toLowerCase() == 'zip') {
      try {
        const zip = new AdmZip(filedata);

        const zipEntries = zip.getEntries();

        zipEntries.forEach(function (zipEntry) {
          // if (zipEntry.entryName.split('.').pop().toLowerCase() == 'txt') {
          //   console.log(zipEntry.toString('utf8'));
          //   console.log(zipEntry.name);
          // }
          if (zipEntry.entryName.split('.').pop().toLowerCase() == 'uef') {
            unzippedFile = zipEntry.getData();
          }
        });
      } catch (e) {
        console.error('trying to unzip' + filename, e);
      }
    }

    return unzippedFile;
  }
}
