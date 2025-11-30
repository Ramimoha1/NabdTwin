import {createSlice, type PayloadAction} from "@reduxjs/toolkit";

interface UIState {
    currentView : "map" | "reports" | "insights" | "accounts" | "profile"
    alertsOpen: boolean;
}

const initialState: UIState  = {
    currentView : "map" ,
    alertsOpen : false
};

export const uiSlice = createSlice({
    name:"ui",
    initialState,
    reducers: {
    setCurrentView(state , action : PayloadAction<UIState["currentView"]>)
            {
                state.currentView = action.payload;
            } ,
    toggleAlert(state)
            {
                state.alertsOpen = !state.alertsOpen;
            }
    }

});


export const { setCurrentView , toggleAlert } = uiSlice.actions;
export default uiSlice.reducer;
