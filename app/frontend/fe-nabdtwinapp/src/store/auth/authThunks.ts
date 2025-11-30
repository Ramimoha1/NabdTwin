import {createAsyncThunk} from "@reduxjs/toolkit";
import STRAPI_URL from "../../services/api.ts";

export const loginUser = createAsyncThunk( "authen/local" ,
    async (Credientials : {identifier : string ; password : string;}) =>{
         const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
             method : "POST" ,
             headers : {"Content-Type" : "application/json"} ,
             body : JSON.stringify(Credientials)

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


        return  returnedData;
    });
