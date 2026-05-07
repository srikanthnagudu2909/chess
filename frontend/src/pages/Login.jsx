import { useDispatch } from "react-redux";
import { login, fetch } from "../slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  async function handlesubmit(e) {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const email = formdata.get("email");
    const password = formdata.get("password");

    try {
      await dispatch(login({ email, password })).unwrap();
      await dispatch(fetch()).unwrap();

      enqueueSnackbar("Login successful", { variant: "success" });
    
      navigate("/lobby");
    } catch (err) {
      enqueueSnackbar("Login Failed", { variant: "error" });
      console.log(err);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 px-4">
      
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to continue
        </p>

        {/* Form */}
        <form onSubmit={handlesubmit} className="space-y-5">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 active:scale-95 transition-all"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Guest Button */}
        <button
          onClick={() => navigate("/guest")}
          className="w-full border border-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Continue as Guest
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
};