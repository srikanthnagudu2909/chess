import axios from "axios";
const api=axios.create({
    baseURL:"http://localhost:5000/api",
    withCredentials:true
})
api.interceptors.response.use((response)=>response,async(error)=>{
    const originalrequest=error.config
    const isrefreshcall=originalrequest?.url?.includes("/refresh")
    if(error.response?.status===401&&!originalrequest._retry && ! isrefreshcall){
        originalrequest._retry=true
        try{
            await api.post('/refresh')
            return api(originalrequest)
        }catch(refresherror){
        return Promise.reject(refresherror)
        }
    }
    return Promise.reject(error)
})
export{api}