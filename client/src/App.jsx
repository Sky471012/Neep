import { useState, useEffect } from 'react'
import './App.css'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import Preloader from './components/Preloader'
import Login from './pages/Login';
import LoginAdmin from './pages/LoginAdmin';
import Contactus from './pages/Contactus';
import DownloadApp from './pages/DownloadApp';
import Student from './pages/Student';
import Teacher from './pages/Teacher';
import Admin from './pages/Admin';
import BatchControls from './pages/BatchControls';

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route exact path='/' element={<Home/>} />
            <Route exact path='/login' element={<Login/>} />
            <Route exact path='/loginAdmin' element={<LoginAdmin/>} />
            <Route exact path='/contactus' element={<Contactus/>} />
            <Route exact path='/downloadapp' element={<DownloadApp/>} />
            <Route exact path='/student' element={<Student/>} />
            <Route exact path='/teacher' element={<Teacher/>} />
            <Route exact path='/admin' element={<Admin/>} />
            <Route path="/batch/:batchId" element={<BatchControls />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  )
}

export default App
