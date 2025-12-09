import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import uiReducer from "./ui/uiSlice";
import authReducer from "./auth/authSlice";
import visualReducer from "./visual/visualSlice";

const authPersistConfig = {
    key: "auth",
    storage,
};

const visualPersistConfig = {
    key: "visual",
    storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedVisualReducer = persistReducer(visualPersistConfig, visualReducer);

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: persistedAuthReducer,
        visual: persistedVisualReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST"],
            },
        }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
