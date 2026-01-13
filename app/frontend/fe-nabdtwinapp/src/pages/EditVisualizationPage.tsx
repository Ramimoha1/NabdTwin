import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { selectAccountType, selectIslogin } from "../store/auth/authSelector";
import PageNotAuthorized from "./PageNotAuthorized";
import { Card } from '../externaluicomponents/Card';
import { Button } from '../externaluicomponents/button';
import { Label } from '../externaluicomponents/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../externaluicomponents/select';
import { Edit, Plus, Trash2, Building2 } from 'lucide-react';
import { getBranches } from '../services/API/branches';
import type { Branch } from '../model';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../externaluicomponents/dialog';
import { Input } from '../externaluicomponents/input';
import { Badge } from '../externaluicomponents/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getFloorsByBranchRaw, createFloor, deleteFloor } from '../services/API/floors';

type FloorData = {
  id: number;
  documentId: string;
  name: string;
  floorNumber: number;
  description?: string;
  floors?: string;
};

export function EditVisualizationPage() {
  const isLogin = useSelector(selectIslogin);
  const accountType = useSelector(selectAccountType);
  const navigate = useNavigate();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorNumber, setNewFloorNumber] = useState("");
  const [newFloorDescription, setNewFloorDescription] = useState("");

  // Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const branchData = await getBranches();
        setBranches(branchData);
        if (branchData.length > 0) {
          setSelectedBranchId(branchData[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to load branches:', error);
      }
    };
    loadBranches();
  }, []);

  // Load floors when branch changes
  useEffect(() => {
    if (!selectedBranchId) return;
    
    const loadFloors = async () => {
      setIsLoading(true);
      try {
        const floorsData = await getFloorsByBranchRaw(selectedBranchId);
        setFloors(floorsData);
      } catch (error) {
        console.error('Failed to load floors:', error);
        toast.error('Failed to load floors');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFloors();
  }, [selectedBranchId]);

  const handleCreateFloor = async () => {
    if (!newFloorName || !newFloorNumber || !selectedBranchId) return;

    try {
      const newFloor = await createFloor({
        name: newFloorName,
        floorNumber: parseInt(newFloorNumber),
        description: newFloorDescription,
        branch: selectedBranchId
      });

      // Add the new floor to the list
      setFloors(prev => [...prev, newFloor]);

      // Reset form and close dialog
      setIsCreateDialogOpen(false);
      setNewFloorName("");
      setNewFloorNumber("");
      setNewFloorDescription("");
      toast.success('Floor created successfully');
    } catch (error) {
      console.error('Failed to create floor:', error);
      toast.error('Failed to create floor');
    }
  };

  const handleDeleteFloor = async (floorId: number) => {
    if (!confirm('Are you sure you want to delete this floor?')) return;

    try {
      await deleteFloor(floorId);
      setFloors(prev => prev.filter(f => f.id !== floorId));
      toast.success('Floor deleted successfully');
    } catch (error) {
      console.error('Failed to delete floor:', error);
      toast.error('Failed to delete floor');
    }
  };

  const handleEditFloor = (floorDocumentId: string) => {
    // Navigate to the editor page with branch and floor context
    navigate(`/edit-visualization/editor/${selectedBranchId}/${floorDocumentId}`);
  };

  if (!isLogin) {
    return <PageNotAuthorized />;
  }

  if (accountType !== 'admin') {
    return <PageNotAuthorized />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Edit Visualization
        </h1>
        <p className="text-gray-600">Manage floor plans and visualizations for each branch</p>
      </div>

      {/* Branch Selector */}
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="branch-select">Select Branch</Label>
            <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
              <SelectTrigger id="branch-select" className="w-full">
                <SelectValue placeholder="Choose a branch..." />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Floors Management */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Floor Plans</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Floor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Floor</DialogTitle>
                <DialogDescription>
                  Add a new floor to this branch. You'll be able to edit the floor plan after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="floor-name">Floor Name</Label>
                  <Input
                    id="floor-name"
                    placeholder="e.g., Ground Floor"
                    value={newFloorName}
                    onChange={(e) => setNewFloorName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="floor-number">Floor Number</Label>
                  <Input
                    id="floor-number"
                    type="number"
                    placeholder="e.g., 0"
                    value={newFloorNumber}
                    onChange={(e) => setNewFloorNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="floor-description">Description (Optional)</Label>
                  <Input
                    id="floor-description"
                    placeholder="e.g., Main entrance and reception"
                    value={newFloorDescription}
                    onChange={(e) => setNewFloorDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFloor}>
                    Create Floor
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading floors...</div>
        ) : floors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No floors found for this branch. Click "Add Floor" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {floors.map((floor) => (
              <Card key={floor.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg">{floor.name}</h3>
                      <Badge variant="secondary">Level {floor.floorNumber}</Badge>
                      {floor.floors && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Has Floor Plan
                        </Badge>
                      )}
                    </div>
                    {floor.description && (
                      <p className="text-sm text-gray-600">{floor.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleEditFloor(floor.documentId)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Floor Plan
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFloor(floor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default EditVisualizationPage;
