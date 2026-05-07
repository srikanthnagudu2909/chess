import { useState } from "react"
import { connectSocket, socket } from "../socket"
import { useNavigate } from "react-router-dom"
import { CiCirclePlus } from "react-icons/ci";
import { IoMdExit } from "react-icons/io";



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
    function joinroomSpectator(){
       connectSocket()
        console.log(roomcode,"roomcode coming")
        socket.emit("room:join-spectator",roomcode,(res)=>{
            if(!res?.ok){
              return alert(res.message||"failed to join room")
            }
            navigate(`/rooms/${res.room.roomcode}`)
            
        })
       
    }
   return (
  
  <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex flex-col items-center justify-center px-4 ">
   <div className="h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-no-repeat">
    {/* Title */}
    <h1 className="text-4xl font-bold text-gray-800 mb-2">
      Welcome to Chess
    </h1>
    <p className="text-gray-600 mb-10">
      Create a room or join an existing one to start playing
    </p>

    {/* Cards Container */}
    <div className="flex flex-col md:flex-row gap-8">

      {/* Create Room Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-80 border-t-4 border-blue-500">
        <div className="flex justify-center mb-4">
          <CiCirclePlus className="text-blue-500" size={50} />
        </div>

        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          Create Room
        </h2>

        <p className="text-gray-500 mb-6">
          Start a new game and share the room code with your opponent.
        </p>

        <button
          onClick={createroom}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          + Create Room
        </button>
      </div>

      {/* Join Room Card */}
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-80 border-t-4 border-green-500 ">
        <div className="flex justify-center mb-4">
          <IoMdExit className="text-green-600" size={50} />
        </div>

        <h2 className="text-xl font-semibold text-green-600 mb-2">
          Join Room
        </h2>

        <p className="text-gray-500 mb-6">
          Enter a room code to join an existing game.
        </p>

        <input
          type="text"
          placeholder="Enter room code"
          value={roomcode}
          onChange={(e) => setroomcode(e.target.value.toUpperCase())}
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <div className="flex flex-col gap-3">

        
        <button
          onClick={joinroom}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
        >
          → Join As Player
        </button>
        
         <button
          onClick={joinroomSpectator}
          className="w-full bg-green-400 text-white py-3 rounded-lg hover:bg-green-600 transition "
        >
          → Join As Spectator
        </button>
        </div>
      </div>
    </div>

    {/* How it works */}
    <div className="mt-12 bg-white px-8 py-6 rounded-xl shadow-md flex gap-6 text-sm text-gray-600">
      <p>① Create or join a room</p>
      <p>② Wait for an opponent</p>
      <p>③ Play chess in real-time</p>
    </div>

   </div>
 </div> 
);
}