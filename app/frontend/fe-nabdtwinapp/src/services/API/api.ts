
 import axios from "axios";



 const STRAPI_URL = "http://localhost:3001";
 export default STRAPI_URL;


 export const api = axios.create({
     baseURL: "http://localhost:3001", // change to your backend
     timeout: 5000,
     headers: {
         "Content-Type": "application/json",
     },
 });
