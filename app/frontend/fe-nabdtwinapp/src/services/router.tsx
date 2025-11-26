import {Route , createBrowserRouter , createRoutesFromElements } from 'react-router-dom'
import LoginPage from "../pages/LoginPage.tsx";
import HomePage from "../pages/HomePage.tsx";
import InsightsPage from "../pages/InsightsPage.tsx";
import ReportsPage from "../pages/ReportsPage.tsx";
import AccountsPage from "../pages/AccountsPage.tsx";
import NotFoundaPge from "../pages/PageNotFound.tsx";
import MainLayout from "../layout/MainLayout.tsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/">
            <Route index element={<LoginPage />} />
            <Route element={<MainLayout/>} >
                <Route path = "/homepage" element={<HomePage/>}/>
                <Route path = "/insights" element={<InsightsPage/>}/>
                <Route path = "/Reports" element={<ReportsPage/>}/>
                <Route path = "/Accounts" element={<AccountsPage/>}/>
        </Route>
            <Route path="*" element = {<NotFoundaPge/>}/>


        </Route>
    )
);

export  default router ;
