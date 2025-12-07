
 import axios from "axios";


 const STRAPI_URL = "http://localhost:3001";
 export default STRAPI_URL;


 const api = axios.create({
     baseURL: "http://localhost:3001", // change to your backend
     timeout: 5000,
     headers: {

         "Content-Type": "application/json",
     },
 });
export {api }  ;
 // api.interceptors.request.use(
 //     (config) => {
 //         const token = localStorage.getItem("jwt");
 //         if (token) {
 //             config.headers.Authorization = `Bearer ${token}`;
 //         }
 //         return config;
 //     },
 //     (error) => Promise.reject(error)
 // );