import {Routes, Route} from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import OccasioContextProvider from './context/OccasioContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Profile from './pages/Profile'
import MyEvents from './pages/MyEvents'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import RegistrationSuccess from './pages/RegistrationSuccess'
import Footer from './components/Footer'

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] 1g:px-[9vw]'>
          <Navbar></Navbar>
          <Routes>
            <Route path={'/'} element={<Home></Home>}></Route>
            <Route path={'/about'} element={<About></About>}></Route>
            <Route path={'/contact'} element={<Contact></Contact>}></Route>
            <Route path={'/events'} element={<Events></Events>}></Route>
            <Route path={'/events/:eventId'} element={<EventDetails></EventDetails>}></Route>
            <Route path={'/registration-success/:rsvpId'} element={
              <ProtectedRoute requireAuth={true}>
                <RegistrationSuccess></RegistrationSuccess>
              </ProtectedRoute>
            }></Route>
            <Route path={'/login'} element={
              <ProtectedRoute requireAuth={false}>
                <Login></Login>
              </ProtectedRoute>
            }></Route>
            <Route path={'/myEvents'} element={
              <ProtectedRoute requireAuth={true}>
                <MyEvents></MyEvents>
              </ProtectedRoute>
            }></Route>
            <Route path={'/profile'} element={
              <ProtectedRoute requireAuth={true}>
                <Profile></Profile>
              </ProtectedRoute>
            }></Route>
          </Routes>
          <Footer></Footer>
        </div>
  )
}

export default App
