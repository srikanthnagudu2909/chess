const jwt=require("jsonwebtoken")
const { User } = require("../models/user.model")
const verifyAuth=async(req,res,next)=>{
try{
const {accesstoken}=req.cookies
if(!accesstoken){
    return res.status(401).json({message:err.message})
}
let plaload
try{
 plaload=jwt.verify(accesstoken,process.env.jwt_access_secret)
}
catch(err){
    return res.status(401).json({message:err.message})
}
const id=plaload.sub
const user=await User.findById(id).select("-passwordHash")
if(!user){
    return res.status(401).json({message:"user not found"})
}
if(plaload.role!==user.role){
    return res.status(401).json({message:"unauthorized"})
}
req.user=user
next()
}catch(err){
    return res.status(500).json({message:err.message})
}
}
module.exports={verifyAuth}