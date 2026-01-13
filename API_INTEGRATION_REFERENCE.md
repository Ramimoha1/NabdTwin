# Floor Plan Editor - API Integration Reference

## API Endpoints

### 1. Branches API

#### Get All Branches
```
GET /api/branches
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Main Office",
    "attributes": {
      "name": "Main Office",
      "location": "Downtown"
    }
  }
]
```

**Used By**: EditVisualizationPage for branch selection dropdown

---

### 2. Employees API

#### Get Employees by Branch
```
GET /api/employees/branch/:branchId
```

**Parameters**:
- `branchId` - The branch ID to get employees for

**Response**:
```json
[
  {
    "id": "123",
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "Software Engineer",
    "role": "Developer",
    "email": "john.doe@example.com"
  }
]
```

**Used By**: FloorPlanEditorPage to populate employee dropdown

**Transformation**:
```typescript
const employeeOptions = data.map((emp: any) => ({
  id: emp.id.toString(),
  name: `${emp.firstName} ${emp.lastName}`,
  role: emp.jobTitle || emp.role || 'Employee'
}));
```

---

### 3. Floors API

#### Get Floors by Branch
```
GET /api/floors?filters[branch][id][$eq]={branchId}&populate=*
```

**Parameters**:
- `branchId` - Filter floors by branch ID

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Ground Floor",
        "floorNumber": 0,
        "description": "Main entrance and reception",
        "floors": "{\"floorplan\":{...},\"items\":[...]}"
      }
    }
  ]
}
```

**Used By**: EditVisualizationPage to display floor list

---

#### Get Single Floor
```
GET /api/floors/:id
```

**Parameters**:
- `id` - Floor ID

**Response**:
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Ground Floor",
      "floorNumber": 0,
      "description": "Main entrance",
      "floors": "{\"floorplan\":{\"corners\":{...},\"walls\":[...]},\"items\":[...]}"
    }
  }
}
```

**Used By**: FloorPlanEditorPage to load existing floor plan data

---

#### Create Floor
```
POST /api/floors
```

**Request Body**:
```json
{
  "data": {
    "name": "Ground Floor",
    "floorNumber": 0,
    "description": "Main entrance and reception",
    "branch": "1",
    "floors": null
  }
}
```

**Response**:
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Ground Floor",
      "floorNumber": 0,
      "description": "Main entrance and reception",
      "floors": null
    }
  }
}
```

**Used By**: EditVisualizationPage when creating new floor

---

#### Update Floor (Save Floor Plan)
```
PUT /api/floors/:id
```

**Request Body**:
```json
{
  "data": {
    "floors": "{\"floorplan\":{\"corners\":{...},\"walls\":[...]},\"items\":[...]}"
  }
}
```

**Note**: The `floors` field contains stringified JSON of the Blueprint3D floor plan data.

**Response**:
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Ground Floor",
      "floorNumber": 0,
      "floors": "{\"floorplan\":{...},\"items\":[...]}"
    }
  }
}
```

**Used By**: FloorPlanEditorPage when saving floor plan

---

#### Delete Floor
```
DELETE /api/floors/:id
```

**Parameters**:
- `id` - Floor ID to delete

**Response**:
```json
{
  "data": {
    "id": 1
  }
}
```

**Used By**: EditVisualizationPage when deleting floor

---

## Blueprint3D Floor Data Structure

The `floors` field stores stringified JSON with this structure:

```json
{
  "floorplan": {
    "corners": {
      "corner-id-1": {
        "x": 204.85,
        "y": 289.05
      },
      "corner-id-2": {
        "x": 672.21,
        "y": 289.05
      }
    },
    "walls": [
      {
        "corner1": "corner-id-1",
        "corner2": "corner-id-2",
        "frontTexture": {
          "url": "rooms/textures/wallmap.png",
          "stretch": true,
          "scale": 0
        },
        "backTexture": {
          "url": "rooms/textures/wallmap.png",
          "stretch": true,
          "scale": 0
        }
      }
    ],
    "wallTextures": [],
    "floorTextures": {},
    "newFloorTextures": {}
  },
  "items": [
    {
      "item_name": "Employee",
      "item_type": 1,
      "model_url": "models/js/employeemodel.js",
      "xpos": 100,
      "ypos": 0,
      "zpos": 150,
      "rotation": 0,
      "scale_x": 1,
      "scale_y": 1,
      "scale_z": 1,
      "fixed": false,
      "metadata": {
        "itemName": "Employee",
        "employeeId": "123"
      }
    }
  ]
}
```

