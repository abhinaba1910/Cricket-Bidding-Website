import axios from "axios";
const API_URL=window.location.hostname==="localhost"? "http://localhost:6001":"https://cricket-bidding-website-backend.onrender.com";
const api=axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config)=>{
    const token=localStorage.getItem("token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});

export default api;