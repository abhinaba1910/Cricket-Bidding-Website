import axios from "axios";
const API_URL=window.location.hostname==="localhost"? "http://localhost:6001":"https://cricket-bidding-website-production.up.railway.app";
const Api=axios.create({
    baseURL: API_URL,
});

Api.interceptors.request.use((config)=>{
    const token=localStorage.getItem("token");
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
});

export default Api;