## PostMessage Protocol

Communication between React and Blueprint Editor iframe:

### Messages from React → Editor

#### 1. Initialize Editor
```javascript
{
  type: 'INIT_DATA',
  employees: [
    { id: '123', name: 'John Doe', role: 'Engineer' }
  ],
  floorData: { floorplan: {...}, items: [...] }
}
```

#### 2. Trigger Save
```javascript
{
  type: 'TRIGGER_SAVE'
}
```

#### 3. Update Employees
```javascript
{
  type: 'EMPLOYEES_DATA',
  employees: [
    { id: '123', name: 'John Doe', role: 'Engineer' }
  ]
}
```

#### 4. Save Status
```javascript
// Success
{
  type: 'SAVE_SUCCESS'
}

// Error
{
  type: 'SAVE_ERROR',
  error: 'Failed to save floor plan'
}
```

---

### Messages from Editor → React

#### 1. Editor Ready
```javascript
{
  type: 'READY'
}
```

#### 2. Request Save
```javascript
{
  type: 'REQUEST_SAVE',
  data: {
    floorplan: {...},
    items: [...]
  }
}
```

#### 3. Request Employees
```javascript
{
  type: 'REQUEST_EMPLOYEES'
}
```

---

## Authentication

All API requests require authentication via Bearer token:

```typescript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

The token is stored in localStorage after login.

---

## Error Handling

### API Errors

**Example Error Response**:
```json
{
  "error": {
    "status": 403,
    "name": "ForbiddenError",
    "message": "Forbidden"
  }
}
```

**Handling in Code**:
```typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Failed to fetch:', error);
  toast.error('Failed to load data');
}
```

---

## Data Flow Diagram

```
User Action
    ↓
EditVisualizationPage
    ↓
    ├─→ GET /api/branches (Load branches)
    │
    ├─→ GET /api/floors?filters[branch][id][$eq]={id} (Load floors)
    │
    └─→ POST /api/floors (Create floor)
         ↓
    Click "Edit Floor Plan"
         ↓
FloorPlanEditorPage
    ↓
    ├─→ GET /api/employees/branch/{branchId} (Load employees)
    │
    ├─→ GET /api/floors/{id} (Load floor data)
    │
    └─→ PostMessage: INIT_DATA → Blueprint Editor
         ↓
    User Edits in Blueprint Editor
         ↓
    Click "Save"
         ↓
    PostMessage: REQUEST_SAVE → React
         ↓
    PUT /api/floors/{id} (Save floor JSON)
         ↓
    PostMessage: SAVE_SUCCESS → Editor
         ↓
    Toast: "Floor plan saved successfully"
```

---

## Testing API Endpoints

### Using cURL

**Get Branches**:
```bash
curl -X GET "http://localhost:3001/api/branches" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Employees**:
```bash
curl -X GET "http://localhost:3001/api/employees/branch/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Floors**:
```bash
curl -X GET "http://localhost:3001/api/floors?filters[branch][id][\$eq]=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Floor**:
```bash
curl -X POST "http://localhost:3001/api/floors" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Test Floor",
      "floorNumber": 0,
      "description": "Test",
      "branch": "1",
      "floors": null
    }
  }'
```

**Update Floor**:
```bash
curl -X PUT "http://localhost:3001/api/floors/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "floors": "{\"floorplan\":{},\"items\":[]}"
    }
  }'
```

---

## Performance Considerations

1. **Floor Data Size**: Blueprint3D JSON can be large (10KB-100KB+)
   - Consider compression for storage
   - Consider pagination for floor lists

2. **Employee List**: Cache employee data on client
   - Refresh only when branch changes
   - Consider using React Query for caching

3. **Auto-Save**: Implement auto-save timer in editor
   - Save every 30 seconds if changes detected
   - Debounce save requests

4. **Loading States**: Always show loading indicators
   - Prevents duplicate requests
   - Better user experience

---

This reference covers all API integrations used by the Floor Plan Editor feature.
