import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { API_BASE_URL } from "../config";

// Standardized dropdown values
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const YEARS = ["1", "2", "3", "4"];
const BRANCHES = ["CS", "Mechanical", "Electrical", "ECE"];

const UploadAssignment = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filterSemester, setFilterSemester] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filterMessage, setFilterMessage] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
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

  // Fetch students matching filters
  useEffect(() => {
    if (!filterSemester && !filterYear && !filterBranch) {
      // No filter: show all students
      setFilteredStudents(students);
      setFilterMessage(students.length === 0 ? "No students registered." : "");
      return;
    }
    const fetchFiltered = async () => {
      try {
        const params = [];
        if (filterSemester) params.push(`semester=${filterSemester}`);
        if (filterYear) params.push(`year=${filterYear}`);
        if (filterBranch) params.push(`branch=${filterBranch}`);
        const query = params.length ? `?${params.join("&")}` : "";
        const res = await axios.get(
          `${API_BASE_URL}/api/students/filter${query}`
        );
        setFilteredStudents(res.data.students);
        setFilterMessage(
          res.data.students.length === 0
            ? "No students found with selected criteria."
            : ""
        );
      } catch {
        setFilteredStudents([]);
        setFilterMessage("No students found with selected criteria.");
      }
    };
    fetchFiltered();
  }, [filterSemester, filterYear, filterBranch, students]);

  const handleAssignmentUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!title || (!file && !link) || !deadline) {
      setMessage("Please fill all fields and set a deadline.");
      return;
    }
    // Ensure deadline is in the future
    if (new Date(deadline) <= new Date()) {
      setMessage("Deadline must be a future date.");
      return;
    }
    if (filteredStudents.length > 0 && selectedStudents.length === 0) {
      setMessage("Please select at least one student.");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("file", file);
    if (link) formData.append("link", link);
    formData.append("uploadedBy", user.userId);
    formData.append("assignedTo", JSON.stringify(selectedStudents));
    formData.append("deadline", deadline);
    try {
      await axios.post(
        `${API_BASE_URL}/api/assignments/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage("Assignment uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      setLink("");
      setSelectedStudents([]);
      setDeadline("");
    } catch (err) {
      setMessage("Failed to upload assignment");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📝 Upload Assignment</h1>
        <p>Create and assign new assignments to students</p>
      </header>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 340,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 10px #b39ddb33",
            padding: 24,
          }}
        >
          <h2 style={{ marginBottom: "1rem", color: "#6e48aa" }}>
            Assignment Details
          </h2>
          <form
            onSubmit={handleAssignmentUpload}
            className="assignment-form"
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 10px #b39ddb33",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "vertical" }}
            />
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <input
              type="text"
              placeholder="Paste a link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />

            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">Branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <label style={{ fontWeight: 500, marginTop: 8 }}>
              Select students to assign:
            </label>
            {filterMessage && (
              <div style={{ color: "red", marginBottom: 8 }}>
                {filterMessage}
              </div>
            )}
            <div
              style={{
                maxHeight: 150,
                overflowY: "auto",
                border: "1.5px solid #b39ddb",
                borderRadius: 6,
                padding: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedStudents(filteredStudents.map((s) => s._id))
                  }
                  style={{
                    padding: "4px 10px",
                    fontSize: "14px",
                    borderRadius: "6px",
                    border: "1px solid #b39ddb",
                    background: "#ede7f6",
                    color: "#6e48aa",
                  }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudents([])}
                  style={{
                    padding: "4px 10px",
                    fontSize: "14px",
                    borderRadius: "6px",
                    border: "1px solid #b39ddb",
                    background: "#ede7f6",
                    color: "#6e48aa",
                  }}
                >
                  Deselect All
                </button>
              </div>
              {filteredStudents.map((s) => (
                <div key={s._id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(s._id)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...selectedStudents, s._id]
                          : selectedStudents.filter((id) => id !== s._id);
                        setSelectedStudents(updated);
                      }}
                    />
                    &nbsp;{s.name} – {s.rollNo}
                  </label>
                </div>
              ))}
            </div>

            <label style={{ fontWeight: 500, marginTop: 8 }}>Deadline:</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{
                borderRadius: 6,
                border: "1.5px solid #b39ddb",
                padding: 8,
              }}
            />
            <button type="submit" style={{ marginTop: 12 }}>
              Upload Assignment
            </button>
            {message && (
              <p
                style={{ color: message.includes("success") ? "green" : "red" }}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadAssignment;
