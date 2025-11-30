import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "./authThunks";

interface AuthState {
    username: string | null;
    useremail: string | null;
    accountType: "admin" | "user" | "unregistered";
    token: string | null;
    isLoggedIn: boolean;
    error: string | null;
    isLoading: boolean;
}

const initialState: AuthState = {
    username: null,
    useremail: null,
    token: null,
    accountType: "unregistered",
    isLoggedIn: false,
    error: null,
    isLoading: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logoutUser(state) {
            state.username = null;
            state.useremail = null;
            state.isLoggedIn = false;
            state.token = null;
            state.error = null;
            state.isLoading = false;
            state.accountType = "unregistered";
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

                state.username = action.payload.username;
                state.useremail = action.payload.useremail;
                state.token = action.payload.token;
                state.accountType = action.payload.accountType;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message ?? "Login failed";
            });
    },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
