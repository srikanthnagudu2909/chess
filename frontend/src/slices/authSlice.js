import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/client";
const initialState={
    user:null,
    status:"idle",
    error:null,
    ischecked:false
}
export const login=createAsyncThunk("auth/login",async({email,password},thunkAPI)=>{
try{
 const res=await api.post("/login",{email,password})
 return res.data
}catch(error){
    return thunkAPI.rejectWithValue(error.message||"login failed")
}
})
export const signup=createAsyncThunk("auth/signup",async({email,name,password},thunkAPI)=>{
try{
 const res=await api.post("/signup",{email,name,password})
 return res.data
}catch(error){
    return thunkAPI.rejectWithValue(error.message||"signup failed")
}
})
export const logout=createAsyncThunk("auth/logout",async(_,thunkAPI)=>{
   //        console.log("api is calling")
try{
 const res=await api.post("/logout")
 console.log('rsponse',res)
    return res.data
 
}catch(error){
    return thunkAPI.rejectWithValue(error.message||"logout failed")
}
})
export const fetch=createAsyncThunk("auth/fetch",async(_,thunkAPI)=>{
try{
 const res=await api.get("/fetchme")
 return res.data
}catch(error){
    return thunkAPI.rejectWithValue(error.message||"fetchme failed")
}
})
export const refresh=createAsyncThunk("auth/refresh",async(_,thunkAPI)=>{
try{
 const res=await api.post("/refresh")
 return res.data
}catch(error){
    return thunkAPI.rejectWithValue(error.message||"refrsh failed")
}
})
const authslice=createSlice({
    name:"auth",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
    function pending(state){
    state.user=null
    state.status="pending"
    state.error=null
    }
    function fulfilled(state){
    state.status="success"
    state.error=null
    }
     function rejected(state,action){
    state.user=null
    state.status="failed"
    state.error=action.payload
    }
    builder
    .addCase(login.pending,pending)
    .addCase(login.fulfilled,fulfilled)
    .addCase(login.rejected,rejected)
    .addCase(signup.pending,pending)
    .addCase(signup.fulfilled,fulfilled)
    .addCase(signup.rejected,rejected)
    .addCase(logout.pending,pending)
    .addCase(logout.fulfilled,(state)=>{
    state.user=null
    state.status="success"
    state.error=null 
    })
    .addCase(logout.rejected,rejected)
    .addCase(fetch.pending,pending)
    .addCase(fetch.fulfilled,(state,action)=>{
        state.user=action.payload
        state.status="success"
        state.error=null,
        state.ischecked=true
    })
    .addCase(fetch.rejected,()=>{
    state.user=null
    state.status="failed"
    state.error=action.payload
    state.ischecked=true
    })
    }
})
const authreducer=authslice.reducer
export{authreducer}