import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [studentAssignments, setStudentAssignments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
      if (payload.role === "student") {
        fetchStudentAssignments(payload.userId);
      }
    }
  }, []);

  const fetchStudentAssignments = async (studentId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/assignments/student/${studentId}`
      );
      setStudentAssignments(res.data.assignments || []);
    } catch (err) {
      setStudentAssignments([]);
    }
  };

  // Helper to get submission status for a student assignment
  const getStudentAssignmentStatus = (assignment) => {
    if (!user) return "pending";
    const sub = assignment.submissions?.find(
      (s) => s.student === user.userId || s.student?._id === user.userId
    );
    if (!sub) return "pending";
    if (sub.status === "completed") return "completed";
    return "pending";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        {user?.role === "teacher" ? (
          <>
            <h1>🧑‍🏫 Welcome Prof. {user?.name}</h1>
            <p>Inspire. Educate. Lead the future.</p>
          </>
        ) : (
          <>
            <h1>🎓 Welcome, {user?.name}</h1>
            <p>Here's your personalized learning space.</p>
          </>
        )}
      </header>

      {user?.role === "teacher" && (
        <div className="dashboard-sections">
          <div className="dashboard-card">
            <h2>📝 Upload Assignment</h2>
            <p>Create and assign new assignments to students.</p>
            <button onClick={() => navigate("/upload-assignment")}>
              Upload Assignment
            </button>
          </div>
          <div className="dashboard-card">
            <h2>👥 Registered Students</h2>
            <p>View all registered students in the system.</p>
            <button onClick={() => navigate("/registered-students")}>
              View Students
            </button>
          </div>
          <div className="dashboard-card">
            <h2>📊 Track Assignments</h2>
            <p>Monitor assignment status and grade submissions.</p>
            <button onClick={() => navigate("/track-assignments")}>
              Track Assignments
            </button>
          </div>
          <div className="dashboard-card">
            <h2>🎯 Personal Goals</h2>
            <p>Set goals & manage daily tasks.</p>
            <button onClick={() => navigate("/goals")}>Manage Goals</button>
          </div>
          <div className="dashboard-card">
            <h2>📈 Analytics</h2>
            <p>Visual progress charts.</p>
            <button onClick={() => navigate("/analytics")}>View Charts</button>
          </div>
        </div>
      )}

      {user?.role !== "teacher" && (
        <>
          <div className="dashboard-sections">
            <div className="dashboard-card">
              <h2>📚 Assignments</h2>
              <p>View & submit your assignments.</p>
              <button onClick={() => navigate("/assignments")}>
                Go to Assignments
              </button>
            </div>
            <div className="dashboard-card">
              <h2>🎯 Personal Goals</h2>
              <p>Set goals & manage daily tasks.</p>
              <button onClick={() => navigate("/goals")}>Manage Goals</button>
            </div>
            <div className="dashboard-card">
              <h2>📈 Analytics</h2>
              <p>Visual progress charts.</p>
              <button onClick={() => navigate("/analytics")}>
                View Charts
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
