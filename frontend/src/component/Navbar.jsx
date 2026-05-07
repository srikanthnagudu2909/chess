import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet ,Link, useNavigate} from 'react-router-dom'
import { fetch, logout } from '../slices/authSlice'
import { FiLogOut } from "react-icons/fi";
import { CgProfile } from "react-icons/cg";
import { GrScorecard } from "react-icons/gr";
import { FaChessKnight } from "react-icons/fa6";
import { TbMinusVertical } from "react-icons/tb";
export default function Navbar() {

    const user=useSelector((state)=>state.auth.user)
    const userstatus=useSelector((state)=>state.auth.status)
    const dispatch=useDispatch()
    //console.log(userstatus,"details")
     const navigate=useNavigate()
    //const dispatch=useDispatch()
    function handleloguot(){
        localStorage.clear("guest")
        console.log("logout clicked")
        dispatch(logout())
        navigate("/")



    }
   
  return (
  <div className="min-h-screen bg-gray-100">

    {/* Navbar */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">

      {/* Left - Logo */}
      <Link to="/lobby" className="flex items-center gap-2 text-xl font-semibold">
        <FaChessKnight className="w-6 h-6" />
        Lobby
      </Link>

      {/* Right - Menu */}
      <div className="flex items-center gap-6 text-sm md:text-base">

        {user ? (
          <>
            <Link to="/leaderboard" className="flex items-center gap-2 hover:opacity-80">
              <GrScorecard className="w-5 h-5" />
              Leaderboard
            </Link>

            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80">
              <CgProfile className="w-5 h-5" />
              Profile
            </Link>

            <button
              onClick={handleloguot}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <FiLogOut className="w-5 h-5" />
              Logout
            </button>
          </>
        ) : (
          <>
            {/* <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Signup</Link> */}
          </>
        )}

      </div>
    </div>

    {/* Page Content */}
    <div className="p-6">
      <Outlet />
    </div>

  </div>
);
}
