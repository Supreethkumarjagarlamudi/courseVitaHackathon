import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
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
        <div className='group relative'>
          <Link to={"/login"}><div className='border-1 text-white border-gray-400 rounded-2xl p-3 bg-[#0d437b]'>Login/Register</div></Link>
          {/* {token &&   <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 bg-white shadow-lg rounded-lg'>
            <div className='flex flex-col gap-2 w-36 py-3 px-5 text-gray-500 bg-slate-100'>
              <p onClick={() => {navigate('/myProfile')}} className="cursor-pointer hover:text-black">My Profile</p>
              <p onClick={() => {navigate('/myOrders')}} className="cursor-pointer hover:text-black">Orders</p>
              <p onClick={logout} className="cursor-pointer hover:text-black">Logout</p>
            </div>
          </div>} */}
        </div>
        <div onClick={()=>setVisible(true)} className="sm:hidden w-5 cursor-pointer"><i className='fa fa-bars'></i></div>
      </div>

      {/* sidebar */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden transition-all bg-white ${visible ? 'w-full' : 'w-0'}`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={()=>setVisible(false)} className='flex items-center gap-4 p-3'>
            <span className="h-4 fa fa-angle-down" alt="" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)}className="py-4 pl-2 border-b-2 border" to={"/"}>Home</NavLink>
          <NavLink onClick={() => setVisible(false)}className="py-4 pl-2 border-b-2" to={"/events"}>Events</NavLink>
          <NavLink onClick={() => setVisible(false)}className="py-4 pl-2 border-b-2" to={"/about"}>About</NavLink>
          <NavLink onClick={() => setVisible(false)}className="py-4 pl-2 border-b-2" to={"/contact"}>Contact</NavLink>
        </div>
      </div>
    </div>

  )
}

export default Navbar
