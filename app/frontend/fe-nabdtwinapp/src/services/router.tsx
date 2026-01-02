import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import LoginPage from "../pages/LoginPage";
import MapViewPage from "../pages/MapViewPage";
import InsightsPage from "../pages/InsightsPage";
import ReportsPage from "../pages/ReportsPage";
import NotFoundPage from "../pages/PageNotFound";
import MainLayout from "../layout/MainLayout";
import AdminPage from "../pages/AdminPage";
import AlertsSummaryPage from "../pages/AlertsSummaryPage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import DetailPage from "../pages/DetailPage";
import { VisualizationPage } from '../pages/VisualizationPage';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            {/* Login page at /login */}
            <Route index element={<LoginPage />} />

            {/* Main layout routes - all protected */}
            <Route element={<MainLayout />}>
                <Route path="homepage" element={
                    <ProtectedRoute>
                        <MapViewPage />
                    </ProtectedRoute>
                } />
                <Route path="branch/:id" element={
                    <ProtectedRoute requirePermission="viewInsights">
                        <DetailPage />
                    </ProtectedRoute>
                } />
                <Route path="insights" element={
                    <ProtectedRoute requirePermission="viewInsights">
                        <InsightsPage />
                    </ProtectedRoute>
                } />

                <Route path="reports" element={
                    <ProtectedRoute requirePermission="viewReports">
                        <ReportsPage />
                    </ProtectedRoute>
                } />
                <Route path="alerts" element={
                    <ProtectedRoute requirePermission="admin">
                        <AlertsSummaryPage />
                    </ProtectedRoute>
                } />
                <Route path="accounts" element={
                    <ProtectedRoute requirePermission="admin">
                        <AdminPage />
                    </ProtectedRoute>
                } />
                 <Route path="branch/visualization/:id" element={
                    <ProtectedRoute requirePermission="viewEmployees">
                        <VisualizationPage />
                    </ProtectedRoute>
                } />

            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    )
);

export default router;
