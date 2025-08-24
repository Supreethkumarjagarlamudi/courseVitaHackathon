import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='w-full flex flex-col items-center justify-center gap-3 py-10 text-lg'>
      <div className='flex justify-between gap-10 max-md:flex-col max-md:gap-5 text-gray-700'>
        <div className='w-1/2 max-md:w-full flex flex-col justify-center'>
          <div>
            <Link to="/"><img src={'./logo(full).png'} alt="Logo" className='w-36'/></Link>
          </div>
          <div className='text-sm text-gray-700 py-5'>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </div>
        </div>
        <div className='w-1/4 max-md:w-full flex flex-col justify-center gap-3'>
          <div className='flex items-center'>
            <h1 className='text-xl font-semibold'>Quick Links</h1>
          </div>
          <div className='flex flex-col'>
            <ul className='flex flex-col gap-1'>
              <Link to="/"><li className='text-sm hover:font-semibold'>Home</li></Link>
              <Link to="/about"><li className='text-sm hover:font-semibold'>About</li></Link>
              <Link to="/events"><li className='text-sm hover:font-semibold'>Events</li></Link>
              <Link to="#"><li className='text-sm hover:font-semibold'>Privacy Policy</li></Link>
            </ul>
          </div>
        </div>
        <div className='w-1/4 max-md:w-full flex flex-col justify-center gap-3'>
          <div className='flex items-center'>
            <h1 className='text-xl font-semibold'>Get in Touch</h1> 
          </div>
          <div className='flex flex-col'>
            <div className='flex flex-col gap-1 text-gray-700'>
                <p>+91-9963752468</p>
                <p>jsupreeth2005@gmail.com</p>
                <div className='flex gap-3 py-1'>
                  <Link to="#"><i className='fa-brands fa-linkedin hover:scale-120 transition ease-in-out'></i></Link>
                  <Link to="#"><i className="fa-brands fa-github hover:scale-120 transition ease-in-out"></i></Link>
                  <Link to="#"><i className="fa-brands fa-instagram hover:scale-120 transition ease-in-out"></i></Link>
                </div>
              </div>
            </div>
        </div>
      </div>
      <div className='flex justify-center items-center border-t-1 border-gray-300 w-full py-3 text-sm font-semibold text-center'>
        Copyright 2025&#169; SupreethKumar.dev - All Right Reserved.
      </div>
    </div>
  )
}

export default Footer