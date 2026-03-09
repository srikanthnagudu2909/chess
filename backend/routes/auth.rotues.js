const express=require("express")
const { login, singup ,fetch} = require("../controller/auth.controller")
const { verifyAuth } = require("../middleware/verifyAuth")
const authRouter=express.Router()
authRouter.post("/login",login)
authRouter.post("/signup",singup)
authRouter.get("/fetch",verifyAuth,fetch)
authRouter.post("/logout",(req,res)=>{res.sendStatus(200)})
module.exports={authRouter}