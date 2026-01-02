import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";

function MainLayout() {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto ">
                    <div className="container mx-auto px-0 py-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default MainLayout;