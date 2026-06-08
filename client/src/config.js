// Central place for the backend API base URL.
// In production, set VITE_API_URL in your hosting provider's environment
// variables (e.g. Netlify) to your deployed backend URL, e.g.
// https://smartstudent-server.onrender.com
//
// Trailing slashes are stripped so "https://x.com/" and "https://x.com"
// both produce correct URLs like "https://x.com/api/login" (not "//api/login").
const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");
