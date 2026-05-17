# NabdTwin Frontend

Modern React-based dashboard for organizational management and performance tracking with real-time branch visualization and comprehensive permission system.

## 🚀 Features

- **Interactive Map View**: Google Maps integration with real-time KPI data
- **Permission-Based Access**: Role-based UI with granular permissions
- **User Management**: Complete admin panel for users and permissions
- **Real-time Data**: Strapi v5 backend integration
- **Responsive Design**: Mobile-friendly Tailwind CSS UI

## 📋 Prerequisites

- Node.js 18+
- Strapi v5 backend running (default: `http://localhost:3001`)
- Google Maps API Key

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Configure environment (use repo root `.env.example`)
# From the repository root run:
# cp .env.example .env
# Edit `.env` with your API keys

# Start development server
npm run dev
```

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (routes)
├── services/      # API and business logic
├── store/         # Redux state management
├── hooks/         # Custom React hooks
└── model/         # TypeScript interfaces
```

## 🔐 Permissions System

- **Branch Permissions**: Control which branches users can view
- **Feature Permissions**: `viewReports`, `viewInsights`, `viewEmployees`
- **Admin Role**: Full system access

See `app/docs/frontend/PERMISSIONS.md` for details (if present).

## 🐛 Troubleshooting

**Failed to fetch branches**: Check backend running and `.env` API URL  
**Access Denied**: Verify user permissions in Strapi admin  
**Map not loading**: Check `VITE_GOOGLE_MAPS_API_KEY` is set

## 👥 Team

- **Rami** - Data Schema Management
- **Ammar** - KPI and Metric Calculation
- **Ali** - Google Maps and Floor Visualization
- **Amr** - Authentication & JWT
- **Nouredin** - Dashboard Visualization Module
