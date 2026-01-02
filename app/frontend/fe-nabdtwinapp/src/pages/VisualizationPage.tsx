import { Card } from '../externaluicomponents/Card';
import { Button } from '../externaluicomponents/button';
import { ArrowLeft, Building2, Users, Layers } from 'lucide-react';
import type { Branch } from '../model';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSelectedBranchId } from '../store/visual/visualSelector';
import { useBranchData } from '../hooks/useBranchData';


export function VisualizationPage() {
    const navigate = useNavigate();
    const branchId = useSelector(selectSelectedBranchId)
    const { branch, employees, teams, departments, loading } = useBranchData(branchId);
    const onBack = () =>{
        navigate('/branch/' + branchId);
    }
    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading branch details...</p>
                </div>
            </div>
        );
    }

    if (!branch) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Branch not found</p>
                    <Button onClick={onBack}>Back to Map</Button>
                </div>
            </div>
        );
    }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl mb-1">{branch?.name} - 3D Visualization</h1>
            <p className="text-gray-600">Interactive 3D floor plan with clickable employees and offices</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>{branch?.totalFloors} Floors</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{branch?.totalEmployees} Employees</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Visualization Placeholder */}
      <div className="flex-1 p-6">
        <Card className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
              <Layers className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl mb-3">3D Visualization Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              This section will feature an interactive 3D visualization of {branch?.name}, allowing you to:
            </p>
            <ul className="text-left space-y-2 text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Navigate through floors in 3D space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Click on employees to view their information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>View office layouts and department locations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>See real-time employee presence and status</span>
              </li>
            </ul>
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Branch Overview
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
