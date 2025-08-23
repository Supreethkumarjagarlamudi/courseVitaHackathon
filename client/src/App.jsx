import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Login from './pages/Login'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] 1g:px-[9vw]'>
      <Navbar></Navbar>
      <Routes>
        <Route path={'/'} element={<Home></Home>}></Route>
        <Route path={'/login'} element={<Login></Login>}></Route>
      </Routes>
    </div>
  )
}

export default App
