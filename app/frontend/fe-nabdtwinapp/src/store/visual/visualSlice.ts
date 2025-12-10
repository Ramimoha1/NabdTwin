import { createSlice, type PayloadAction   } from "@reduxjs/toolkit";

interface VisualState {
    selectedBranchId: string | null;
    selectedEmployeeId: string | null;
    selectedTeamId: string | null;
    selectedDepartmentId: string | null;
    currentVisualView: null | "Branch" | "Employee" | "Team" | "Department";
}

const initialState: VisualState = {
    selectedBranchId: null,
    selectedEmployeeId: null,
    selectedTeamId: null,
    selectedDepartmentId: null,
    currentVisualView: null
}

export const visualSlice = createSlice({
    name: "visual",
    initialState,
    reducers: {
        setSelectedBranch(state, action: PayloadAction<string>) {
            state.selectedBranchId = action.payload;
            state.currentVisualView = "Branch";
        },
        setSelectedEmployee(state, action: PayloadAction<string>) {
            state.selectedEmployeeId = action.payload;
            state.currentVisualView = "Employee";
        },
        setSelectedTeam(state, action: PayloadAction<string>) {
            state.selectedTeamId = action.payload;
            state.currentVisualView = "Team";
        },
        setSelectedDepartment(state, action: PayloadAction<string>) {
            state.selectedDepartmentId = action.payload;
            state.currentVisualView = "Department";
        },
        setCurrentVisualView(state, action: PayloadAction<VisualState['currentVisualView']>) {
            state.currentVisualView = action.payload;
        },
        // Clear selection when going back to map
        clearSelection(state) {
            state.selectedBranchId = null;
            state.selectedEmployeeId = null;
            state.selectedTeamId = null;
            state.selectedDepartmentId = null;
            state.currentVisualView = null;
        },
        // Clear sub-selections (when going back from dept to branch)
        clearSubSelections(state) {
            state.selectedEmployeeId = null;
            state.selectedTeamId = null;
            state.selectedDepartmentId = null;
        }
    },
});

export const {
    setSelectedBranch,
    setSelectedDepartment,
    setSelectedTeam,
    setSelectedEmployee,
    setCurrentVisualView,
    clearSelection,
    clearSubSelections
} = visualSlice.actions;

export default visualSlice.reducer;