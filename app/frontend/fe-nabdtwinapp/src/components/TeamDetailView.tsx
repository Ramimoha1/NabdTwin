import type {EmployeeDetail, TeamData} from "../services/API/detailsApi";
import {Button} from "../externaluicomponents/button";
import {ArrowLeft} from "lucide-react";
import {Card} from "../externaluicomponents/Card";
import React from "react";

export default function TeamDetailView({ team, employees, onBack }: { team: TeamData; employees: EmployeeDetail[]; onBack: () => void }) {
    const teamMembers = employees.filter(e => team.members.includes(e.id));

    return (
        <div>
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
            </Button>
            <Card className="p-6">
                <h2 className="text-2xl mb-4">{team.name}</h2>
                <p className="text-gray-600 mb-4">{team.department} Department</p>
                {/* Add team details here */}
            </Card>
        </div>
    );
}
