# Floor Plan Editor - Deployment Instructions

## Pre-Deployment Checklist

### Backend (Strapi)
- [x] Floor schema updated with `floors` JSON field
- [ ] Database migration completed
- [ ] Employee API endpoint accessible
- [ ] Floor API endpoints working

### Frontend (React)
- [x] New pages created
- [x] Sidebar updated
- [x] Routes configured
- [x] Blueprint editor copied to public folder
- [ ] Frontend build completed

## Deployment Steps

### Step 1: Backend Deployment

```bash
cd app/backend/be-nabdtwin-strapi
npm run build
```

This will:
- Rebuild TypeScript types
- Apply schema changes to database
- Update the Floor content type

### Step 2: Frontend Deployment

```bash
cd app/frontend/fe-nabdtwinapp
npm run build
```

This will:
- Compile TypeScript
- Bundle React app
- Copy public assets (including blueprint-editor)

### Step 3: Verify Installation

1. **Check Backend**:
   ```bash
   # In backend directory
   npm run develop
   ```
   - Navigate to Strapi admin: `http://localhost:3001/admin`
   - Go to Content-Type Builder
   - Find "Floor" content type
   - Verify "floors" field exists (type: JSON)

2. **Check Frontend**:
   ```bash
   # In frontend directory
   npm run dev
   ```
   - Navigate to app: `http://localhost:5173`
   - Login as admin
   - Verify "Edit Visualization" appears in sidebar

3. **Check Blueprint Editor**:
   - Navigate directly to: `http://localhost:5173/blueprint-editor/index.html`
   - Editor should load successfully
   - Check browser console for any errors

### Step 4: Database Migration (if needed)

If the `floors` field doesn't appear automatically:

1. **Option A: Use Strapi Admin**
   - Go to Content-Type Builder
   - Edit Floor content type
   - Add field: `floors` (type: JSON)
   - Save and restart

2. **Option B: Manual Schema Update**
   - The schema file is already updated
   - Run: `npm run build` in backend
   - Restart Strapi

### Step 5: Test Complete Flow

1. **Login as Admin**
2. **Navigate to Edit Visualization**
3. **Select a Branch**
4. **Create a Test Floor**:
   - Name: "Test Floor"
   - Number: 0
   - Description: "Testing floor editor"
5. **Click "Edit Floor Plan"**
6. **Verify**:
   - Editor loads in iframe
   - Can draw walls
   - Can add items
   - Employee dropdown appears when selecting employee model
7. **Save Floor Plan**
8. **Verify save success message**
9. **Go back and verify floor shows "Has Floor Plan" badge**

## Environment Variables

Ensure these are set correctly:

### Backend (.env)
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=nabdtwin_strapi
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=ramibest123
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

## Common Deployment Issues

### Issue: "Cannot find module EditVisualizationPage"
**Solution**: Ensure you've built the frontend:
```bash
npm run build
```

### Issue: "Floor schema missing 'floors' field"
**Solution**: 
1. Check schema.json is updated
2. Run `npm run build` in backend
3. Restart Strapi server

### Issue: "Blueprint editor not loading"
**Solution**:
1. Verify blueprint-editor folder exists in public/
2. Check browser console for 404 errors
3. Ensure all assets were copied correctly

### Issue: "Employee dropdown is empty"
**Solution**:
1. Verify employees exist for the selected branch
2. Check Employee API endpoint: `GET /api/employees/branch/{branchId}`
3. Check browser console for API errors

### Issue: "CORS errors in console"
**Solution**:
1. Verify Strapi CORS settings in `config/middlewares.ts`
2. Ensure frontend origin is allowed

## Production Deployment

### Additional Considerations

1. **Security**:
   - Ensure HTTPS is enabled
   - Configure Strapi security middleware
   - Set proper CORS origins (no wildcards)

2. **Performance**:
   - Enable Gzip compression
   - Configure CDN for static assets
   - Optimize blueprint-editor assets

3. **Monitoring**:
   - Set up error tracking (Sentry, etc.)
   - Monitor API response times
   - Track floor plan save success rates

4. **Backup**:
   - Regular database backups (floors table)
   - Store blueprint JSON separately for disaster recovery

### Production Environment Variables

```env
# Backend
NODE_ENV=production
DATABASE_SSL=true
HOST=0.0.0.0
PORT=3001

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

## Post-Deployment Verification

### Checklist:
- [ ] Admin can access Edit Visualization
- [ ] Branch selector works
- [ ] Floor list loads correctly
- [ ] Can create new floor
- [ ] Can edit existing floor
- [ ] Blueprint editor loads
- [ ] Can draw walls
- [ ] Can add furniture
- [ ] Employee dropdown populates
- [ ] Can assign employees
- [ ] Save functionality works
- [ ] Go back button works
- [ ] Delete floor works

## Rollback Plan

If issues occur after deployment:

1. **Backend Rollback**:
   ```bash
   git checkout HEAD~1 -- app/backend/be-nabdtwin-strapi/src/api/floor/content-types/floor/schema.json
   npm run build
   ```

2. **Frontend Rollback**:
   ```bash
   git checkout HEAD~1 -- app/frontend/fe-nabdtwinapp/src
   npm run build
   ```

3. **Database Rollback**:
   - Remove `floors` column from floors table (if needed)
   - Or keep column but it won't be used

## Support

For issues during deployment:

1. Check implementation docs: [FLOOR_EDITOR_IMPLEMENTATION.md](FLOOR_EDITOR_IMPLEMENTATION.md)
2. Check user guide: [EDIT_VISUALIZATION_GUIDE.md](EDIT_VISUALIZATION_GUIDE.md)
3. Review browser console for errors
4. Check Strapi logs: `npm run develop` (backend)
5. Check Vite logs: `npm run dev` (frontend)

---

**Ready to Deploy!** Follow the steps above in order for a smooth deployment.
