import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { API_BASE_URL } from "../config";

// Standardized dropdown values
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const YEARS = ["1", "2", "3", "4"];
const BRANCHES = ["CS", "Mechanical", "Electrical", "ECE"];

const TrackAssignment = () => {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [assessmentSemester, setAssessmentSemester] = useState("");
  const [assessmentYear, setAssessmentYear] = useState("");
  const [assessmentBranch, setAssessmentBranch] = useState("");
  const [assessmentTab, setAssessmentTab] = useState("active");
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [grading, setGrading] = useState({});
  const [pdfUrl, setPdfUrl] = useState(null);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [nonActiveAssignments, setNonActiveAssignments] = useState([]);
  const backendBase = `${API_BASE_URL}`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
      if (payload.role === "teacher") {
        fetchStudents();
        fetchAssignments();
        fetchTeacherSubmissions("active");
      }
    }
  }, []);

  useEffect(() => {
    if (user?.role === "teacher") {
      fetchTeacherSubmissions(assessmentTab);
    }
  }, [assessmentTab]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/students`);
      setStudents(res.data.students);
    } catch (err) {
      console.error("Failed to fetch students");
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));

      const res = await axios.get(
        `${API_BASE_URL}/api/assignments/teacher/` +
          payload.userId +
          "/assignments"
      );

      setActiveAssignments(res.data.active || []);
      setNonActiveAssignments(res.data.nonactive || []);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    }
  };

  const fetchTeacherSubmissions = async (status) => {
    try {
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      const res = await axios.get(
        `${API_BASE_URL}/api/assignments/teacher/${payload.userId}/submissions?status=${status}`
      );
      setTeacherSubmissions(res.data.submissions || []);
    } catch (err) {
      setTeacherSubmissions([]);
    }
  };

  const handleGrade = async (assignmentId, studentId) => {
    const marks = grading[assignmentId + "_" + studentId];
    if (!marks) return;
    try {
      await axios.post(`${API_BASE_URL}/api/assignments/grade`, {
        assignmentId,
        studentId,
        marks,
      });
      fetchTeacherSubmissions(assessmentTab);
      setGrading((prev) => ({ ...prev, [assignmentId + "_" + studentId]: "" }));
    } catch {}
  };

  const handlePdfView = (url) => {
    setPdfUrl(url);
  };

  const closePdf = () => setPdfUrl(null);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📊 Track Assignments</h1>
        <p>Monitor assignment status and grade submissions</p>
      </header>

      <section
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 10px #b39ddb33",
          padding: 24,
        }}
      >
        <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
          <button
            onClick={() => setAssessmentTab("active")}
            style={{
              background: assessmentTab === "active" ? "#6e48aa" : "#ede7f6",
              color: assessmentTab === "active" ? "#fff" : "#6e48aa",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
            }}
          >
            Active Assignments
          </button>
          <button
            onClick={() => setAssessmentTab("nonactive")}
            style={{
              background: assessmentTab === "nonactive" ? "#6e48aa" : "#ede7f6",
              color: assessmentTab === "nonactive" ? "#fff" : "#6e48aa",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
            }}
          >
            Non-Active Assignments
          </button>
          <button
            onClick={() => setAssessmentTab("tobereviewed")}
            style={{
              background:
                assessmentTab === "tobereviewed" ? "#6e48aa" : "#ede7f6",
              color: assessmentTab === "tobereviewed" ? "#fff" : "#6e48aa",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
            }}
          >
            To Be Reviewed
          </button>
          <button
            onClick={() => setAssessmentTab("reviewed")}
            style={{
              background: assessmentTab === "reviewed" ? "#6e48aa" : "#ede7f6",
              color: assessmentTab === "reviewed" ? "#fff" : "#6e48aa",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontWeight: 600,
            }}
          >
            Reviewed Assignments
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <select
            value={assessmentSemester}
            onChange={(e) => setAssessmentSemester(e.target.value)}
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
            value={assessmentYear}
            onChange={(e) => setAssessmentYear(e.target.value)}
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
            value={assessmentBranch}
            onChange={(e) => setAssessmentBranch(e.target.value)}
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

        {/* Assessment Section Content */}
        {assessmentTab === "active" && (
          <ul
            style={{
              background: "#f8f8ff",
              borderRadius: 8,
              boxShadow: "0 2px 8px #b39ddb22",
              padding: 16,
              marginTop: 8,
            }}
          >
            {activeAssignments
              .filter((a) => {
                return a.assignedTo.some((studentId) => {
                  const s = students.find((stu) => stu._id === studentId);
                  return (
                    s &&
                    (!assessmentSemester ||
                      s.semester === assessmentSemester) &&
                    (!assessmentYear || s.year === assessmentYear) &&
                    (!assessmentBranch || s.branch === assessmentBranch)
                  );
                });
              })
              .map((a) => (
                <li key={a._id} style={{ marginBottom: 16 }}>
                  <strong>{a.title}</strong>{" "}
                  <div style={{ fontSize: 13, color: "#6e48aa", marginTop: 4 }}>
                    <strong>📅 Assigned:</strong>{" "}
                    {new Date(
                      a.assignedDate || a.createdAt
                    ).toLocaleDateString()}
                  </div>
                  <span style={{ color: "#d32f2f" }}>
                    Deadline: {new Date(a.deadline).toLocaleDateString()}
                  </span>
                  {/* Show Teacher Assignment PDF */}
                  {a.fileUrl && (
                    <div style={{ marginTop: 6 }}>
                      {a.fileUrl.endsWith(".pdf") ? (
                        <a
                          href={backendBase + a.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#6e48aa" }}
                        >
                          📄 View Assignment PDF
                        </a>
                      ) : (
                        <img
                          src={backendBase + a.fileUrl}
                          alt="Assignment File"
                          style={{
                            maxWidth: "120px",
                            height: "auto",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                          }}
                        />
                      )}
                    </div>
                  )}
                </li>
              ))}
            {activeAssignments.length === 0 && <li>No active assignments.</li>}
          </ul>
        )}

        {assessmentTab === "nonactive" && (
          <ul
            style={{
              background: "#f8f8ff",
              borderRadius: 8,
              boxShadow: "0 2px 8px #b39ddb22",
              padding: 16,
              marginTop: 8,
            }}
          >
            {nonActiveAssignments
              .filter((a) =>
                a.assignedTo.some((studentId) => {
                  const s = students.find((stu) => stu._id === studentId);
                  return (
                    s &&
                    (!assessmentSemester ||
                      s.semester === assessmentSemester) &&
                    (!assessmentYear || s.year === assessmentYear) &&
                    (!assessmentBranch || s.branch === assessmentBranch)
                  );
                })
              )
              .map((a) => (
                <li key={a._id} style={{ marginBottom: 8 }}>
                  <strong>{a.title}</strong>{" "}
                  <div style={{ fontSize: 13, color: "#6e48aa", marginTop: 4 }}>
                    <strong>📅 Assigned:</strong>{" "}
                    {new Date(
                      a.assignedDate || a.createdAt
                    ).toLocaleDateString()}
                  </div>
                  <span style={{ color: "#d32f2f" }}>
                    Deadline: {new Date(a.deadline).toLocaleDateString()}
                  </span>
                  <span style={{ color: "#d32f2f" }}>
                    Deadline: {new Date(a.deadline).toLocaleDateString()}
                  </span>
                  {/* Show Teacher Assignment PDF */}
                  {a.fileUrl && (
                    <div style={{ marginTop: 6 }}>
                      {a.fileUrl.endsWith(".pdf") ? (
                        <a
                          href={backendBase + a.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#6e48aa" }}
                        >
                          📄 View Assignment PDF
                        </a>
                      ) : (
                        <img
                          src={backendBase + a.fileUrl}
                          alt="Assignment File"
                          style={{
                            maxWidth: "120px",
                            height: "auto",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                          }}
                        />
                      )}
                    </div>
                  )}
                </li>
              ))}

            {nonActiveAssignments.filter((a) =>
              a.assignedTo.some((studentId) => {
                const s = students.find((stu) => stu._id === studentId);
                return (
                  s &&
                  (!assessmentSemester || s.semester === assessmentSemester) &&
                  (!assessmentYear || s.year === assessmentYear) &&
                  (!assessmentBranch || s.branch === assessmentBranch)
                );
              })
            ).length === 0 && <li>No non-active assignments.</li>}
          </ul>
        )}

        {assessmentTab === "tobereviewed" && (
          <ul
            style={{
              background: "#f8f8ff",
              borderRadius: 8,
              boxShadow: "0 2px 8px #b39ddb22",
              padding: 16,
              marginTop: 8,
            }}
          >
            {teacherSubmissions
              .filter((s) => s.status === "submitted")
              .filter((s) => {
                const stu = students.find((stu) => stu._id === s.student._id);
                return (
                  stu &&
                  (!assessmentSemester ||
                    stu.semester === assessmentSemester) &&
                  (!assessmentYear || stu.year === assessmentYear) &&
                  (!assessmentBranch || stu.branch === assessmentBranch)
                );
              })
              .map((s) => (
                <li
                  key={s.assignmentId + "_" + s.student._id}
                  style={{
                    marginBottom: 24,
                    borderBottom: "1px solid #ede7f6",
                    paddingBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{s.assignmentTitle}</strong>{" "}
                      <span style={{ color: "#6e48aa", fontSize: 13 }}>
                        ({s.student.name} – {s.student.rollNo})
                      </span>
                    </div>
                    <div>
                      {s.fileUrl && (
                        <button
                          onClick={() => handlePdfView(backendBase + s.fileUrl)}
                          style={{
                            background: "#ede7f6",
                            color: "#6e48aa",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 10px",
                            cursor: "pointer",
                          }}
                        >
                          View PDF
                        </button>
                      )}
                    </div>
                  </div>
                  {s.answer && (
                    <div style={{ margin: "8px 0" }}>
                      <b>Answer:</b> {s.answer}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      placeholder="Marks"
                      value={
                        grading[s.assignmentId + "_" + s.student._id] || ""
                      }
                      onChange={(e) =>
                        setGrading((prev) => ({
                          ...prev,
                          [s.assignmentId + "_" + s.student._id]:
                            e.target.value,
                        }))
                      }
                      style={{
                        width: 80,
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #b39ddb",
                      }}
                    />
                    <button
                      onClick={() => handleGrade(s.assignmentId, s.student._id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        background: "#6e48aa",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Grade
                    </button>
                    {s.marks !== null && (
                      <span style={{ marginLeft: 12, color: "#4b2c7a" }}>
                        Marks: {s.marks}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            {teacherSubmissions.filter((s) => s.status === "submitted")
              .length === 0 && <li>No assignments to be reviewed.</li>}
          </ul>
        )}

        {assessmentTab === "reviewed" && (
          <ul
            style={{
              background: "#f8f8ff",
              borderRadius: 8,
              boxShadow: "0 2px 8px #b39ddb22",
              padding: 16,
              marginTop: 8,
            }}
          >
            {teacherSubmissions
              .filter((s) => s.status === "reviewed")
              .filter((s) => {
                const stu = students.find((stu) => stu._id === s.student._id);
                return (
                  stu &&
                  (!assessmentSemester ||
                    stu.semester === assessmentSemester) &&
                  (!assessmentYear || stu.year === assessmentYear) &&
                  (!assessmentBranch || stu.branch === assessmentBranch)
                );
              })
              .map((s) => (
                <li
                  key={s.assignmentId + "_" + s.student._id}
                  style={{
                    marginBottom: 24,
                    borderBottom: "1px solid #ede7f6",
                    paddingBottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{s.assignmentTitle}</strong>{" "}
                      <span style={{ color: "#6e48aa", fontSize: 13 }}>
                        ({s.student.name} – {s.student.rollNo})
                      </span>
                    </div>
                    <div>
                      {s.fileUrl && (
                        <button
                          onClick={() => handlePdfView(backendBase + s.fileUrl)}
                          style={{
                            background: "#ede7f6",
                            color: "#6e48aa",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 10px",
                            cursor: "pointer",
                          }}
                        >
                          View PDF
                        </button>
                      )}
                    </div>
                  </div>
                  {s.answer && (
                    <div style={{ margin: "8px 0" }}>
                      <b>Answer:</b> {s.answer}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      placeholder="Marks"
                      value={
                        grading[s.assignmentId + "_" + s.student._id] || ""
                      }
                      onChange={(e) =>
                        setGrading((prev) => ({
                          ...prev,
                          [s.assignmentId + "_" + s.student._id]:
                            e.target.value,
                        }))
                      }
                      style={{
                        width: 80,
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #b39ddb",
                      }}
                    />
                    <button
                      onClick={() => handleGrade(s.assignmentId, s.student._id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        background: "#6e48aa",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Grade
                    </button>
                    {s.marks !== null && (
                      <span style={{ marginLeft: 12, color: "#4b2c7a" }}>
                        Marks: {s.marks}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            {teacherSubmissions.filter((s) => s.status === "reviewed")
              .length === 0 && <li>No reviewed assignments.</li>}
          </ul>
        )}

        {pdfUrl && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.6)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={closePdf}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 16,
                maxWidth: "80vw",
                maxHeight: "80vh",
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closePdf}
                style={{
                  float: "right",
                  background: "#6e48aa",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 12px",
                  marginBottom: 8,
                }}
              >
                Close
              </button>
              <iframe
                src={pdfUrl}
                title="PDF Viewer"
                style={{ width: "70vw", height: "70vh", border: "none" }}
              ></iframe>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TrackAssignment;
