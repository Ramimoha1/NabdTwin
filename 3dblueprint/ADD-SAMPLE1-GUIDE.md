# Adding sample1.obj to Blueprint3D

## ✅ Quick Steps

### Step 1: Convert OBJ to Three.js JSON

**Go to Three.js Editor:**
🌐 https://threejs.org/editor/

1. Click **File → Import**
2. Browse to: `c:\Users\engra\Downloads\sample1.obj`
3. Click **Open**
4. You'll see your model in the 3D view

**Adjust if needed:**
- Rotate: Use rotation tools if orientation is wrong
- Scale: Adjust size if too big/small

**Export:**
5. Click on the model (to select it)
6. Click **File → Export Object**
7. Save as: `sample1.json` (to your Downloads folder)

---

### Step 2: Copy to Blueprint3D

**Copy the converted file:**

FROM: `c:\Users\engra\Downloads\sample1.json`
TO:   `c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example\models\js\sample1.js`

⚠️ **Important:** Rename `.json` to `.js` when copying!

**PowerShell command (run this):**
```powershell
Copy-Item "c:\Users\engra\Downloads\sample1.json" "c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example\models\js\sample1.js"
```

---

### Step 3: Add to items.js

**Edit this file:**
`c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example\js\items.js`

**Find the `var items = [` array and add:**

```javascript
{
  "name": "Sample Model",
  "image": "models/thumbnails/thumbnail_Church-Chair-oak-white_1024x1024.jpg",  // Use existing thumbnail temporarily
  "model": "models/js/sample1.js",
  "type": "1"
}
```

Add this BEFORE the last closing `]` and make sure there's a comma after the previous item.

---

### Step 4: Restart Server & Test

**In terminal:**
```powershell
cd c:\Users\engra\WebstormProjects\Application-development\3dblueprint\public\blueprint3d\example
python -m http.server 8000
```

**In browser:**
1. Open: http://localhost:8000
2. Click "Add Items" tab
3. Look for "Sample Model"
4. Drag it into your 3D scene

---

## 🎯 Once you've converted the file, let me know and I'll help add it to items.js!
