import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { signup } from "../slices/authSlice"

export const Signup=()=>{
    const dispatch=useDispatch()
    const navigate=useNavigate()
    async function handlesubmit(e){
        e.preventDefault()
        const form=new FormData(e.target)
        const name=form.get("name")
        const email=form.get("email")
        const password=form.get("password")
        try{
        await dispatch(signup({email,name,password}))
        navigate("/login")
        }catch(err){
            console.log(err)
        }

    }
    return(
   <div className="flex items-center justify-center min-h-screen bg-gray-100"> 
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">
          SIGNUP
        </h2>
        <form onSubmit={handlesubmit}>
             <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
          </div>
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
            Signup
          </button>
        </form>

      </div>

    </div>
    )
}