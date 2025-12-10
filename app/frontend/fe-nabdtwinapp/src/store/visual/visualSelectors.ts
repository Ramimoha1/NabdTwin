// store/visual/visualSelectors.ts
import { type RootState } from '../store';

export const selectSelectedBranchId = (state: RootState) =>
    state.visual.selectedBranchId;

export const selectSelectedEmployeeId = (state: RootState) =>
    state.visual.selectedEmployeeId;

export const selectSelectedTeamId = (state: RootState) =>
    state.visual.selectedTeamId;

export const selectSelectedDepartmentId = (state: RootState) =>
    state.visual.selectedDepartmentId;

export const selectCurrentVisualView = (state: RootState) =>
    state.visual.currentVisualView;

// Useful combined selector
export const selectHasActiveSelection = (state: RootState) =>
    state.visual.selectedBranchId !== null;