import { useState } from "react"
import { connectSocket, socket } from "../socket"
import { useNavigate } from "react-router-dom"


export const Lobby=()=>{
    const[roomcode,setroomcode]=useState("")
    const navigate=useNavigate()
    function createroom(){
        connectSocket()
        socket.emit("room:create",(res)=>{
            if(!res?.ok) return alert(res.message)
            //console.log(res.room.roomcode)
           navigate(`/rooms/${res.room.roomcode}`)
        })
    }
    function joinroom(){
        connectSocket()
        console.log(roomcode,"roomcode coming")
        socket.emit("room:join",roomcode,(res)=>{
            console.log("asdkdbk")
            if(!res?.ok){
              return alert(res.message||"failed to join room")
            }
            console.log(res.room.roomcode,"sdjdhgyi")
            navigate(`/rooms/${res.room.roomcode}`)
            
        })
       
    }
    return(
    <div className="flex flex-col justify-center items-center">
        <button onClick={createroom}className="bg-blue-400 p-4 rounded">Create Room</button>
        <p>OR</p>
        <div className="flex gap-2">
            <input type="text" placeholder="Enter Room Code" value={roomcode} onChange={(e)=>setroomcode(e.target.value.toUpperCase())}/>
            <button onClick={joinroom} className="bg-blue-400 p-2 rounded" >Join Room</button>
        </div>
    </div>

    )
}