import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { selectIslogin } from "../../store/auth/authSelector.ts";

export default function ProtectedRoute() {
    const isLoggedIn = useSelector(selectIslogin);

    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
