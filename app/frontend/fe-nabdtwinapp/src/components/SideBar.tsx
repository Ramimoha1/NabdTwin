import { Building2, Map, FileText, TrendingUp, Bell, LogOut, User as UserIcon, Users } from 'lucide-react';
// import { User } from '../App';
import { Button } from '../externaluicomponents/button';
import { Badge } from '../externaluicomponents/badge';
import { Separator } from '../externaluicomponents/separator';
// import { ViewType } from './Dashboard';
// import { mockAlerts } from '../data/mockData';

// interface SidebarProps {
//     user: User;
//     currentView: ViewType;
//     onNavigateToMap: () => void;
//     onNavigateToReports: () => void;
//     onNavigateToInsights: () => void;
//     onNavigateToAccounts: () => void;
//     onToggleAlerts: () => void;
//     onLogout: () => void;
// }

export function Sidebar(
    // {
    //                         user,
    //                         currentView,
    //                         onNavigateToMap,
    //                         onNavigateToReports,
    //                         onNavigateToInsights,
    //                         onNavigateToAccounts,
    //                         onToggleAlerts,
    //                         onLogout
    //                     }: SidebarProps
) {
    // const unreadAlerts = mockAlerts.filter(a => !a.read).length;

    // const menuItems = [
    //     { icon: Map, label: 'Map View', view: 'map' as ViewType, onClick: onNavigateToMap, adminOnly: false },
    //     { icon: TrendingUp, label: 'Insights', view: 'insights' as ViewType, onClick: onNavigateToInsights, adminOnly: false },
    //     { icon: FileText, label: 'Reports', view: 'reports' as ViewType, onClick: onNavigateToReports, adminOnly: false },
    //     { icon: Users, label: 'Accounts', view: 'accounts' as ViewType, onClick: onNavigateToAccounts, adminOnly: true }
    // ];


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
                        <p className="truncate">{
                            // user.name
                        }</p>
                        <p className="text-sm text-gray-500 capitalize">
                            {
                                // user.role === 'admin' ? 'Administrator' : 'User'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {/*{menuItems.map((item) => {*/}
                {/*    // Hide admin-only items from non-admin users*/}
                {/*    if (item.adminOnly && user.role !== 'admin') return null;*/}

                {/*    return (*/}
                {/*        <Button*/}
                {/*            key={item.view}*/}
                {/*            variant={currentView === item.view ? 'secondary' : 'ghost'}*/}
                {/*            className="w-full justify-start"*/}
                {/*            onClick={item.onClick}*/}
                {/*        >*/}
                {/*            <item.icon className="h-4 w-4 mr-2" />*/}
                {/*            {item.label}*/}
                {/*        </Button>*/}
                {/*    );*/}
                {/*})}*/}

                <Separator className="my-4" />

                {/*<Button*/}
                {/*    variant="ghost"*/}
                {/*    className="w-full justify-start relative"*/}
                {/*    onClick={*/}
                {/*    // onToggleAlerts*/}
                {/*}*/}
                {/*>*/}
                {/*    <Bell className="h-4 w-4 mr-2" />*/}
                {/*    Alerts*/}
                    {/*/!*{unreadAlerts > 0 && (*!/*/}
                {/*    /!*    <Badge className="ml-auto bg-red-500">{unreadAlerts}</Badge>*!/*/}
                {/*    /!*)}*!/*/}
                {/*</Button>*/}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                {/*<Button*/}
                {/*    variant="ghost"*/}
                {/*    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"*/}
                {/*    onClick={*/}
                {/*    // onLogout*/}
                {/*}*/}
                {/*>*/}
                {/*    <LogOut className="h-4 w-4 mr-2" />*/}
                {/*    Logout*/}
                {/*</Button>*/}
            </div>
        </div>
    );
}