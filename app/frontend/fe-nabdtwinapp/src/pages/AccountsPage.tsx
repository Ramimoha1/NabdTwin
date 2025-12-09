
import {useSelector} from "react-redux";
import {selectAccountType, selectIslogin} from "../store/auth/authSelector.ts";
import PageNotAuthorized from "./PageNotAuthorized.tsx";

const AccountsPage = () => {
    const accountType = useSelector(selectAccountType);
    const isLoggedIn = useSelector(selectIslogin)

    if (accountType !=="admin" || !isLoggedIn) {
        return <PageNotAuthorized />;
    }
    return (
        <div>
            
        </div>
    );
};

export default AccountsPage;
