import { configureStore } from "@reduxjs/toolkit";
import { authreducer } from "./slices/authSlice";
const store=configureStore({
    reducer:{
         auth:authreducer
    }
})
export default store