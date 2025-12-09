import { APIProvider, Map as GoogleMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useState, useEffect, useRef } from "react";
import { MapPin, DollarSign, Users, Activity, TrendingUp } from "lucide-react";
import { Card } from "../externaluicomponents/Card";
import { Badge } from "../externaluicomponents/badge";
import type { Branch } from "../model";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleMap = any;

function getPerformanceColor(performance: string) {
    switch (performance) {
        case "excellent":
            return "bg-green-500";
        case "good":
            return "bg-blue-500";
        case "average":
            return "bg-yellow-500";
        case "poor":
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
}


function getPerformanceBadgeColor(performance: string) {
    switch (performance) {
        case "excellent":
            return "bg-green-100 text-green-800";
        case "good":
            return "bg-blue-100 text-blue-800";
        case "average":
            return "bg-yellow-100 text-yellow-800";
        case "poor":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function Map({ branches }: { branches: Branch[] }) {
    const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
    const mapRef = useRef<GoogleMap | null>(null);
    
    // Default center: Riyadh, Saudi Arabia
    const defaultCenter = { lat: 24.7136, lng: 46.6753 };
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Auto-fit map bounds to show all branches
    useEffect(() => {
        if (!mapRef.current || branches.length === 0 || typeof GoogleMap === 'undefined') return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bounds = new (GoogleMap as any).maps.LatLngBounds();
        branches.forEach((branch) => {
            bounds.extend({
                lat: branch.location.lat,
                lng: branch.location.lng,
            });
        });

        // Fit the map to bounds with some padding
        mapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }, [branches]);

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap 
                defaultCenter={defaultCenter} 
                defaultZoom={6} 
                mapId={import.meta.env.VITE_MAP_ID}
                onLoad={(map: GoogleMap) => { mapRef.current = map; }}
            >
                {branches.map((branch) => (
                    <AdvancedMarker
                        key={branch.id}
                        position={{ lat: branch.location.lat, lng: branch.location.lng }}
                        zIndex={hoveredBranch === branch.id ? 1000 : 1}
                    >
                        <div
                            className="relative cursor-pointer"
                            onMouseEnter={() => setHoveredBranch(branch.id)}
                            onMouseLeave={() => setHoveredBranch(null)}
                            onClick={() => console.log("Clicked branch:", branch.name)}
                            style={{ zIndex: hoveredBranch === branch.id ? 1000 : 1 }}
                        >
                            {/* Marker */}
                            <div
                                className={`h-12 w-12 rounded-full ${getPerformanceColor(
                                    branch.performance
                                )} flex items-center justify-center shadow-lg ring-4 ring-white transition-transform hover:scale-110`}
                            >
                                <MapPin className="h-6 w-6 text-white" />
                            </div>

                            {/* Hover popup - appears above the marker */}
                            {hoveredBranch === branch.id && (
                                <Card className="absolute bottom-16 left-1/2 transform -translate-x-1/2 p-4 w-64 shadow-xl pointer-events-none"
                                    style={{ zIndex: 9999 }}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="mb-1 font-semibold">{branch.name}</h3>
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
