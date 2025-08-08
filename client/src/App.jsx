import { useState, useEffect } from 'react'
import './App.css'
import './index.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home'
import Preloader from './components/Preloader'
import Login from './pages/Login';
import AllCourses from './pages/AllCourses';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Contactus from './pages/Contactus';
import Student from './pages/Student';
import Teacher from './pages/Teacher';
import Admin from './pages/Admin';
import AllBatches from './pages/AllBatches';
import AllStudents from './pages/AllStudents';
import AllTeachers from './pages/AllTeachers';
import AllArchivedBatches from './pages/AllArchivedBatches';
import FeeTracking from './pages/FeeTracking';
import BatchControls from './pages/BatchControls';
import TeacherControls from './pages/TeacherControls';
import StudentControls from './pages/StudentControls';

function App() {

  const [loading, setLoading] = useState(true);
  const [hidePreloader, setHidePreloader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidePreloader(true); // start fade-out
      setTimeout(() => {
        setLoading(false); // remove it completely
      }, 500); // wait for fade-out to finish
    }, 2000);

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
        <Preloader fadeOut={hidePreloader} />
      ) : (
        <BrowserRouter>
          <ScrollToHashElement />
          <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/login' element={<Login />} />
            <Route exact path='/all-courses' element={<AllCourses />} />
            <Route exact path='/contactus' element={<Contactus />} />
            <Route exact path='/student' element={<Student />} />
            <Route exact path='/teacher' element={<Teacher />} />
            <Route exact path='/admin' element={<Admin />} />
            <Route exact path='/all-batches' element={<AllBatches />} />
            <Route exact path='/all-students' element={<AllStudents />} />
            <Route exact path='/all-teachers' element={<AllTeachers />} />
            <Route exact path='/all-archived-batches' element={<AllArchivedBatches />} />
            <Route exact path='/fee-tracking' element={<FeeTracking />} />
            <Route path="/batch/:batchId" element={<BatchControls />} />
            <Route path="/teacher/:teacherId" element={<TeacherControls />} />
            <Route path="/student/:studentId" element={<StudentControls />} />
          </Routes>
          <ToastContainer
            position="bottom-center"
            autoClose={1500}
            hideProgressBar={true}
            newestOnTop={true}
            theme="light"
            toastClassName="toastify-custom"
          />
        </BrowserRouter>
      )}
    </>
  )
}

export default App
