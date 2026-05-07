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
const { Chess } = require("chess.js")
const { leaderboardrouter } = require("./routes/leaderboard.routes")
const {Game}=require("./models/game.model")
const { env } = require("process")
const { ok } = require("assert")
const { verifyAuth } = require("./middleware/verifyAuth")
const parser = require("./utilities/upload")

const app = express()

app.use(cors({origin:["http://localhost:5173"],
  credentials:true}))
app.use(express.json())
app.use(cookieParser())
app.use("/api", authRouter)
app.use("/api",leaderboardrouter)
app.post("/api/upload", verifyAuth, parser.single("file"), (req, res) => {
  // something inside upload.
  try {
    const url = req.file.path;
    return res.status(200).json({ avatar: url });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

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
    let {guestId,guestName}=socket.handshake.auth
  
    
    if(accesstoken){
    const payload=jwt.verify(accesstoken,process.env.jwt_access_secret)
    const user=await User.findById(payload.sub).select("-passwordHash")
    if(!user){
      return next(new Error("unable to find the user"))
    }
    socket.user=user
     return next()
    }
    if(guestId && guestName){
     socket.user={
      _id:guestId,
      name:guestName,
      role:"guest"
     }
     return next()
    }
    if(!accesstoken){
      return next(new Error("accesstoken missing"))
    }
    return next()
}catch(err){
  return next(new Error("unauthorized"))
  }
})

function getRoomCode(len=6){
  let chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let code=""
  for(let i=0;i<len;i++){
    code+=chars[Math.floor(Math.random()*chars.length)]
  }
 return code
}
function getPublicRoom(room) {
  return {
    roomcode: room.roomcode,
    players: room.players.map((p) => ({ userId: p.userId, name: p.name })),
    spectators:room.spectators,
    status: room.status,
    createAt: room.createAt,
    fen: room.fen,
    whiteId: room.whiteId,
    blackId: room.blackId,
    lastMove: room.lastMove,
  };
}
function getPublicState(room) {
  return {
    roomcode: room.roomcode,
    fen: room.game.fen(),
    turn: room.game.turn(),
    whiteId: room.whiteId,
    blackId: room.blackId,
    lastMove: room.lastMove,
  };
}

