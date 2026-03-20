require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const { authRouter } = require("./routes/auth.rotues")
const mongoose = require("mongoose")
const{Server}=require("socket.io")
const http=require("http")

const jwt=require("jsonwebtoken")
const { User } = require("./models/user.model")
const { socket } = require("../frontend/src/socket")

const app = express()

app.use(cors({origin:["http://localhost:5173"],
  credentials:true}))
app.use(express.json())
app.use(cookieParser())

app.use("/api", authRouter)

const PORT = process.env.PORT
const mongo_url = process.env.mongo_url
const server=http.createServer(app)
const io=new Server (server,{
  cors:{
    origin:["http://localhost:5173"],
    credentials:true
  }
})
//socket.io middleware
io.use(async(socket,next)=>{
  try{
    const cookieHeader=socket.handshake.headers.cookie||""
    const cookieArray=cookieHeader.split(";").map((c)=>c.trim()).filter(Boolean).map((c)=>{
      let idx=c.indexOf("=")
      return [c.slice(0,idx),decodeURIComponent(c.slice(idx+1))]
    })
    const cookie=Object.fromEntries(cookieArray)
    let {accesstoken}=cookie
    if(!accesstoken){
      return next(new Error("accesstoken missing"))
    }
    const payload=jwt.verify(accesstoken,process.env.jwt_access_secret)
    const user=await User.findById(payload.sub).select("-passwordHash")
    if(!user){
      return next(new Error("unable to find the user"))
    }
    socket.user=user
  return next()
}catch(err){
  return next(new Error("unauthorized"))
  }
})
// io.on("connection",(socket)=>{
//   console.log(`A new user connected on socket${socket.id}`)
// })


//helper function for generate the roomcode
function getRoomCode(len=6){
  let chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let code=""
  for(let i=0;i<len;i++){
    code+=chars[Math.floor(Math.random()*chars.length)]
  }
 return code
}
const rooms=new Map()
io.on("connection",(socket)=>{
  console.log(`A new user connected on socket${socket.id}`)

  socket.on("room:create",(ack)=>{
    try{
   let roomcode=getRoomCode()
   while(rooms.has(roomcode)){
    roomcode=getRoomCode()
   }
   const newroom={
    roomcode,
    players:[],
    status:"waiting",
    createAt:Date.now()
   }
   socket.join(roomcode)
   newroom.players.push({
    name:socket.user.name,
    socketId:socket.id,
    userId:socket.user._id
   })
   console.log(roomcode)
   rooms.set(roomcode,newroom)
   io.to(roomcode).emit("room:presence",newroom)
   return ack?.({ok:true,room:newroom})
  }catch(err){
    return ack?.({ok:false,room:err.message}||"create room failed")
  }
  })

 socket.on("room:join",(roomcode,ack)=>{
  try{
  console.log(`A user tried to join room ${roomcode}`)
  const existingroom=rooms.get(roomcode)
  if(!existingroom){
    return ack?.({ok:false,message:"room does not exist"})
  }
  const already=existingroom.players.some((p)=>p.userId.toString()==socket.user._id.toString())
  if(!already){
    if(existingroom.players.length===2){
       return ack?.({ok:false,message:"room is full"})
    }
    existingroom.players.push({
      userId:socket.user._id,
      name:socket.user.name,
      socketId:socket.id
    })
  }else{
    existingroom.players===existingroom.players.map((p)=>{
      if(p.userId.toString()===socket.user._id.toString()){
        return {...p,socketId:socket.id}
      }
      return p
    })
  }
  existingroom.status=existingroom.players.length===2?"ready":"waiting"
  socket.join(roomcode)
  io.to(roomcode).emit("room:presence",existingroom)
  console.log(existingroom,"room members")
  return ack?.({ok:true,room:existingroom})
  }catch(err){
     return ack?.({ok:false,room:err.message}||"failed to join room")
  }
 })
 socket.on("room:leave",(roomcode,ack)=>{
  try{
  const existingroom=rooms.get(roomcode)
  if(!existingroom){
    return ack?.({ok:false,message:"room does not exist"})
  }
  const remaining=existingroom.players.filter((p)=>{
    return p.userId.toString()!==socket.user._id.toString()
  })
  existingroom.players=remaining
  if(remaining.length === 0) {
  rooms.delete(roomcode);
  }
  return ack?.({ok:true,room:existingroom})
  }catch(err){
  return ack?.({ok:false,room:err.message}||"failed to leave room")
  }
 })
})
server.listen(PORT, () => {
  console.log("server is running on", PORT)
})

mongoose.connect(mongo_url)
  .then(() => console.log("successfully connected to db"))
  .catch((err) => console.log("failed to connect to db", err.message))