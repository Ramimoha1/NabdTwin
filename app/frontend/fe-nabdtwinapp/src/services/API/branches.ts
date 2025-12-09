import { api } from "./api";
import type {Branch} from "../../model";

export const getBranches = () => {
    const mockBranches: Branch[] = [
        {
            id: 'branch-1',
            name: 'Cairo Headquarters',
            location: {
                lat: 30.0444,
                lng: 31.2357,
                address: 'Downtown Cairo, Egypt'
            },
            kpis: {
                revenue: 2500000,
                employees: 250,
                satisfaction: 87,
                productivity: 92,
                growth: 15.5
            },
            floors: [],
            performance: 'excellent',
            totalFloors: 5,
            totalEmployees: 250
        },
        {
            id: 'branch-2',
            name: 'Alexandria Branch',
            location: {
                lat: 31.2001,
                lng: 29.9187,
                address: 'Alexandria, Egypt'
            },
            kpis: {
                revenue: 1800000,
                employees: 180,
                satisfaction: 82,
                productivity: 85,
                growth: 12.3
            },
            floors: [],
            performance: 'good',
            totalFloors: 4,
            totalEmployees: 180
        },
        {
            id: 'branch-3',
            name: 'Giza Office',
            location: {
                lat: 30.0131,
                lng: 31.2089,
                address: 'Giza, Egypt'
            },
            kpis: {
                revenue: 1500000,
                employees: 150,
                satisfaction: 78,
                productivity: 80,
                growth: 8.7
            },
            floors: [],
            performance: 'good',
            totalFloors: 3,
            totalEmployees: 150
        },
        {
            id: 'branch-4',
            name: 'Mansoura Office',
            location: {
                lat: 31.0409,
                lng: 31.3785,
                address: 'Mansoura, Egypt'
            },
            kpis: {
                revenue: 950000,
                employees: 95,
                satisfaction: 75,
                productivity: 72,
                growth: 5.2
            },
            floors: [],
            performance: 'average',
            totalFloors: 2,
            totalEmployees: 95
        },
        {
            id: 'branch-5',
            name: 'Aswan Branch',
            location: {
                lat: 24.0889,
                lng: 32.8998,
                address: 'Aswan, Egypt'
            },
            kpis: {
                revenue: 650000,
                employees: 65,
                satisfaction: 68,
                productivity: 65,
                growth: 2.1
            },
            floors: [],
            performance: 'poor',
            totalFloors: 2,
            totalEmployees: 65
        }
    ]
    return new Promise(resolve => setTimeout(() => resolve(mockBranches), 300));
    // return api.get("/branches").then(res => res.data);
};