function getPublicClock(room) {
  return {
    ...room.clock,
    roomcode: room.roomcode,
  };
}
 function getExpectedScore(r1, r2) {
  return 1 / (1 + Math.pow(10, (r2 - r1) / 400));
}
const rooms=new Map()
async function saveGameDetailsToUser(room, result, reason) {
  
  const whiteId = room.whiteId;
  console.log("white user id")
  const blackId = room.blackId;
  const white = await User.findById(whiteId);
  const black = await User.findById(blackId);
  let K = 32;
  // eW - expected white score
  let eW = getExpectedScore(white.stats.rating, black.stats.rating);
  // eB - expected black score
  let eB = 1 - eW;
  // actual white and black scores
  let sW, sB;
  if (result === "white") {
    sW = 1;
    sB = 0;
  } else if (result === "black") {
    sW = 0;
    sB = 1;
  } else {
    sW = 0.5;
    sB = 0.5;
  }
  white.stats.rating = Math.round(white.stats.rating + K * (sW - eW));
  black.stats.rating = Math.round(black.stats.rating + K * (sB - eB));

  if (result === "draw") {
    white.stats.draws += 1;
    white.stats.gamesPlayed += 1;
    white.stats.currentStreak = 0;
    black.stats.draws += 1;
    black.stats.gamesPlayed += 1;
    black.stats.currentStreak = 0;
  } else if (result === "white") {
    white.stats.wins += 1;
    white.stats.gamesPlayed += 1;
    white.stats.currentStreak += 1;
    white.stats.bestStreak = Math.max(
      white.stats.bestStreak,
      white.stats.currentStreak,
    );
    black.stats.losses += 1;
    black.stats.gamesPlayed += 1;
    black.stats.currentStreak = 0;
  } else if (result === "black") {
    black.stats.wins += 1;
    black.stats.gamesPlayed += 1;
    black.stats.currentStreak += 1;
    black.stats.bestStreak = Math.max(
      black.stats.bestStreak,
      black.stats.currentStreak,
    );
    white.stats.losses += 1;
    white.stats.gamesPlayed += 1;
    white.stats.currentStreak = 0;
  }
  await white.save();
  await black.save();
}
io.on("connection",(socket)=>{
  socket.on("room:create",(ack)=>{
    try{
   let roomcode=getRoomCode()
   while(rooms.has(roomcode)){
    roomcode=getRoomCode()
   }
   const newroom={
    roomcode,
    players:[],
    spectators:[],
    status:"waiting",
     createAt:Date.now(),
     game:new Chess(),
    fen:new Chess().fen(),
    whiteId:null,
    blackId:null,
    lastMove:null
   }
   socket.join(roomcode)
   newroom.players.push({
    name:socket.user.name,
    socketId:socket.id,
    userId:socket.user._id,
    role:socket.user.role
   })
   const baseMs=5*60*1000
   const incrementMs=0
   newroom.timeControl={baseMs,incrementMs}
   newroom.clock={
    whiteMs:baseMs,
    blackMs:baseMs,
    active:"w",
    lastSwitchAt:null,
    running:false
   }
  
   rooms.set(roomcode,newroom)
   io.to(roomcode).emit("room:presence",getPublicRoom(newroom))
   return ack?.({ok:true,room:getPublicRoom(newroom)})
  }catch(err){
    return ack?.({ok:false,room:err.message}||"create room failed")
  }
  })

 socket.on("room:join",(roomcode,ack)=>{
  try{

   const existingroom=rooms.get(roomcode)
   if(!existingroom){
    return ack?.({ok:false,message:"room does not exist"})
   }
   const already=existingroom.players.some((p)=>p.userId.toString()==socket.user._id.toString())
  
   const isSpectator=existingroom.spectators.some((s)=>s.userId.toString()==socket.user._id.toString())

   if(isSpectator){
    return
   }
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
   existingroom.players = existingroom.players.map((p) => {
   if (p.userId.toString() === socket.user._id.toString()) {
    return { ...p, socketId: socket.id };
   }
   return p;
   });
   }
   // existingroom.status=existingroom.players.length===2?"ready":"waiting"
   if(existingroom.players.length==2){
    existingroom.status="ready"
    existingroom.whiteId=existingroom.players[0].userId
    existingroom.blackId=existingroom.players[1].userId
    //clock
    existingroom.clock.running=true
    existingroom.clock.lastSwitchAt=Date.now()
    existingroom.clock.active="w"
   
  }
  socket.join(roomcode)
  io.to(roomcode).emit("clock:update",getPublicClock(existingroom))
  io.to(roomcode).emit("room:presence",getPublicRoom(existingroom))
  
  return ack?.({ok:true,room:getPublicRoom(existingroom)})
  }catch(err){
     return ack?.({ok:false,room:err.message}||"failed to join room")
  }
 })
 socket.on("room:join-spectator",(roomcode,ack)=>{ 
  try{
  const existingroom=rooms.get(roomcode)
  console.log(existingroom,"room code check")
  if(!existingroom) return ack?.({ok:false,message:"room does not exist"})
   const already=existingroom.spectators.some((s)=>s.userId.toString()==socket.user._id.toString())
  
   if(already){
    existingroom.spectators=existingroom.spectators.map((s)=>{
      if(s.userId.toString()===socket.user._id.toString()){
        return {...s,socketId:socket.id}
      }
      return s
    })
  }else{
    if(existingroom.spectators.length===50){
      return ack?.({ok:false,message:"room is full"})
    }
    existingroom.spectators.push({
      userId:socket.user._id,
      name:socket.user.name,
      socketId:socket.id,
      role:socket.user.role
    })
  }
  // console.log(existingroom,"second check")
  // console.log(socket.user._id,socket.user.name,socket.user.role,socket.id,"players in spect")
  
  socket.join(roomcode)
  io.to(roomcode).emit("room:presence",getPublicRoom(existingroom))
  return ack?.({ok:true,room:getPublicRoom(existingroom)})
  }catch(err){
    return ack?.({ok:false,room:err.message}||"Unable to join room as a sepctator")
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
  // console.log(remaining,"remaing length")
  // console.log(existingroom.players.length,"existing length")
   if(remaining.length==1){
   existingroom.status="waiting"
   return ack?.({ok:true,room:getPublicRoom(existingroom)})
   }else{
    rooms.delete(roomcode);
    return ack?.({ok:true})
   }  
  //  console.log(existingroom.status,"statussss`")
  // if(remaining.length === 0) {
  // rooms.delete(roomcode);
  // }
  
  }catch(err){
  return ack?.({ok:false,room:err.message}||"failed to leave room")
  }
 })
 socket.on("game:state", (roomcode, ack) => {
    const room = rooms.get(roomcode);
    if (!room) return ack?.({ ok: false, message: "Room does not exist" });
    return ack?.({ ok: true, state: getPublicState(room),clock:getPublicClock(room) });
  });
  socket.on("chat:message", (msg) => {
  io.to(msg.roomcode).emit("chat:message", msg);
  });
  socket.on("chat:typing", (data) => {
  socket.to(data.roomcode).emit("chat:typing", data);
  });

 socket.on("game:move" ,async(roomcode,from,to,promotion,ack)=>{
  try{
  const room=rooms.get(roomcode)
  if(!room){
  return ack?.({ok:false,message:"room does not exist"})
  }
  let player="none"    
  if(socket.user._id.toString()===room.whiteId.toString()){
    player="w"
  }else if(socket.user._id.toString()===room.blackId.toString()){
    player="b"
  }
  if(player=="none"){
    return ack?.({ok:false,message:"invalid user"})
  }
  const turn=room.game.turn()
  if(player!==turn){
    return ack?.({ok:false,message:"not your turn"})
  }
  const move=room.game.move({
    from,
    to,
    promotion:"q"
  })
  if(!move){
    return ack?.({ok:false,message:"invalid move"})
  }
  room.lastMove={from,to}
  const now=Date.now()
  const elasped=now-room.clock.lastSwitchAt
  if(player==="w"){
     room.clock.whiteMs-=elasped
     room.clock.whiteMs+=room.timeControl.incrementMs
     room.clock.active="b"
  }else{
     room.clock.blackMs-=elasped
     room.clock.blackMs+=room.timeControl.incrementMs
     room.clock.active="w"
  }

  room.clock.whiteMs=Math.max(0,room.clock.whiteMs)
  room.clock.blackMs=Math.max(0,room.clock.blackMs)
  room.clock.lastSwitchAt=now
  io.to(roomcode).emit("clock:update",getPublicClock(room))
  if(room.clock.whiteMs===0||room.clock.blackMs===0){
    room.clock.running=false
    const result=room.clock.whiteMs===0?"black":"white";
    const reason="timeout"
    io.to(roomcode).emit("game:over",result)
    console.log(roomcode,"playercode winss")
    const guest=room.players.some((p)=>p.role==="guest")
    console.log(guest, "guest", result)
    if(guest){
      return
    }
    // const game=new Game({
    //   roomcode,
    //   whiteId:room.whiteId,
    //   blackId:room.blackId,
    //   reason,
    //   result,
    //   startedAt:new Date(room.createAt),
    //   endedAt:Date.now(),
    //   duration:Date.now()-room.createAt
    // })
    // await game.save()
    await saveGameDetailsToUser(room,result,reason)
  }
  io.to(roomcode).emit("game:update",getPublicState(room))
  if(room.game.isGameOver()){
    let result="gameover"
    let reason="other"
    if(room.game.isCheckmate()){
      reason="checkMate"
      result=turn==="w"?"white":"black"
    }else if(room.game.isDraw()){
      result="draw"
      reason="draw"
    }
    io.to(roomcode).emit("game:over",result)
    const guest=room.players.some((p)=>p.role=="guest")
    if(guest){
      return
    }
    // const game=new Game({
    //   roomcode,
    //   whiteId:room.whiteId,
    //   blackId:room.blackId,
    //   reason,
    //   result,
    //   startedAt:new Date(room.createAt),
    //   endedAt:Date.now(),
    //   duration:Date.now()-room.createAt
    // })
    // console.log("checkimg saving details")
    // await game.save()
    await saveGameDetailsToUser(room,result,reason)
    console.log(result,"game over")
    io.to(roomcode).emit("game:over",result)
  }

  }catch(err){
    return ack?.({ok:false,room:err.message}||"unable to make move")
  }
 })
 socket.on("disconnect", () => {
    for (let [roomcode, room] of rooms.entries()) {
      room.players = room.players.filter((p) => p.socketId !== socket.id);
      if (room.players.length === 0) {
        rooms.delete(roomcode);
        continue;
      }
      room.status = room.players.length === 2 ? "ready" : "waiting";
    }
  });
 
})

server.listen(PORT,()=>{
  console.log(`server running on ${PORT}`)
})
mongoose.connect(mongo_url)
  .then(() => console.log("successfully connected to db"))
  .catch((err) => console.log("failed to connect to db", err.message))