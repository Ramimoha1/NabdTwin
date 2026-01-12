// OBJ to Three.js JSON Converter
// Usage: node convert-obj.js input.obj output.json

const fs = require('fs');
const THREE = require('three');

// Check if three.js is installed
try {
  require.resolve('three');
} catch(e) {
  console.error('❌ three.js not found. Install it first:');
  console.error('   npm install three');
  process.exit(1);
}

const OBJLoader = require('three/examples/jsm/loaders/OBJLoader.js').OBJLoader;

const inputFile = process.argv[2] || 'c:\\Users\\engra\\Downloads\\sample1.obj';
const outputFile = process.argv[3] || 'sample1.json';

console.log('📥 Loading OBJ file:', inputFile);

fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('❌ Error reading file:', err);
    process.exit(1);
  }

  const loader = new OBJLoader();
  const object = loader.parse(data);

  // Extract geometry from the first mesh
  let geometry = null;
  object.traverse((child) => {
    if (child.isMesh && !geometry) {
      geometry = child.geometry;
    }
  });

  if (!geometry) {
    console.error('❌ No geometry found in OBJ file');
    process.exit(1);
  }

  // Convert to Three.js JSON format
  const json = geometry.toJSON();

  fs.writeFile(outputFile, JSON.stringify(json, null, 2), (err) => {
    if (err) {
      console.error('❌ Error writing file:', err);
      process.exit(1);
    }
    console.log('✅ Converted successfully!');
    console.log('📤 Output file:', outputFile);
    console.log('\n📋 Next steps:');
    console.log('   1. Copy', outputFile, 'to:');
    console.log('      example/models/js/sample1.js');
    console.log('   2. Add entry to items.js');
  });
});
