// /api/axiosInstance.ts
import axios from "axios";

// Ensure the API base URL is defined
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined in environment variables."
  );
}

// Create an Axios instance with global defaults
const axiosInstance = axios.create({
  // Set your base URL (use an environment variable for production)
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  /* 
    - By default, Next.js fetch requests do not include cookies unless credentials is set. 
    - Make Axios send cookies in its requests automatically 
    */

  withCredentials: true,

  /* 
    - Important: Allow cookies to be stored
    - credentials: "include" ensures the browser stores cookies.
    - Do not manually store cookies (cookies are automatically set via res.cookie from backend). 
    */
});

export default axiosInstance;
