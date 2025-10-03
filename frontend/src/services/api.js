// frontend/src/services/api.js
//Axios is like a messenger between your frontend and backend. 
// It helps send requests (like GET, POST) to your backend API and brings back responses.
import axios from 'axios';

const baseURL = window.location.origin;

export const api = axios.create({
  baseURL,  // Now absolute, e.g., 'http://localhost:3000/api'
  withCredentials: true,
});

