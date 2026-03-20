import { useDispatch } from "react-redux"
import { login ,fetch} from "../slices/authSlice"
import { useNavigate } from "react-router-dom"

export const Login=()=>{
    const dispatch=useDispatch()
    const navigate=useNavigate()
   async function handlesubmit(e){
    e.preventDefault()
    const formdata=new FormData(e.target)
    const email=formdata.get("email")
    const password=formdata.get("password")
     //console.log(email,password)
     try{
         await dispatch(login({email,password})).unwrap()
          navigate("/lobby")
         await dispatch(fetch()).unwrap()
       
     }catch(err){
      console.log(err)
     }
    
    
    }
    return(
    <div className="flex items-center justify-center min-h-screen bg-gray-100"> 
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>
        <form onSubmit={handlesubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>

          <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
            Login
          </button>
        </form>

      </div>

    </div>
)
}