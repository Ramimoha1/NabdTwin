import {createAsyncThunk} from "@reduxjs/toolkit";
import STRAPI_URL from "../../services/api.ts";
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
        const returnedData = {
            token: data.jwt,
            useremail: data.user.email,
            username: data.user.username,
            accountType:  data.user.type == "normal" ? "user" : "admin",
        }
        navigate("/homepage", { replace: true });
        return  returnedData;
    });
