import { Route,Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Lobby } from './pages/Lobby'
import Navbar from './component/Navbar'
import Proctect from './component/Proctect'
import { Room } from './pages/Room'

function App() {


  return (
    <Routes>
      <Route  path="/"element={<Navbar/>}>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route element={<Proctect/>}>
       <Route path="/lobby" element={<Lobby/>}/>
       <Route path="/rooms/:roomcode" element={<Room/>}/>
      </Route>
      </Route>
    </Routes>
  )
}

export default App
