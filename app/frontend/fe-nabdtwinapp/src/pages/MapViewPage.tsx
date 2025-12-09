import MainPageHeader from "../components/MainPageHeader.tsx";
import {Badge} from "../externaluicomponents/badge.tsx";
import {Card} from "../externaluicomponents/Card.tsx";
import {getBranches} from "../services/API/branches.ts";
import {useQuery} from "@tanstack/react-query";
import type {Branch} from "../model";
import {PerformanceHeatmap} from "../components/PerformanceHeatMap.tsx";
import Map from "../components/Map.tsx";
import { usePermissions } from "../hooks/usePermissions";
import { AlertCircle } from "lucide-react";

function MapViewPage() {
    const title = "HomePage";
    const description = "Welcome to the HomePage";
    const { filterBranches, isAdmin } = usePermissions();

    const {  data , isLoading, isError } =  useQuery<Branch[]>({
        queryKey: ["branches"],
        queryFn: getBranches,
    });

    // Filter branches based on user permissions
    const branches: Branch[] = filterBranches(data ?? []);


    if (isLoading) return <p>Loading...wait bro</p>;
    if (isError) return <p>Error loading branches! Please check backend connection.</p>;
    
    // Show message if user has no branches to view
    if (!isAdmin && branches.length === 0) {
        return (
            <div className="w-auto h-full flex flex-col">
                <MainPageHeader title={title} description={description} />
                <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="max-w-md p-8 text-center">
                        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Branches Available</h2>
                        <p className="text-gray-600">
                            You don't have access to any branches yet. Please contact your administrator to request access.
                        </p>
                    </Card>
                </div>
            </div>
        );
    }

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
                    <Map branches={branches} />
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