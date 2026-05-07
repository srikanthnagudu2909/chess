const { User } = require("../models/user.model")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const { socket } = require("../../frontend/src/socket")
const login= async (req,res)=>{
   // console.log(req.body,"check")
    try{
      const {email,password}=req.body
     // console.log(email,"check")
      if(!email||!password){
        return res.status(400).json({message:"please fill all fields"})
      }
      const user=await User.findOne({email})
      if(!user){
        return res.status(400).json({message:"user does not exist"})
      }
      const match=await bcrypt.compare(password,user.passwordHash)
      if(!match){
        return res.status(400).json({message:"invalid password"})
      }
      const accesstoken=jwt.sign({sub:user._id,role:user.role},process.env.jwt_access_secret,{expiresIn:"15m"})
      res.cookie("accesstoken",accesstoken,{
        httpOnly:true,
        secure:process.env.NODE_ENV=="production",
        maxAge:15*60*100
      })
      const refreshtoken=jwt.sign({sub:user._id,role:user.role,type:"refresh"},process.env.jwt_refresh_secret,{expiresIn:"7d"})
      res.cookie("refreshtoken",refreshtoken,{
        httpOnly:true,
        secure:process.env.NODE_ENV=="production",
        path:"/api/refresh",
        maxAge:7*24*60*60*100
      })
     return res.status(200).json({message:"OK"})
    }catch(err){
        return res.status(500).json({message:err.message})
    }
}
const singup=async(req,res)=>{
try{
    const {name,email,password}=req.body
    if(!name||!email||!password){
        return res.status(400).json({message:"please fill all fields"})
    }
    const existinguser=await User.findOne({email})
    if(existinguser){
        return res.status(400).json({message:"user is already exist"})
    }
    const saltRound=10
    const passwordHash=await bcrypt.hash(password,saltRound)
    const user=new User({name,email,passwordHash})
    const saveduser=user.save()
    if(!saveduser){
         return res.status(400).json({message:"unable to save user"})
    }
    return res.status(200).json({message:"OK"})
}catch(err){
    return res.status(500).json({message:err.message})
}
}
const fetch=(req,res)=>{
  socket.disconnect()
  try{
    const user=req.user
    return res.status(200).json({user})
  }catch(err){
    return res.status(500).json({message:err.message})
}
}
const logout=(req,res)=>{
  socket.disconnect()
try{
 res.clearCookie("accesstoken",{
  httpOnly:true,
  secure:process.env.NODE_ENV=="production"
 })
  res.clearCookie("refreshtoken",{
  httpOnly:true,
  secure:process.env.NODE_ENV=="production",
   path:"/api/refresh"
 })

 return res.status(200).json({message:"ok"})
}catch(err){
    return res.status(500).json({message:err.message})
}
}
const refresh=async(req,res)=>{
try{
const {refreshtoken}=req.cookies
if(!refreshtoken){
  return res.status(400).json({message:"refresh token missing"})
}
const payload=jwt.verify(refreshtoken,process.env.jwt_refresh_secret)
if(payload.type!=="refresh"){
  return res.status(400).json({message:"token type not refresh"})
}
const id=payload.sub
const user=await User.findById(id)
if(!user){
  res.clearCookie("refreshtoken",{
  httpOnly:true,
  secure:process.env.NODE_ENV=="production",
   path:"/api/refresh"
 })
 return res.status(400).json({message:"user not found"})
}
const accesstoken=jwt.sign({sub:user._id,role:user.role},process.env.jwt_access_secret,{expiresIn:"15m"})
      res.cookie("accesstoken",accesstoken,{
        httpOnly:true,
        secure:process.env.NODE_ENV=="production",
        maxAge:15*60*100
      })
return res.status(200).json({ message: "new access token generated" })

}catch(err){
    return res.status(500).json({message:err.message})
}
}
module.exports={login,singup,fetch,logout,refresh}