# Adding Your GLB/GLTF Model to Blueprint3D

## 📋 Quick Steps

### 1. Convert Your Model

**Option A: Three.js Editor (Recommended)**
1. Go to: https://threejs.org/editor/
2. Click **File → Import** → Select your `.glb` or `.gltf` file
3. The model will appear in the scene
4. Click **File → Export Object**
5. Save the file as `your-model.json`

**Option B: Use Blender**
1. Open your GLB/GLTF in Blender (File → Import → glTF 2.0)
2. Install Three.js exporter addon
3. Export as Three.js JSON

### 2. Copy Files to Blueprint3D

**Copy your converted model:**
```
FROM: Downloads/your-model.json
TO:   c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example\models\js\your-model.js
```

**Copy textures (if any):**
```
FROM: Downloads/texture.png
TO:   c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example\models\js\texture.png
```

**Add thumbnail (optional):**
```
FROM: Screenshots/your-model-thumb.png
TO:   c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example\models\thumbnails\your-model-thumb.png
```

### 3. Register Model in items.js

Edit: `example/js/items.js`

Add this entry to the `items` array:

```javascript
{
  "name": "My Custom Model",
  "image": "models/thumbnails/your-model-thumb.png",
  "model": "models/js/your-model.js",
  "type": "1"
}
```

**Item Types:**
- `"1"` = Floor item (desks, chairs, tables)
- `"3"` = Wall item (windows, pictures)
- `"7"` = Door item

### 4. Restart Server

```powershell
# Stop server (if running): Ctrl+C

# Navigate to example folder
cd c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example

# Start server
python -m http.server 8000
```

### 5. Test in Browser

1. Open: http://localhost:8000
2. Click "Add Items" tab
3. Find your model in the list
4. Drag it into the 3D scene

---

## 🔧 Troubleshooting

### Model doesn't appear in list
- Check that `items.js` syntax is correct (no missing commas)
- Refresh browser (Ctrl+F5)

### Model appears but is invisible
- Open browser console (F12)
- Check for texture loading errors
- Verify texture paths match file names

### Model is too large/small
- Scale it before export in Three.js Editor or Blender
- Or use the "Adjust Size" panel in Blueprint3D

### Model has wrong orientation
- In Three.js Editor, rotate before export
- Or adjust rotation in Blueprint3D after placing

---

## 📁 File Structure

```
example/
├── models/
│   ├── js/
│   │   ├── your-model.js      ← Put model here
│   │   └── texture.png         ← Put textures here
│   └── thumbnails/
│       └── your-model-thumb.png ← Put thumbnail here
└── js/
    └── items.js                 ← Edit this to register model
```

---

## 💡 What's Your Model Name?

Tell me the name of your GLB/GLTF file and I can help you create the exact code to add it!
