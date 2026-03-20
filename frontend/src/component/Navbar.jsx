import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet ,Link} from 'react-router-dom'
import { logout } from '../slices/authSlice'


export default function Navbar() {

    const user=useSelector((state)=>state.auth.user)
    const userstatus=useSelector((state)=>state.auth.status)
    console.log(userstatus,"details")
    // const navigate=useNavigate()
    const dispatch=useDispatch()
    function handleloguot(){
        console.log("logout clicked")
        dispatch(logout())
        //navigate("/login")


    }
  return (
    <div>
        <div className="p-4 bg-blue-400 flex flex-row justify-between">
            <div>
            <Link to="/lobby">lobby</Link>
            </div>
            <div>
                {user ?<button onClick={handleloguot}>Logout</button>:
                <div className="flex flex-row gap-4">
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
                </div>}
            </div>
        </div>
        <div className="p-4">
        <Outlet/>
        </div>
     
    </div>
    
  )
}
