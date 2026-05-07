import React from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-blue-400 text-white text-center px-4">
      
      <h1 className="text-3xl md:text-5xl font-bold mb-10 tracking-wide">
        COME PLAY CHESS WITH YOUR FRIENDS ♟️
      </h1>

      <div className="flex gap-6">
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-blue-500 hover:bg-green-600 rounded-lg text-lg font-semibold transition duration-300 shadow-lg hover:scale-105"
        >
          LOGIN
        </button>

        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-lg font-semibold transition duration-300 shadow-lg hover:scale-105"
        >
          SIGNUP
        </button>
      </div>

      <div className="mt-10 w-full">
        <Outlet />
      </div>
      
    </div>
  )
}

export default Home