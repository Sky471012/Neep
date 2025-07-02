import { useState,useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import Preloader from './components/Preloader'

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
        <Home/>
      )}
    </>
  )
}

export default App
