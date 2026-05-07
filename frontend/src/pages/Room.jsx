import { useEffect, useRef } from "react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { connectSocket, socket } from "../socket"
import { useSelector } from "react-redux"
import {Chessboard} from "@gustavotoyota/react-chessboard"

export const Room=()=>{

    const{roomcode}=useParams()
    const navigate=useNavigate()
    const[room,setroom]=useState(null)
    const [fen, setFen] = useState(null);
    const [turn, setTurn] = useState(null);
    const [color, setColor] = useState(null);
    const [whiteMs,setWhiteMs]=useState(null)
    const [blackMs,setBlackMs]=useState(null)
    const user=useSelector((state)=>state.auth.user)
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatRef = useRef();
    const [typingUser, setTypingUser] = useState(null);
    const guest = JSON.parse(localStorage.getItem("guest"));
    const currentUser = {
    _id: user?.user?._id || guest?.id || "temp-id",
    name: user?.user?.name || guest?.name || "Guest",
    };
    console.log(currentUser,"current user")
    useEffect(() => {
    chatRef.current?.scrollTo({
    top: chatRef.current.scrollHeight,
    behavior: "smooth"
    });
    }, [messages]);

useEffect(()=>{
       connectSocket()
     socket.emit("room:join",roomcode,(res)=>{
       if(!res?.ok)
         return alert(res?.message||"failed to join room")
        setroom(res.room)
        setColor(currentUser._id.toString() === res.room.whiteId?.toString()? "White": "Black");
     })
     socket.emit("game:state", roomcode, (response) => {
      if (!response?.ok)
        return alert(response?.message || "Failed to fetch game state");
        setFen(response?.state?.fen);
        setTurn(response?.state?.turn);
        setColor(currentUser._id.toString() === response.state.whiteId?.toString() ? "White": "Black");
        setWhiteMs(response?.clock?.whiteMs)
        setBlackMs(response?.clock?.blackMs)

    });
  },[roomcode,user?._id])

useEffect(()=>{
        connectSocket()
    //  socket.emit("room:join",roomcode,(res)=>{
    //    if(!res?.ok)
    //      return alert(res?.message||"failed to join room")
    //     setroom(res.room)
    //     // console.log(user._id,"checkingg")
    //     //  setColor(user.user._id.toString()===room?.whiteId?.toString() ? "White" : "Black",)
    //     //setColor(user.user._id.toString() === res.room.whiteId?.toString()? "White": "Black");
    //     //setColor(user.user._id.toString() === res.state?.whiteId?.toString() ? "White": "Black");
    //     setColor(currentUser._id.toString() === res.room.whiteId?.toString()? "White": "Black");
    //  })
    //  socket.emit("game:state", roomcode, (response) => {
    //   if (!response?.ok)
    //     return alert(response?.message || "Failed to fetch game state");
    //   setFen(response?.state?.fen);
    //   setTurn(response?.state?.turn);
    //   // setColor(user.user._id.toString()===response?.state?.whiteId.toString()?"White":"Black")
    //  // setColor(user.user._id.toString() === res.room.whiteId?.toString()? "White": "Black");
    //   setColor(currentUser._id.toString() === response.state.whiteId?.toString() ? "White": "Black");

    //   setWhiteMs(response?.clock?.whiteMs)
    //   setBlackMs(response?.clock?.blackMs)

    // });

     const onpresence = (data) => {
     setroom({...data,status: data.players.length === 2 ? "ready" : "waiting"});};
     const onUpdate = (state) => {
      console.log(state.fen);
      setFen(state.fen);
      setTurn(state.turn);
    }
       
     const onEnd=(result)=>{
      console.log(result,"check")
      alert(result)
     }
     function onclock(c){
     if(roomcode!==c.roomcode) return
      setWhiteMs(c.whiteMs)
      setBlackMs(c.blackMs)
     }
     const onMessage = (msg) => {
     setMessages((prev) => [...prev, msg]);
     };
     const onTyping = (data) => {
      setTypingUser(data.name);

      // remove after 2 seconds
      setTimeout(() => {
      setTypingUser(null);
      }, 2000);
      };
     socket.on("chat:typing", onTyping);
     socket.on("chat:message", onMessage);
     socket.on("game:update", onUpdate)  
     socket.on("room:presence",onpresence)
     socket.on("game:over",onEnd)
     socket.on("clock:update",onclock)
     return ()=>{
        socket.off("room:presence",onpresence)
        socket.off("game:update", onUpdate)
        socket.off("game:over",onEnd)
        socket.off("clock:update",onclock)
        socket.off("chat:message", onMessage);
        socket.off("chat:typing", onTyping);
     }
},[roomcode,user?._id,room?.whiteId])
    


function leaveroom(){
        connectSocket()
        socket.emit("room:leave",roomcode,(res)=>{
            if(!res?.ok){
                return alert(res?.message||"failed to leave the room")
            }
            navigate('/lobby')
            setroom(res.room)
        })
        console.log(room,"remainign")
    }
    function convertTime(ms){
        if (!ms) return "--:--";
        const total = Math.floor(ms / 1000);
        const m = String(Math.floor(total / 60)).padStart(2, "0");
        const s = String(Math.floor(total % 60)).padStart(2, "0");
        return `${m}:${s}`;
      }
      function startGame() {
  connectSocket();

  if (room?.players?.length < 2) {
    return alert("Need 2 players");
  }

  socket.emit("game:start", roomcode, (res) => {
    if (!res?.ok) alert(res?.message);
  });
  }
    function onDrop(sourceSquare, targetSquare) {
    connectSocket();
    if (!fen) return false;
    socket.emit(
      "game:move",
      roomcode,
      sourceSquare,
      
      targetSquare,
      "q",
      (response) => {
        if (!response?.ok) return alert(response?.message || "Invalid move");
      },
    );

    return true;
  }
  function sendMessage() {
  if (!input.trim()) return;
  const msg = {
    roomcode,
    text: input,
    name: currentUser.name,
    userId: currentUser._id,
    time: new Date().toLocaleTimeString()
  };
  socket.emit("chat:message", msg);
  setInput("");
  }

  return (
  <div className="min-h-screen bg-gray-100 p-6">

    {/* HEADER */}
    

    {/* TOP BAR */}
    <div className="flex justify-between items-center mt-6">
      <div>
        <h2 className="text-3xl font-bold">Room: {roomcode}</h2>

        <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold
          ${room?.status === "ready" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"}`}>
          {room?.players?.length === 2 ? "Ready to Play" : "Waiting for opponent"}
        </span>
      </div>

      <button className="bg-red-500 text-white px-5 py-2 rounded-lg shadow" onClick={leaveroom}>
        Leave Room
      </button>
    </div>

    {/* MAIN GRID */}
    <div className="grid grid-cols-4 gap-6 mt-6">
      {/* LEFT PANEL */}
      <div className="col-span-1 space-y-4">
        {/* PLAYERS */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-3">
            Players ({room?.players?.length}/2)
          </h3>

          {room?.players.map((p) => (
            <div
              key={p.userId}
              className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {p.name[0]}
              </div>

              <div>
                <p className="font-medium">
                  {p.name} {p.userId === currentUser._id && "(You)"}
                </p>
                <p className="text-sm text-gray-500">
                  {p.userId === room?.whiteId ? "White" : "Black"}
                </p>
              </div>
            </div>
          ))}

          {room?.players?.length < 2 && (
            <div className="border-dashed border p-3 rounded-lg text-gray-400">
              Waiting for opponent...
            </div>
          )}
        </div>

        {/* GAME INFO */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-3">Game Info</h3>
          <p>Time Control: 5:00 + 0</p>
          <p>Status: {room?.status}</p>
        </div>

      </div>

      {/* CENTER BOARD */}
      <div className="col-span-2 bg-white rounded-xl shadow p-4 flex flex-col items-center">

        {room?.status === "ready" ? (
          <>
            {/* TURN + CLOCK */}
            <div className="flex justify-between w-full mb-3">
              <div className="font-semibold">
                Turn: {turn === "w" ? "White" : "Black"}
              </div>

              <div className="flex gap-4">
                <div>White: {convertTime(whiteMs)}</div>
                <div>Black: {convertTime(blackMs)}</div>
              </div>
            </div>

            {/* BOARD */}
            <Chessboard
              id="room-board"
              position={fen || "start"}
              onPieceDrop={onDrop}
      
            />

            {/* ACTIONS */}
            <div className="flex gap-4 mt-4">
              <button className="px-4 py-2 bg-gray-200 rounded-lg">Resign</button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg">Draw</button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg">Flip</button>
            </div>
          </>
        ) : (
          <>
            {/* WAITING SCREEN */}
            <h2 className="text-xl font-semibold mb-4">
              Waiting for Opponent
            </h2>

            <div className="text-3xl font-mono bg-gray-200 px-6 py-3 rounded-lg tracking-widest">
              {roomcode}
            </div>

            <p className="mt-4 text-gray-500">
              Share this code with your friend
            </p>

            {/* START BUTTON */}
            <button
              className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg"
              onClick={startGame}
            >
              Start Game
            </button>
          </>
        )}

      </div>
       {/* MESSAGES */}
       <div className="col-span-1 bg-white rounded-xl shadow p-4 flex flex-col h-[500px] fixed bottom-0 right-0">

         <h3 className="font-semibold mb-3">Chat</h3>

      {/* SCROLL AREA */}
      <div ref={chatRef}className="flex-1 overflow-y-auto space-y-2 mb-3">
      {messages.map((m, i) => (
      <div
        key={i}
        className={`flex ${
          m.userId === currentUser._id ? "justify-end" : "justify-start"}`}>
        <div
          className={`px-3 py-2 rounded-lg max-w-[70%] text-sm
          ${
            m.userId === currentUser._id
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}>
          <div className="text-xs opacity-70">{m.name}</div>
          <h1>{m.text}</h1>
          
        </div>
      </div>
    ))}
   </div>
   {typingUser && (
    <div className="text-sm text-gray-500 mb-2 italic">
     {typingUser} is typing...
    </div>
    )}

  
   {/* INPUT */}
    <div className="flex gap-2">
      <input
      value={input}
      onChange={(e) => {
      setInput(e.target.value);
      socket.emit("chat:typing", {
        roomcode,
        userId: currentUser._id,
        name: currentUser.name
        });
       }}
      className="flex-1 border rounded-lg px-2 py-1"
      placeholder="Type message..."/>
     <button onClick={sendMessage}className="bg-blue-500 text-white px-3 rounded-lg">
      Send
     </button>
    </div>

  </div>
  

    </div>
</div>
)
}


