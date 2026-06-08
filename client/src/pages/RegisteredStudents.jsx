import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { API_BASE_URL } from "../config";

const RegisteredStudents = () => {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "teacher") {
        fetchStudents();
      }
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(res.data.students);
    } catch (err) {
      setMessage("Failed to fetch students");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>👥 Registered Students</h1>
        <p>View all registered students in the system</p>
      </header>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 10px #b39ddb33",
          padding: 24,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#6e48aa" }}>
          All Students ({students.length})
        </h2>

        {message && <p style={{ color: "red", marginBottom: 16 }}>{message}</p>}

        {students.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", fontSize: 16 }}>
            No students registered yet.
          </p>
        ) : (
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #b39ddb",
                    background: "#ede7f6",
                  }}
                >
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: "#6e48aa",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: "#6e48aa",
                    }}
                  >
                    Roll No
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: "#6e48aa",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: "#6e48aa",
                    }}
                  >
                    Semester
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: "#6e48aa",
                    }}
                  >
                    Year
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      color: "#6e48aa",
                    }}
                  >
                    Branch
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student._id}
                    style={{
                      borderBottom: "1px solid #ede7f6",
                      background: index % 2 === 0 ? "#f8f8ff" : "#fff",
                    }}
                  >
                    <td style={{ padding: "12px", fontWeight: 500 }}>
                      {student.name}
                    </td>
                    <td style={{ padding: "12px" }}>{student.rollNo}</td>
                    <td style={{ padding: "12px", color: "#6e48aa" }}>
                      {student.email}
                    </td>
                    <td style={{ padding: "12px" }}>{student.semester}</td>
                    <td style={{ padding: "12px" }}>{student.year}</td>
                    <td style={{ padding: "12px" }}>{student.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredStudents;
