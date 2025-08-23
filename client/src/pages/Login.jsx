import { useState, useEffect } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate} from 'react-router-dom'
import { useContext } from 'react'
import { OccasioContext } from '../context/occasioContext'

const Login = () => {

  const {setUser} = useContext(OccasioContext);
  const [currentState, setCurrentState] = useState('Login')
  const location = useLocation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmitHandler = (e) => {
    e.preventDefault()
  }

  const onClickHandler = async () => {
    try{
      window.location.href = "http://localhost:3000/api/auth/googleOauth";
    }
    catch(err){
        console.log(err)
    }
  }

  useEffect(() => {
    
    const params = new URLSearchParams(location.search);
    const authStatus = params.get("auth");

    if (authStatus === "failure") {
      alert("Login failed, please try again.");
      navigate("/login");
    }
  }, [location, navigate]);
  return (
    <div className='flex flex-col'>
      <div className="w-full flex justify-center items-center gap-3 text-3xl mt-25">
        <div className="flex items-center justify-center gap-2 text-gray-700">
          {currentState}
        </div>
      </div>
      <div className='w-full flex flex-col items-center'>
        <form onSubmit={onSubmitHandler} className='w-full flex flex-col justify-center items-center gap-3 mt-5'>
        {
          currentState === "Login" ? "" : (
            <input onChange={(e) => {setFullName(e.target.value)}} value={fullName} type="text" className='w-full p-2 text-gray-600 border-1 border-gray-400 sm:w-1/3 rounded-sm' placeholder='Full Name' />
          )
        }
        <input onChange={(e) => {setEmail(e.target.value)}} value={email} type="email" className='w-full p-2 text-gray-600 border-1 border-gray-400 sm:w-1/3 rounded-sm' placeholder='Email' />
        <input onChange={(e) => {setPassword(e.target.value)}} value={password} type="password" className='w-full p-2 text-gray-600 border-1 border-gray-400 sm:w-1/3 rounded-sm' placeholder='Password' />
        <div className='w-full sm:w-1/3 flex justify-between text-gray-600 t'>
          <Link to="/forgotPassword">Forgot Your Password?</Link>
          {
            currentState === 'Login' ? (
              <p className="cursor-pointer" onClick={() => {setCurrentState('Sign-Up')}}>Create Account</p>
            ) :
            (
              <p className='cursor-pointer' onClick={() => {setCurrentState('Login')}}>Login here</p>
            )
          }
        </div>
        <button className='p-3 text-white cursor-pointer border-1 border-gray-400 text-xl bg-black rounded-sm'>
          {
            currentState === 'Login' ? 'Sign-In' : 'Sign-Up'
          }
        </button>
        </form>
      </div>
      <div className='flex justify-center items-center text-xl mt-10'>
        <button onClick={onClickHandler} className='border-1 border-gray-400 p-2 rounded-xl'><i className='fa-brands fa-google mr-3'></i>Sign in with Google</button>
      </div>
    </div>
  )
}

export default Login
