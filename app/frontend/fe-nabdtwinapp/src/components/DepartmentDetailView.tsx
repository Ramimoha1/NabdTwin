import type {DepartmentData, TeamData} from "../services/API/detailsApi";
import {Button} from "../externaluicomponents/button";
import {ArrowLeft} from "lucide-react";
import {Card} from "../externaluicomponents/Card";

export function DepartmentDetailView({ department, teams, onBack }: { department: DepartmentData; teams: TeamData[]; onBack: () => void }) {
    return (
        <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Departments
            </Button>
            <Card className="p-6">
                <h2 className="text-2xl mb-4">{department.name}</h2>
                <p className="text-gray-600 mb-4">Head: {department.headName}</p>
                {/* Add department details here */}
            </Card>
        </div>
    );
}