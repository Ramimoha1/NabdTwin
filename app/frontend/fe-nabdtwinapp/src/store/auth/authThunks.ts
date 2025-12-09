import {createAsyncThunk} from "@reduxjs/toolkit";
import STRAPI_URL, {api} from "../../services/API/api.ts";
import type {NavigateFunction} from "react-router-dom";

export const loginUser = createAsyncThunk( "authen/local" ,
    async ({identifier , password, navigate} : {identifier : string ; password : string; navigate :NavigateFunction  }) =>{

         const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
             method : "POST" ,
             headers : {"Content-Type" : "application/json"} ,
             body : JSON.stringify({identifier,password})

         }) ;
        if (!res.ok) throw new Error("Login failed");

        const data = await res.json();
        localStorage.setItem('jwt', data.jwt);
        
        // Fetch user permissions
        const userResponse = await fetch(`${STRAPI_URL}/api/users/me?populate[userBranchPermissions][populate][0]=branch&populate[userFeaturePermissions][populate][0]=appFeature`, {
            headers: {
                'Authorization': `Bearer ${data.jwt}`
            }
        });
        
        const userData = await userResponse.json();
        
        // Extract permissions
        const branchPermissions = userData.userBranchPermissions || [];
        const viewBranches = branchPermissions.map((bp: any) => 
            (bp.branch?.id || bp.branch)?.toString()
        ).filter(Boolean);
        
        const featurePermissions = userData.userFeaturePermissions || [];
        const featureNames = featurePermissions.map((fp: any) => 
            fp.appFeature?.name || ''
        );
        
        const isAdmin = userData.type === 'admin';
        
        const returnedData = {
            userId: userData.id.toString(),
            token: data.jwt,
            useremail: userData.email,
            username: userData.username,
            accountType: isAdmin ? "admin" as const : "user" as const,
            permissions: {
                viewBranches: viewBranches,
                viewReports: featureNames.includes('viewReports') || isAdmin,
                viewInsights: featureNames.includes('viewInsights') || isAdmin,
                viewEmployees: featureNames.includes('viewEmployees') || isAdmin,
            }
        }
        navigate("/homepage", { replace: true });
        return  returnedData;
    });
