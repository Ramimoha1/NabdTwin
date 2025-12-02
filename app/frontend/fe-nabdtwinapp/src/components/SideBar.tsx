import { Building2, Map, FileText, TrendingUp, Bell, LogOut, User as UserIcon, Users } from 'lucide-react';
import { Button } from '../externaluicomponents/button';
import { Separator } from '../externaluicomponents/separator';
import {useDispatch, useSelector} from "react-redux";
import {type RootState} from "../store/store.ts";
import {logoutUser} from "../store/auth/authSlice.ts";
import {Link, useLocation, useNavigate} from "react-router-dom";

export function Sidebar() {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const location = useLocation();
    console.log(location.pathname)
    const { username, accountType } = useSelector((state: RootState) => state.auth);

    const menuItems = [
        { icon: Map, label: 'Map View', to: '/homepage', adminOnly: false },
        { icon: TrendingUp, label: 'Insights', to: '/insights', adminOnly: false },
        { icon: FileText, label: 'Reports', to: '/reports', adminOnly: false },
        { icon: Users, label: 'Accounts', to: '/accounts', adminOnly: true }
    ];
    const handlLoggout = () => {
        dispatch(logoutUser())
        navigate("/", { replace: true });
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl">NabdTwin</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Organizational Platform</p>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate">{username}</p>
                        <p className="text-sm text-gray-500 capitalize">
                            {accountType === 'admin' ? 'Administrator' : 'User'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    if (item.adminOnly && accountType !== 'admin') return null;

                    return (
                        <Button
                            key={item.to}
                            variant={location.pathname.startsWith(item.to)  ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => navigate(item.to)}
                        >
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.label}
                        </Button>
                    );
                })}

                <Separator className="my-4" />

                <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-gray-300"
                >
                    <Bell className="h-4 w-4 mr-2" />
                    Alerts
                </Button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handlLoggout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

export default Sidebar;