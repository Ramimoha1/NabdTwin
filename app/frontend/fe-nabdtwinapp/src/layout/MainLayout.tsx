import {Outlet} from "react-router-dom";
import Sidebar from "../components/sidebar.tsx";

function MainLayout() {
    return (<>
            <Sidebar/>
            <Outlet/>
    </>

    );
}

export default MainLayout;