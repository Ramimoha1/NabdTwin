import type {RootState} from "../store.ts";


const selectIslogin = (state : RootState) => state.auth.isLoggedIn;
const selectAccountType = (state : RootState) => state.auth.accountType;
const selectUsername = (state: RootState) => state.auth.username;
const selectIsLoading = (state: RootState) => state.auth.isLoading;

export {selectIslogin, selectAccountType, selectUsername , selectIsLoading};