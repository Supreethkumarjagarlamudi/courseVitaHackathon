import { Link, NavLink } from 'react-router-dom';
import { useState, useContext } from 'react';
import { OccasioContext } from '../context/OccasioContext';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useContext(OccasioContext);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setShowUserMenu(false);
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <div className='flex justify-between items-center font-medium px-4 border-1 border-gray-300 my-2 rounded-3xl'>
      <Link to="/"><img src={'./logo(full).png'} alt="logo" className='w-32'/></Link>
      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink className="flex flex-col items-center" to="/">
          <p>Home</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink className="flex flex-col items-center" to="/events">
          <p>Events</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink className="flex flex-col items-center" to="/about">
          <p>About</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
        <NavLink className="flex flex-col items-center" to="/contact">
          <p>Contact</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
        </NavLink>
      </ul>

      <div className='flex gap-6 items-center'>
        {isAuthenticated && user ? (
          <div className='group relative'>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className='flex items-center gap-2 border-1 text-white border-gray-400 rounded-2xl p-3 bg-[#0d437b] hover:bg-[#0a3560]'
            >
              <span>{user.fullName}</span>
              <i className='fa fa-chevron-down'></i>
            </button>
            
            {showUserMenu && (
              <div className='absolute right-0 pt-4 bg-white shadow-lg rounded-lg z-50 min-w-[200px]'>
                <div className='flex flex-col gap-2 py-3 px-5 text-gray-500 bg-slate-100'>
                  <div className='border-b border-gray-300 pb-2 mb-2'>
                    <p className='font-semibold text-gray-700'>{user.fullName}</p>
                    <p className='text-sm'>{user.email}</p>
                    {isAdmin && (
                      <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                        Admin
                      </span>
                    )}
                  </div>
                  <Link 
                    to='/profile' 
                    className="cursor-pointer hover:text-black py-1"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to='/myEvents' 
                    className="cursor-pointer hover:text-black py-1"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Events
                  </Link>
                  {isAdmin && (
                    <>
                      <Link 
                        to='/admin/events' 
                        className="cursor-pointer hover:text-black py-1"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Manage Events
                      </Link>
                      <Link 
                        to='/admin/dashboard' 
                        className="cursor-pointer hover:text-black py-1"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  <button 
                    onClick={handleLogout} 
                    className="cursor-pointer hover:text-black py-1 text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to={"/login"}>
            <div className='border-1 text-white border-gray-400 rounded-2xl p-3 bg-[#0d437b] hover:bg-[#0a3560]'>
              Login/Register
            </div>
          </Link>
        )}
        
        <div onClick={()=>setVisible(true)} className="sm:hidden w-5 cursor-pointer">
          <i className='fa fa-bars'></i>
        </div>
      </div>

      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden transition-all bg-white z-50 ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3'>
            <span className="h-4 fa fa-angle-down" alt="" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2 border" to={"/"}>Home</NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/events"}>Events</NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/about"}>About</NavLink>
          <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/contact"}>Contact</NavLink>
          
          {isAuthenticated && user ? (
            <>
              <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/myEvents"}>My Events</NavLink>
              <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/profile"}>Profile</NavLink>
              {isAdmin && (
                <>
                  <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/admin/events"}>Manage Events</NavLink>
                  <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/admin/dashboard"}>Admin Dashboard</NavLink>
                </>
              )}
              <button 
                onClick={() => {
                  handleLogout();
                  setVisible(false);
                }} 
                className="py-4 pl-2 border-b-2 text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink onClick={() => setVisible(false)} className="py-4 pl-2 border-b-2" to={"/login"}>Login</NavLink>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
