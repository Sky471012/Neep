import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App.jsx'
import '@fortawesome/fontawesome-free/css/all.css'

import { noteAuthFailure } from './api'

axios.defaults.withCredentials = true;

// Pages that call axios directly must also flip the UI when the token dies.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      noteAuthFailure(error.response.status, error.response.data);
    }
    throw error;
  }
);

localStorage.removeItem("authToken");

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  headers.delete("Authorization");

  return nativeFetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
