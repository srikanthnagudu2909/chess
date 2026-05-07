// 
import React, { useState } from 'react'
import { api } from '../api/client'
import { useSelector } from 'react-redux'
import { ImStarEmpty } from "react-icons/im";
import { IoGameControllerOutline } from "react-icons/io5";
import { GoTrophy } from "react-icons/go";
import { IoClose } from "react-icons/io5";


function Profile() {
  const [file, setFile] = useState()
  const [url, setUrl] = useState()
  const user = useSelector((state) => state.auth.user)
  console.log(user,"profile data")
  

  const uploadFile = async (e) => {
    e.preventDefault()
    const formdata = new FormData()
    formdata.append("file", file)

    const res = await api.post("/upload", formdata)
    setUrl(res.data.avatar)
  }

  return (
    <div className="max-h-screen bg-gray-100 p-6">

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-6">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden border">
            <img
              src={url || "https://via.placeholder.com/150"}
              alt="   avatar"
              className="w-full h-full object-cover"
            />
          </div>
         
          {/* User Info */}
          <div>
            <h2 className="text-xl font-semibold">{user.user.name}</h2>
            <p className="text-gray-500">{user.user.email}</p>

            {/* Upload */}
            <form onSubmit={uploadFile} className="mt-3 flex gap-2">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-sm"
              />
              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                Upload
              </button>
            </form>
          </div>
        </div>

        {/* Right Section */}
        <button className="border px-4 py-2 rounded hover:bg-gray-100">
          Edit Profile
        </button>
      </div>
       {/* <p className='flex items-center justify-between'>User Stats----------------------------------------------------</p> */}

      {/* Stats Section */}
      <div className="max-w-4xl mx-auto mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 flex items-center gap-4 "><ImStarEmpty size={20} className='text-yellow-500 '/>Rating</p>
          <h3 className="text-xl font-bold">{Math.round(user.user.stats.rating)}</h3>
        </div>

        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 flex items-center gap-4 "><IoGameControllerOutline size={20} className='text-yellow-500'/>Games</p>
          <h3 className="text-xl font-bold">{user.user.stats.gamesPlayed}</h3>
        </div>

        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 flex items-center gap-4 "><GoTrophy size={20} className='text-yellow-500'/>Wins</p>
          <h3 className="text-xl font-bold">{user.user.stats.wins}</h3>
        </div>

        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-500 flex items-center gap-4"><IoClose size={30} className='text-yellow-500' />Draws</p>
          <h3 className="text-xl font-bold">{user.user.stats.losses}</h3>
        </div>

      </div>

    </div>
  )
}

export default Profile