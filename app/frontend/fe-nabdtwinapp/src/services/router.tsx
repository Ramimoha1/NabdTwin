import {Route , createBrowserRouter , createRoutesFromElements } from 'react-router-dom'
import LoginPage from "../pages/LoginPage.tsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<LoginPage />} />
        </Route>
    )
);

export  default router ;
