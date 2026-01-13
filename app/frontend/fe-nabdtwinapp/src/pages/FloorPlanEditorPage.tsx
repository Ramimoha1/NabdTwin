import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../externaluicomponents/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getFloorRawData, updateFloor } from '../services/API/floors';
import { getEmployeesByBranch } from '../services/API/detailsApi';

type EmployeeOption = {
  id: string;
  name: string;
  role: string;
};

export function FloorPlanEditorPage() {
  const { branchId, floorId } = useParams<{ branchId: string; floorId: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [floorData, setFloorData] = useState<any>(null);

  // Load employees for the selected branch
  useEffect(() => {
    if (!branchId) return;

    const loadEmployees = async () => {
      try {
        const employeeData = await getEmployeesByBranch(branchId);
        
        // Backend returns transformed structure with id, firstName, lastName, role (jobTitle)
        const employeeOptions = employeeData.map((emp: any) => ({
          id: emp.id.toString(),
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role || 'Employee'
        }));
        
        setEmployees(employeeOptions);
      } catch (error) {
        console.error('Failed to load employees:', error);
        toast.error('Failed to load employees');
      }
    };

    loadEmployees();
  }, [branchId]);

  // Load floor data
  useEffect(() => {
    if (!floorId) return;

    const loadFloorData = async () => {
      try {
        const data = await getFloorRawData(floorId);
        setFloorData(data);
      } catch (error) {
        console.error('Failed to load floor data:', error);
        toast.error('Failed to load floor data');
      } finally {
        setIsLoading(false);
      }
    };

    loadFloorData();
  }, [floorId]);

  // Listen for messages from the iframe (save requests, employee selections, etc.)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data;

      switch (type) {
        case 'READY':
          // Editor is ready, send initial data
          if (iframeRef.current?.contentWindow) {
            // Safely parse floor data - check if it's already an object or needs parsing
            let parsedFloorData = null;
            if (floorData?.floors) {
              if (typeof floorData.floors === 'string') {
                try {
                  parsedFloorData = JSON.parse(floorData.floors);
                } catch (e) {
                  console.error('Failed to parse floor data:', e);
                  parsedFloorData = null;
                }
              } else if (typeof floorData.floors === 'object') {
                parsedFloorData = floorData.floors;
              }
            }
            
            iframeRef.current.contentWindow.postMessage({
              type: 'INIT_DATA',
              employees: employees,
              floorData: parsedFloorData
            }, window.location.origin);
          }
          break;

        case 'REQUEST_SAVE':
          handleSave(data);
          break;

        case 'REQUEST_EMPLOYEES':
          // Send employee list to editor
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'EMPLOYEES_DATA',
              employees: employees
            }, window.location.origin);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [employees, floorData]);

  const handleSave = async (blueprintData: any) => {
    if (!floorId) return;

    setIsSaving(true);
    try {
      await updateFloor(floorId, blueprintData);

      toast.success('Floor plan saved successfully');
      
      // Notify iframe about successful save
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SAVE_SUCCESS'
        }, window.location.origin);
      }
    } catch (error) {
      console.error('Failed to save floor plan:', error);
      toast.error('Failed to save floor plan');
      
      // Notify iframe about save failure
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SAVE_ERROR',
          error: 'Failed to save floor plan'
        }, window.location.origin);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
      navigate('/edit-visualization');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Go Back button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        
        <h1 className="text-lg font-semibold">
          Editing: {floorData?.attributes?.name || 'Floor Plan'}
        </h1>
        
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          )}
          <Button
            onClick={() => {
              // Trigger save from iframe
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                  type: 'TRIGGER_SAVE'
                }, window.location.origin);
              }
            }}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Floor Plan
          </Button>
        </div>
      </div>

      {/* Iframe containing the OriginalBlueprint editor */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src="/blueprint-editor/index.html"
          className="w-full h-full border-0"
          title="Floor Plan Editor"
        />
      </div>
    </div>
  );
}

export default FloorPlanEditorPage;
