// Central place for the backend API base URL.
// In production, set VITE_API_URL in your hosting provider's environment
// variables (e.g. Vercel) to your deployed backend URL, e.g.
// https://smartstudent-server.onrender.com
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
