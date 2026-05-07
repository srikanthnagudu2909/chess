import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

function Proctect() {
    const user=useSelector((state)=>state.auth.user)
    const ischecked=useSelector((state)=>state.auth.ischecked)
    const guest = JSON.parse(localStorage.getItem("guest"))
    if(!ischecked && !guest){
      return <h1>...loading</h1>
    }
     if (!user && !guest) {
    return <Navigate to="/login" replace={true} />;
  }
  return (
  <Outlet/>
  )
}

export default Proctect