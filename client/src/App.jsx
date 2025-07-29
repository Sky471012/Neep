import { useState, useEffect } from 'react'
import './App.css'
import './index.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home'
import Preloader from './components/Preloader'
import Login from './pages/Login';
import AllCourses from './pages/AllCourses';
// import LoginAdmin from './pages/LoginAdmin';

import Contactus from './pages/Contactus';
import Student from './pages/Student';
import Teacher from './pages/Teacher';
import Admin from './pages/Admin';
import QuickView from './pages/QuickView';
import BatchControls from './pages/BatchControls';
import TeacherControls from './pages/TeacherControls';
import StudentControls from './pages/StudentControls';

function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  function ScrollToHashElement() {
    const { hash } = useLocation();

    useEffect(() => {
      if (hash) {
        const el = document.getElementById(hash.replace("#", ""));
        if (el) {
          // Timeout helps if content is still loading
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" });
          }, 0);
        }
      }
    }, [hash]);

    return null;
  }

  return (
    <>
      {loading ? (
        <Preloader />
      ) : (
        <BrowserRouter>
          <ScrollToHashElement />
          <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/login' element={<Login />} />
            <Route exact path='/all-courses' element={<AllCourses />} />
            {/* <Route exact path='/loginAdmin' element={<LoginAdmin/>} /> */}
            <Route exact path='/contactus' element={<Contactus />} />
            <Route exact path='/student' element={<Student />} />
            <Route exact path='/teacher' element={<Teacher />} />
            <Route exact path='/admin' element={<Admin />} />
            <Route exact path='/quickView' element={<QuickView />} />
            <Route path="/batch/:batchId" element={<BatchControls />} />
            <Route path="/teacher/:teacherId" element={<TeacherControls />} />
            <Route path="/student/:studentId" element={<StudentControls />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  )
}

export default App
