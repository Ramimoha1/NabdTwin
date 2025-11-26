import {Outlet} from "react-router-dom";
import {Sidebar} from "../components/SideBar.tsx";

function MainLayout(props) {
    return (<>
            <Sidebar/>
            <Outlet/>
    </>

    );
}

export default MainLayout;