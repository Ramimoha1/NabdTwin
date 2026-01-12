import { Building2, Map, FileText, TrendingUp, Bell, LogOut, User as UserIcon, Users, Sparkles } from 'lucide-react'; // 1. Added Sparkles
import { Button } from '../externaluicomponents/button';
import { Separator } from '../externaluicomponents/separator';
import {useDispatch, useSelector} from "react-redux";
import {type RootState} from "../store/store";
import {logoutUser} from "../store/auth/authSlice";
import {useLocation, useNavigate} from "react-router-dom";
import { usePermissions } from '../hooks/usePermissions';
import { AlertsPanel } from './AlertsPanel';
import { useState } from 'react';

// 2. Added Props Interface
interface SidebarProps {
  onOpenAI?: () => void;
}

export function Sidebar({ onOpenAI }: SidebarProps) { // 3. Destructured Prop
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const location = useLocation();
    const [alertsPanelOpen, setAlertsPanelOpen] = useState(false);
    const { username, accountType } = useSelector((state: RootState) => state.auth);
    const { canViewReports, canViewInsights, isAdmin } = usePermissions();
    
    const menuItems = [
        { icon: Map, label: 'Map View', to: '/homepage', visible: true },
        { icon: TrendingUp, label: 'Insights', to: '/insights', visible: canViewInsights },
        { icon: FileText, label: 'Reports', to: '/reports', visible: canViewReports },
        { icon: Users, label: 'Accounts', to: '/accounts', visible: isAdmin }
    ];

    const handlLoggout = () => {
        dispatch(logoutUser())
        navigate("/", { replace: true });
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
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
                <button 
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                        <p className="truncate font-medium">{username}</p>
                        <p className="text-sm text-gray-500 capitalize">
                            {accountType === 'admin' ? 'Administrator' : 'User'}
                        </p>
                    </div>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    if (!item.visible) return null;

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

                 {isAdmin && (
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate('/alerts')}
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        Alert Settings
                    </Button>
                )}

                <Separator className="my-4" />

                {/* --- 4. NEW AI BUTTON (Matches your exact style) --- */}
                <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-gray-300"
                    onClick={onOpenAI}
                >
                    <Sparkles className="h-4 w-4 mr-2 text-blue-600" /> {/* Added color to icon only */}
                    AI Assistant
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-gray-300"
                    onClick={() => setAlertsPanelOpen(true)}
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

            {/* Alerts Side Panel */}
            <AlertsPanel open={alertsPanelOpen} onOpenChange={setAlertsPanelOpen} />
        </div>
    );
}

export default Sidebar;