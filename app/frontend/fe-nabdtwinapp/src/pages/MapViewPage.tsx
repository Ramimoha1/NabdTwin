import MainPageHeader from "../components/MainPageHeader.tsx";
import {Badge} from "../externaluicomponents/badge.tsx";
import {Card} from "../externaluicomponents/Card.tsx";
import {Activity, DollarSign, MapPin, TrendingUp, Users} from "lucide-react";
import {getBranches} from "../services/API/branches.ts";
import {useQuery} from "@tanstack/react-query";
import type {Branch} from "../model";
import {useState} from "react";
import {PerformanceHeatmap} from "../components/PerformanceHeatMap.tsx";
import Map from "../components/Map.tsx";

function MapViewPage() {
    const title = "HomePage";
    const description = "Welcome to the HomePage";
    const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);

    const {  data , isLoading, isError, error } =  useQuery<Branch[]>({
        queryKey: ["branches"],
        queryFn: getBranches,
    });

    const branches: Branch[] = data ?? [];


    if (isLoading) return <p>Loading...wait bro</p>;
    if (isError) return <p>Error! {error}</p>;

    const getPerformanceColor = (performance: string) => {
        switch (performance) {
            case 'excellent':
                return 'bg-green-500';
            case 'good':
                return 'bg-blue-500';
            case 'average':
                return 'bg-yellow-500';
            case 'poor':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getPerformanceBadgeColor = (performance: string) => {
        switch (performance) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'average':
                return 'bg-yellow-100 text-yellow-800';
            case 'poor':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
    <div className="w-auto h-full flex flex-col">
        {/* Header */}
        <MainPageHeader title={title} description={description} />

        <div className="flex-1 flex">
            {/* Map Area */}
            <div className="flex-1 p-6 overflow-auto">
                <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg border border-gray-200 h-full min-h-[600px] relative">
                    {/* Mock Map Visualization  need to be replaced with Google map api*/}
                    <Map branches={branches}></Map>
                    {/*<div className="absolute inset-0 p-8">*/}
                    {/*    <div className="relative h-full w-full">*/}
                    {/*        /!* Grid background for map effect *!/*/}
                    {/*        <div className="absolute inset-0 opacity-10"*/}
                    {/*             style={{*/}
                    {/*                 backgroundImage: `linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)`,*/}
                    {/*                 backgroundSize: '50px 50px'*/}
                    {/*             }}*/}
                    {/*        />*/}

                    {/*        /!* Branch markers *!/*/}
                    {/*        {branches?.map((branch, index) => {*/}
                    {/*            const positions = [*/}
                    {/*                { top: '30%', left: '50%' }, // Cairo*/}
                    {/*                { top: '20%', left: '40%' }, // Alexandria*/}
                    {/*                { top: '35%', left: '45%' }, // Giza*/}
                    {/*                { top: '15%', left: '60%' }, // Mansoura*/}
                    {/*                { top: '70%', left: '65%' }  // Aswan*/}
                    {/*            ];*/}
                    {/*            const pos = positions[index] || { top: '50%', left: '50%' };*/}

                    {/*            return (*/}
                    {/*                <div*/}
                    {/*                    key={branch.id}*/}
                    {/*                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"*/}
                    {/*                    style={pos}*/}
                    {/*                    onMouseEnter={() => setHoveredBranch(branch.id)}*/}
                    {/*                    onMouseLeave={() => setHoveredBranch(null)}*/}
                    {/*                    onClick={() => {*/}
                    {/*                        console.log("clickyy haha")*/}
                    {/*                    }}*/}
                    {/*                >*/}
                    {/*                    /!* Marker *!/*/}
                    {/*                    <div className="relative">*/}
                    {/*                        <div className={`h-12 w-12 rounded-full ${getPerformanceColor(branch.performance)} flex items-center justify-center shadow-lg ring-4 ring-white`}>*/}
                    {/*                            <MapPin className="h-6 w-6 text-white" />*/}
                    {/*                        </div>*/}

                    {/*                        /!* Hover popup *!/*/}
                    {/*                        {hoveredBranch === branch.id && (*/}
                    {/*                            <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-4 w-64 shadow-xl z-10">*/}
                    {/*                                <div className="space-y-2">*/}
                    {/*                                    <div className="flex items-start justify-between">*/}
                    {/*                                        <div>*/}
                    {/*                                            <h3 className="mb-1">{branch.name}</h3>*/}
                    {/*                                            <p className="text-sm text-gray-500">{branch.location.address}</p>*/}
                    {/*                                        </div>*/}
                    {/*                                        <Badge className={getPerformanceBadgeColor(branch.performance)}>*/}
                    {/*                                            {branch.performance}*/}
                    {/*                                        </Badge>*/}
                    {/*                                    </div>*/}
                    {/*                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">*/}
                    {/*                                        <div className="flex items-center gap-2">*/}
                    {/*                                            <DollarSign className="h-4 w-4 text-green-600" />*/}
                    {/*                                            <div>*/}
                    {/*                                                <p className="text-xs text-gray-500">Revenue</p>*/}
                    {/*                                                <p className="text-sm">{formatCurrency(branch.kpis.revenue)}</p>*/}
                    {/*                                            </div>*/}
                    {/*                                        </div>*/}
                    {/*                                        <div className="flex items-center gap-2">*/}
                    {/*                                            <Users className="h-4 w-4 text-blue-600" />*/}
                    {/*                                            <div>*/}
                    {/*                                                <p className="text-xs text-gray-500">Employees</p>*/}
                    {/*                                                <p className="text-sm">{branch.kpis.employees}</p>*/}
                    {/*                                            </div>*/}
                    {/*                                        </div>*/}
                    {/*                                        <div className="flex items-center gap-2">*/}
                    {/*                                            <Activity className="h-4 w-4 text-purple-600" />*/}
                    {/*                                            <div>*/}
                    {/*                                                <p className="text-xs text-gray-500">Productivity</p>*/}
                    {/*                                                <p className="text-sm">{branch.kpis.productivity}%</p>*/}
                    {/*                                            </div>*/}
                    {/*                                        </div>*/}
                    {/*                                        <div className="flex items-center gap-2">*/}
                    {/*                                            <TrendingUp className="h-4 w-4 text-orange-600" />*/}
                    {/*                                            <div>*/}
                    {/*                                                <p className="text-xs text-gray-500">Growth</p>*/}
                    {/*                                                <p className="text-sm">+{branch.kpis.growth}%</p>*/}
                    {/*                                            </div>*/}
                    {/*                                        </div>*/}
                    {/*                                    </div>*/}
                    {/*                                    <p className="text-xs text-gray-500 pt-2 border-t">*/}
                    {/*                                        Click to explore branch details*/}
                    {/*                                    </p>*/}
                    {/*                                </div>*/}
                    {/*                            </Card>*/}
                    {/*                        )}*/}
                    {/*                    </div>*/}
                    {/*                </div>*/}
                    {/*            );*/}
                    {/*        })}*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>

            {/* Side Panel - Performance Summary */}
            <div className="w-80 p-6 bg-white border-l border-gray-200 overflow-auto">
                <h2 className="text-xl mb-4">Performance Overview</h2>

                <PerformanceHeatmap branches={branches} />

                <div className="mt-6 space-y-3">
                    <h3 className="text-sm text-gray-600 uppercase tracking-wide">All Branches</h3>
                    {branches?.map((branch) => (
                        <Card
                            key={branch.id}
                            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                                console.log("clickyy haha")
                            }}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium">{branch.name}</h4>
                                <Badge className={getPerformanceBadgeColor(branch.performance)}>
                                    {branch.performance}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{branch.location.address}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Revenue:</span>
                                    <p>{formatCurrency(branch.kpis.revenue)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Employees:</span>
                                    <p>{branch.kpis.employees}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    </div>
    );
}

export default MapViewPage;