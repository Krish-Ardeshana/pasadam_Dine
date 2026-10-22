const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'salad_bowl.glb',
    url: 'https://raw.githubusercontent.com/Velskins/O-Bistrot_Carte_WebAR/main/assets/models/Salad_Bowl.glb',
  },
  {
    name: 'dal_curry.glb',
    url: 'https://raw.githubusercontent.com/Velskins/O-Bistrot_Carte_WebAR/main/assets/models/soupe.glb',
  },
  {
    name: 'biryani_rice.glb',
    url: 'https://raw.githubusercontent.com/Velskins/O-Bistrot_Carte_WebAR/main/assets/models/risotto.glb',
  },
  {
    name: 'halwa_dessert.glb',
    url: 'https://raw.githubusercontent.com/Velskins/O-Bistrot_Carte_WebAR/main/assets/models/creme_brulee.glb',
  },
  {
    name: 'chocolate_cake.glb',
    url: 'https://raw.githubusercontent.com/Velskins/O-Bistrot_Carte_WebAR/main/assets/models/mousse.glb',
  },
  {
    name: 'burger.glb',
    url: 'https://raw.githubusercontent.com/mindset-code/burger-house-3d/main/public/hamburger__game_asset.glb',
  },
  {
    name: 'pizza.glb',
    url: 'https://raw.githubusercontent.com/haydermuhib/google-model-viewer-pizza/main/pizza.glb',
  },
  {
    name: 'pizza.usdz',
    url: 'https://raw.githubusercontent.com/haydermuhib/google-model-viewer-pizza/main/pizza.usdz',
  },
  {
    name: 'masala_chai.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionTeacup/glTF-Binary/DiffuseTransmissionTeacup.glb',
  },
  {
    name: 'paneer_tikka_platter.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/IridescentDishWithOlives/glTF-Binary/IridescentDishWithOlives.glb',
  },
  {
    name: 'water_bottle.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/WaterBottle/glTF-Binary/WaterBottle.glb',
  },
];

const targetDir = path.join(__dirname, '..', 'frontend', 'public', 'models');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadFile(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(targetDir, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[EXISTS] ${item.name} (${fs.statSync(dest).size} bytes)`);
      return resolve({ name: item.name, size: fs.statSync(dest).size, status: 'CACHED' });
    }

    console.log(`[DOWNLOADING] ${item.name} from ${item.url}...`);
    const file = fs.createWriteStream(dest);
    
    https.get(item.url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile({ name: item.name, url: response.headers.location }).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${response.statusCode} for ${item.name}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          console.log(`[DONE] ${item.name} (${stats.size} bytes)`);
          resolve({ name: item.name, size: stats.size, status: 'DOWNLOADED' });
        });
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  console.log('Starting download of verified realistic food 3D models...');
  for (const item of models) {
    try {
      await downloadFile(item);
    } catch (err) {
      console.error(`Failed ${item.name}:`, err.message);
    }
  }
  console.log('All downloads completed.');
}

run();
