import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import LoginPage from "../../pages/LoginPage.tsx";
import MapViewPage from "../../pages/MapViewPage.tsx";
import InsightsPage from "../../pages/InsightsPage.tsx";
import ReportsPage from "../../pages/ReportsPage.tsx";
import NotFoundPage from "../../pages/PageNotFound.tsx";
import MainLayout from "../../layout/MainLayout.tsx";
import AdminPage from "../../pages/AdminPage.tsx";
import ProtectedRoute from "./ProtectedRoutes.tsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="homepage" element={<MapViewPage />} />
                    <Route path="insights" element={<InsightsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="/accounts" element={<AdminPage />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
        </Route>
    )
);

export default router;