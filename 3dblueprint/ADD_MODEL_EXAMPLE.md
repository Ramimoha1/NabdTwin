# Quick Example: Adding a Desk Model

## 1. Find a Three.js Model
Download from:
- https://threejs.org/examples/ (check examples folder)
- https://clara.io (export as Three.js JSON)
- Use existing models in `example/models/js/`

## 2. Add to items.js

Edit `example/js/items.js` and add:

```javascript
{
  "name": "Office Desk",
  "image": "models/thumbnails/desk-thumb.png",
  "model": "models/js/office-desk.js",
  "type": "1"
}
```

## 3. Create a Thumbnail (Optional)
- Take a screenshot of your model
- Save as PNG in `models/thumbnails/`
- Size: ~200x200px works well

## 4. Model Format Example

Your `.js` file should look like:

```javascript
{
  "metadata": {
    "formatVersion": 3.1,
    "type": "Geometry"
  },
  "vertices": [...],
  "faces": [...],
  "uvs": [[]],
  "materials": [...]
}
```

## 5. Testing

1. Stop server (Ctrl+C)
2. Restart: `python -m http.server 8000`
3. Refresh browser
4. Check "Add Items" tab
5. Drag your model into the scene

## 6. Troubleshooting

**Model doesn't appear:**
- Check console (F12) for errors
- Verify file path is correct
- Ensure `.js` file is valid JSON/Three.js format

**Model is too big/small:**
- Adjust scale in Blender before export
- Or use the "Adjust Size" panel in Blueprint3D

**Model has no texture:**
- Ensure texture images are in `models/js/` folder
- Check material definitions in `.js` file
- Textures must be referenced correctly in model file
