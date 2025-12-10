import {useSelector} from "react-redux";
import {selectSelectedBranchId} from "../store/visual/visualSelectors.ts";
import {useQuery} from "@tanstack/react-query";
import type {Branch} from "../model";
import {getBranchById, getBranches} from "../services/API/branches.ts";

function DetailPage(){
    const branchid = useSelector(selectSelectedBranchId)
    const { data: branch, isLoading: branchLoading, isError: branchesError } = useQuery<Branch[]>({
        queryKey: ['branches'],
        queryFn: getBranchById,
    });






    return (
        <div></div>
    );
}

export default DetailPage;