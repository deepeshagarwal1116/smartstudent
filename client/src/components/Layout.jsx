// src/components/Layout.jsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
  const navigate = useNavigate();
  let user = null;
  try {
    const token = localStorage.getItem("token");
    if (token) user = JSON.parse(atob(token.split(".")[1]));
  } catch {}

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isTeacher = user?.role === "teacher";

  return (
    <div className="layout">
      <aside className={`sidebar${isTeacher ? " teacher-sidebar" : ""}`}>
        <h2 className="logo">SmartStudent</h2>
        <nav>
          <ul>
            <li>
              <Link to="/dashboard">🏠 Dashboard</Link>
            </li>
            {isTeacher ? (
              <>
                <li>
                  <Link to="/upload-assignment">📝 Upload Assignment</Link>
                </li>
                <li>
                  <Link to="/registered-students">👥 Registered Students</Link>
                </li>
                <li>
                  <Link to="/track-assignments">📊 Track Assignments</Link>
                </li>
                <li>
                  <Link to="/goals">🎯 Goals</Link>
                </li>
                <li>
                  <Link to="/analytics">� Analytics</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/assignments">� Assignments</Link>
                </li>
                <li>
                  <Link to="/goals">🎯 Goals</Link>
                </li>
                <li>
                  <Link to="/analytics">📈 Analytics</Link>
                </li>
              </>
            )}
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
