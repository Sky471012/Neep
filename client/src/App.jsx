import { useState, useEffect } from 'react'
import './App.css'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import Preloader from './components/Preloader'
import Login from './pages/Login';
import LoginAdmin from './pages/LoginAdmin';
import Contactus from './pages/Contactus';

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
            <Route exact path='//loginAdmin' element={<LoginAdmin/>} />
            <Route exact path='/contactus' element={<Contactus/>} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  )
}

export default App
