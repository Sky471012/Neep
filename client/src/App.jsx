import { useState, useEffect, lazy, Suspense } from 'react'
import './App.css'
import './index.css'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home'
import Preloader from './components/Preloader'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = lazy(() => import('./pages/Login'));
const AllCourses = lazy(() => import('./pages/AllCourses'));
const Contactus = lazy(() => import('./pages/Contactus'));
const Student = lazy(() => import('./pages/Student'));
const Teacher = lazy(() => import('./pages/Teacher'));
const Admin = lazy(() => import('./pages/Admin'));
const AllBatches = lazy(() => import('./pages/AllBatches'));
const AllStudents = lazy(() => import('./pages/AllStudents'));
const AllTeachers = lazy(() => import('./pages/AllTeachers'));
const AllArchivedBatches = lazy(() => import('./pages/AllArchivedBatches'));
const FeeTracking = lazy(() => import('./pages/FeeTracking'));
const BatchControls = lazy(() => import('./pages/BatchControls'));
const TeacherControls = lazy(() => import('./pages/TeacherControls'));
const StudentControls = lazy(() => import('./pages/StudentControls'));
const TodaysBirthdays = lazy(() => import('./pages/TodaysBirthdays'));
const AllEnquiries = lazy(() => import('./pages/AllEnquiries'));
const Enquiry = lazy(() => import('./pages/Enquiry'));

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

  useEffect(() => {
    // A universal event handler for branch switching
    const handleBranchChange = () => {
      console.log("Branch changed globally → reloading app...");
      window.location.reload();
    };

    // Listen for our custom event (not the native storage event)
    window.addEventListener("branchChanged", handleBranchChange);

    return () => {
      window.removeEventListener("branchChanged", handleBranchChange);
    };
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
          <Suspense fallback={null}>
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
              <Route exact path='/todaysBirthdays' element={<TodaysBirthdays />} />
              <Route exact path='/all-enquiries' element={<AllEnquiries />} />
              <Route exact path='/fee-tracking' element={<FeeTracking />} />
              <Route path="/batch/:batchId" element={<BatchControls />} />
              <Route path="/teacher/:teacherId" element={<TeacherControls />} />
              <Route path="/student/:studentId" element={<StudentControls />} />
              <Route path="/enquiry/:enquiryId" element={<Enquiry />} />
            </Routes>
          </Suspense>
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
