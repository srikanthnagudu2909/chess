import { Route,Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Lobby } from './pages/Lobby'
import Navbar from './component/Navbar'
import Proctect from './component/Proctect'
import { Room } from './pages/Room'
import { fetch } from './slices/authSlice'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import { Guest } from './pages/Guest'
import Home from './pages/Home'

function App() {
  const dispatch=useDispatch()
   useEffect(()=>{
       dispatch(fetch()) 
    },[])

  return (
    <Routes>
      <Route  path="/"element={<Home/>}/>
      <Route  element={<Navbar/>}>
      
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/guest" element={<Guest/>}/>
      <Route element={<Proctect/>}>
       <Route path="/lobby" element={<Lobby/>}/>
       <Route path='profile' element={<Profile/>}/>
       <Route path='/leaderboard' element={<Leaderboard/>}/>
       <Route path="/rooms/:roomcode" element={<Room/>}/>

      </Route>
     </Route>
    </Routes>
  )
}

export default App
