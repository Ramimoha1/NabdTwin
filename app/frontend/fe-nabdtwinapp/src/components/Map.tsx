import { APIProvider, Map as GoogleMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useState } from "react";
import { MapPin, DollarSign, Users, Activity, TrendingUp } from "lucide-react";
import { Card } from "../externaluicomponents/Card";
import { Badge } from "../externaluicomponents/badge";
import type { Branch } from "../model";

function getPerformanceColor(performance: string) {
    switch (performance) {
        case "High":
            return "bg-green-500";
        case "Medium":
            return "bg-yellow-500";
        case "Low":
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
}


function getPerformanceBadgeColor(performance: string) {
    switch (performance) {
        case "High":
            return "bg-green-100 text-green-800";
        case "Medium":
            return "bg-yellow-100 text-yellow-800";
        case "Low":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function Map({ branches }: { branches: Branch[] }) {
    const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
    const position = { lat: 30.0444, lng: 31.2357 };
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap defaultCenter={position} defaultZoom={10} mapId={import.meta.env.VITE_MAP_ID}>
                {branches.map((branch) => (
                    <AdvancedMarker
                        key={branch.id}
                        position={{ lat: branch.location.lat, lng: branch.location.lng }}
                    >
                        <div
                            className="relative cursor-pointer"
                            onMouseEnter={() => setHoveredBranch(branch.id)}
                            onMouseLeave={() => setHoveredBranch(null)}
                            onClick={() => console.log("Clicked branch:", branch.name)}
                        >
                            {/* Marker */}
                            <div
                                className={`h-12 w-12 rounded-full ${getPerformanceColor(
                                    branch.performance
                                )} flex items-center justify-center shadow-lg ring-4 ring-white transition-transform hover:scale-110`}
                            >
                                <MapPin className="h-6 w-6 text-white" />
                            </div>

                            {/* Hover popup */}
                            {hoveredBranch === branch.id && (
                                <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-4 w-64 shadow-xl z-10">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="mb-1">{branch.name}</h3>
                                                <p className="text-sm text-gray-500">{branch.location.address}</p>
                                            </div>
                                            <Badge className={getPerformanceBadgeColor(branch.performance)}>
                                                {branch.performance}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Revenue</p>
                                                    <p className="text-sm">{formatCurrency(branch.kpis.revenue)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Employees</p>
                                                    <p className="text-sm">{branch.kpis.employees}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-purple-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Productivity</p>
                                                    <p className="text-sm">{branch.kpis.productivity}%</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-orange-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Growth</p>
                                                    <p className="text-sm">+{branch.kpis.growth}%</p>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 pt-2 border-t">
                                            Click to explore branch details
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </AdvancedMarker>
                ))}
            </GoogleMap>
        </APIProvider>
    );
}

export default Map;
