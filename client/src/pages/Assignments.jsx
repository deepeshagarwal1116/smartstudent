import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const backendBase = `${API_BASE_URL}`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
      fetchAssignments(payload.userId);
    }
  }, []);

  const fetchAssignments = async (studentId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/assignments/student/${studentId}`
      );
      setAssignments(res.data.assignments || []);
    } catch (err) {
      setAssignments([]);
    }
  };

  // Helper to get submission status for a student assignment
  const getStudentAssignmentStatus = (assignment) => {
    if (!user) return "pending";
    const sub = assignment.submissions?.find(
      (s) => s.student === user.userId || s.student?._id === user.userId
    );
    if (!sub) return "pending";
    return sub.status || "pending";
  };

  const handleAnswerChange = (assignmentId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [assignmentId]: { ...prev[assignmentId], answer: value },
    }));
  };

  const handleFileChange = (assignmentId, file) => {
    setAnswers((prev) => ({
      ...prev,
      [assignmentId]: { ...prev[assignmentId], file },
    }));
  };

  const handleSubmit = async (assignmentId) => {
    setMessage("");
    const answerObj = answers[assignmentId] || {};
    if (!answerObj.file) {
      setMessage("Please upload a file.");
      return;
    }
    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("studentId", user.userId);
    if (answerObj.answer) formData.append("answer", answerObj.answer);
    formData.append("file", answerObj.file);
    try {
      await axios.post(
        `${API_BASE_URL}/api/assignments/submit`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage("Assignment submitted successfully!");
      setAnswers((prev) => ({ ...prev, [assignmentId]: {} }));
      fetchAssignments(user.userId);
    } catch (err) {
      setMessage("Failed to submit assignment.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📚 Your Assigned Assignments</h1>
      <ul
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #b39ddb22",
          padding: 16,
          marginTop: 8,
        }}
      >
        {assignments.length === 0 && (
          <li>No assignments assigned to you yet.</li>
        )}
        {assignments.map((a) => {
          const status = getStudentAssignmentStatus(a);
          return (
            <li
              key={a._id}
              style={{
                marginBottom: 16,
                borderBottom: "1px solid #ede7f6",
                paddingBottom: 12,
                position: "relative",
                background: "#f8f8ff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>{a.title}</strong>
                <span
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    background:
                      status === "reviewed"
                        ? "#4caf50"
                        : status === "submitted"
                        ? "#2196f3"
                        : "#ff9800",
                    color: "#fff",
                    borderRadius: 12,
                    padding: "2px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {(() => {
                    const submission = a.submissions?.find(
                      (s) =>
                        s.student === user.userId ||
                        s.student?._id === user.userId
                    );
                    const gradePart =
                      submission?.grade !== undefined
                        ? ` | Grade: ${submission.grade}/10`
                        : "";
                    return `${
                      status.charAt(0).toUpperCase() + status.slice(1)
                    }${gradePart}`;
                  })()}
                </span>
              </div>

              {/* Assignment Details */}
              <div style={{ marginTop: 8, marginBottom: 8 }}>
                {a.uploadedBy && (
                  <div
                    style={{ fontSize: 13, color: "#6e48aa", marginBottom: 4 }}
                  >
                    <strong>👨‍🏫 Assigned by:</strong> {a.uploadedBy.name} (
                    {a.uploadedBy.email})
                  </div>
                )}
                {a.assignedDate && (
                  <div
                    style={{ fontSize: 13, color: "#6e48aa", marginBottom: 4 }}
                  >
                    <strong>📅 Assigned Date:</strong>{" "}
                    {new Date(a.assignedDate).toLocaleDateString()}
                  </div>
                )}
                {a.deadline && (
                  <div
                    style={{ fontSize: 13, color: "#d32f2f", marginBottom: 4 }}
                  >
                    <strong>⏰ Deadline:</strong>{" "}
                    {new Date(a.deadline).toLocaleDateString()}
                  </div>
                )}
              </div>

              {a.fileUrl && (
                <a
                  href={backendBase + a.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#6e48aa" }}
                >
                  [File]
                </a>
              )}
              {a.link && (
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#6e48aa", marginLeft: 8 }}
                >
                  [Link]
                </a>
              )}
              <div style={{ fontSize: 13, color: "#6e48aa", marginTop: 4 }}>
                {a.description}
              </div>
              {/* ✅ STEP 2: Show student's submitted file if available */}
              {(() => {
                const submission = a.submissions?.find(
                  (s) =>
                    s.student === user.userId || s.student?._id === user.userId
                );
                if (!submission?.fileUrl) return null;

                const fullFileUrl = backendBase + submission.fileUrl;

                return (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: -20,
                      justifyContent: "flex-end",
                    }}
                  >
                    {submission.fileUrl.endsWith(".pdf") ? (
                      <a
                        href={fullFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6e48aa" }}
                      >
                        📄 View Submitted PDF
                      </a>
                    ) : (
                      <img
                        src={fullFileUrl}
                        alt="Submitted Answer"
                        style={{
                          maxWidth: "120px",
                          height: "auto",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      />
                    )}
                  </div>
                );
              })()}
              {status === "pending" && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <input
                    type="text"
                    placeholder="Type your answer or notes here (optional)..."
                    value={answers[a._id]?.answer || ""}
                    onChange={(e) => handleAnswerChange(a._id, e.target.value)}
                    style={{
                      flex: 1,
                      padding: 8,
                      borderRadius: 6,
                      border: "1px solid #b39ddb",
                    }}
                  />
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(a._id, e.target.files[0])}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => handleSubmit(a._id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      background: "#6e48aa",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    Submit
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {message && (
        <p
          style={{
            color: message.includes("success") ? "green" : "red",
            marginTop: 16,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Assignments;
