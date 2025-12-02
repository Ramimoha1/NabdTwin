import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import uiReducer from "./ui/uiSlice";
import authReducer from "./auth/authSlice";

const persistConfig = {
    key: "root",
    storage,
};
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: persistedAuthReducer,
    }
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

