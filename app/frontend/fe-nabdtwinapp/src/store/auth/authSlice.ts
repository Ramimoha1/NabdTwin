import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "./authThunks";

interface UserPermissions {
    viewBranches: string[];
    viewReports: boolean;
    viewInsights: boolean;
    viewEmployees: boolean;
}

interface AuthState {
    userId: string | null;
    username: string | null;
    useremail: string | null;
    accountType: "admin" | "user" | "unregistered";
    token: string | null;
    isLoggedIn: boolean;
    error: string | null;
    isLoading: boolean;
    permissions: UserPermissions | null;
}

const initialState: AuthState = {
    userId: null,
    username: null,
    useremail: null,
    token: null,
    accountType: "unregistered",
    isLoggedIn: false,
    error: null,
    isLoading: false,
    permissions: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logoutUser(state) {
            state.userId = null;
            state.username = null;
            state.useremail = null;
            state.isLoggedIn = false;
            state.token = null;
            state.error = null;
            state.isLoading = false;
            state.accountType = "unregistered";
            state.permissions = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isLoggedIn = true;

                state.userId = action.payload.userId;
                state.username = action.payload.username;
                state.useremail = action.payload.useremail;
                state.token = action.payload.token;
                state.accountType = action.payload.accountType;
                state.permissions = action.payload.permissions;

            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message ?? "Login failed";
            });
    },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
