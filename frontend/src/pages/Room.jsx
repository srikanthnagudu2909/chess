import { useEffect } from "react"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { socket } from "../socket"
import { useSelector } from "react-redux"


export const Room=()=>{
    const{roomcode}=useParams()
    const[room,setroom]=useState(null)
    const user=useSelector((state)=>state.auth.user)
    console.log(user,"user coming")
    useEffect(()=>{
     socket.emit("room:join",roomcode,(res)=>{
       if(!res?.ok)
         return alert(res?.message||"failed to join room")
        setroom(res.room)
     })
     const onpresence=(data)=>{
       setroom(data)
     }
     socket.on("room:presence",onpresence)
     return ()=>{
        socket.off("room:presence",onpresence)
     }
    },[roomcode])
    function leaveroom(){
        socket.emit("room:leave",roomcode,(res)=>{
            if(!res?.ok){
                return alert(res?.message||"failed to leave the room")
            }
            return setroom(res.room)
        })
    }
    return <div>
        <h1>ROOM:{roomcode}</h1>
        <p>status:{room?.status}</p>
        <ul>
            {room?.players.map((p)=>{
            
                return p.userId==user.user._id?<li>{p.name+"(me)"}</li>:<li>{p.name}</li>
            })}
        </ul>
        <div className="flex gap-3 py-2 rounded-lg">
         <button className="bg-green-400 w-20 h-10">START</button>
         <button className="bg-red-400 w-20 h-10" onClick={leaveroom}>LEAVE</button>
        </div>
    </div>
}