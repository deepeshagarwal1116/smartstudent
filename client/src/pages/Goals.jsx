import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dashboard.css";
import { API_BASE_URL } from "../config";

const Goals = () => {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState({
    status: "all",
    category: "all",
    priority: "all",
  });
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "academic",
    dueDate: "",
    tags: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = ["academic", "personal", "health", "career", "other"];
  const priorities = ["low", "medium", "high"];
  const statuses = ["pending", "in-progress", "completed"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("User payload:", payload);
        setUser(payload);
        fetchGoals(payload.userId);
      } catch (err) {
        console.error("Token parsing error:", err);
        setMessage("Authentication error. Please login again.");
      }
    } else {
      setMessage("Please login to access goals");
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [goals, filter]);

  const fetchGoals = async (studentId) => {
    try {
      setLoading(true);
      console.log("Fetching goals for student:", studentId);
      const res = await axios.get(
        `${API_BASE_URL}/api/goals/student/${studentId}`
      );
      console.log("Goals response:", res.data);
      setGoals(res.data.goals || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      console.error("Error response:", err.response?.data);
      setMessage(
        `Failed to fetch goals: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...goals];

    if (filter.status !== "all") {
      filtered = filtered.filter((goal) => goal.status === filter.status);
    }
    if (filter.category !== "all") {
      filtered = filtered.filter((goal) => goal.category === filter.category);
    }
    if (filter.priority !== "all") {
      filtered = filtered.filter((goal) => goal.priority === filter.priority);
    }

    setFilteredGoals(filtered);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      setMessage("Title is required");
      return;
    }

    // Validate due date
    if (newGoal.dueDate) {
      const dueDate = new Date(newGoal.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today

      if (dueDate < today) {
        setMessage("Due date cannot be in the past");
        return;
      }
    }

    try {
      setLoading(true);
      const goalData = {
        ...newGoal,
        student: user.userId,
        tags: newGoal.tags
          ? newGoal.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
      };

      await axios.post(`${API_BASE_URL}/api/goals`, goalData);
      setMessage("Goal created successfully!");
      setShowCreateModal(false);
      setNewGoal({
        title: "",
        description: "",
        priority: "medium",
        category: "academic",
        dueDate: "",
        tags: "",
      });
      fetchGoals(user.userId);
    } catch (err) {
      setMessage(
        `Failed to create goal: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (goalId, updates) => {
    try {
      await axios.put(`${API_BASE_URL}/api/goals/${goalId}`, updates);
      setMessage("Goal updated successfully!");
      fetchGoals(user.userId);
    } catch (err) {
      setMessage("Failed to update goal");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/goals/${goalId}`);
      setMessage("Goal deleted successfully!");
      fetchGoals(user.userId);
    } catch (err) {
      setMessage("Failed to delete goal");
    }
  };

  const handleStatusChange = (goalId, newStatus) => {
    handleUpdateGoal(goalId, { status: newStatus });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#6e48aa";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#2ed573";
      case "in-progress":
        return "#ffa502";
      case "pending":
        return "#ff4757";
      default:
        return "#6e48aa";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "academic":
        return "📚";
      case "personal":
        return "👤";
      case "health":
        return "💪";
      case "career":
        return "💼";
      case "other":
        return "📝";
      default:
        return "📝";
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>🎯 Goals & Tasks</h1>
        <p>Manage your goals and track your productivity</p>
      </header>

      {/* Controls Section */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 2px 10px #b39ddb33",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#6e48aa" }}>Filter Goals</h3>
            <select
              value={filter.status}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, status: e.target.value }))
              }
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #b39ddb",
              }}
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("-", " ")}
                </option>
              ))}
            </select>
            <select
              value={filter.category}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, category: e.target.value }))
              }
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #b39ddb",
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filter.priority}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, priority: e.target.value }))
              }
              style={{
                padding: 8,
                borderRadius: 6,
                border: "1px solid #b39ddb",
              }}
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: "#6e48aa",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add New Goal
          </button>
        </div>

        {/* Goals Summary */}
        <div style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              background: "#f8f8ff",
              padding: 12,
              borderRadius: 8,
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#6e48aa" }}>
              {goals.length}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>Total Goals</div>
          </div>
          <div
            style={{
              background: "#f0fff4",
              padding: 12,
              borderRadius: 8,
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#2ed573" }}>
              {goals.filter((g) => g.status === "completed").length}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>Completed</div>
          </div>
          <div
            style={{
              background: "#fffef0",
              padding: 12,
              borderRadius: 8,
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#ffa502" }}>
              {goals.filter((g) => g.status === "in-progress").length}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>In Progress</div>
          </div>
          <div
            style={{
              background: "#fff0f0",
              padding: 12,
              borderRadius: 8,
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff4757" }}>
              {goals.filter((g) => g.status === "pending").length}
            </div>
            <div style={{ fontSize: 14, color: "#666" }}>Pending</div>
          </div>
        </div>
      </div>

      {message && (
        <div
          style={{
            background: message.includes("successfully")
              ? "#d4edda"
              : "#f8d7da",
            color: message.includes("successfully") ? "#155724" : "#721c24",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            border: `1px solid ${
              message.includes("successfully") ? "#c3e6cb" : "#f5c6cb"
            }`,
          }}
        >
          {message}
        </div>
      )}

      {/* Goals List */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 2px 10px #b39ddb33",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#6e48aa" }}>
          Your Goals ({filteredGoals.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            Loading goals...
          </div>
        ) : filteredGoals.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
            {goals.length === 0
              ? "No goals yet. Create your first goal!"
              : "No goals match your filters."}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filteredGoals.map((goal) => (
              <div
                key={goal._id}
                style={{
                  border: "1px solid #ede7f6",
                  borderRadius: 12,
                  padding: 20,
                  background: goal.status === "completed" ? "#f8fff8" : "#fff",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>
                        {getCategoryIcon(goal.category)}
                      </span>
                      <h4
                        style={{
                          margin: 0,
                          textDecoration:
                            goal.status === "completed"
                              ? "line-through"
                              : "none",
                          color: goal.status === "completed" ? "#666" : "#333",
                        }}
                      >
                        {goal.title}
                      </h4>
                      <span
                        style={{
                          background: getPriorityColor(goal.priority),
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {goal.priority.toUpperCase()}
                      </span>
                    </div>
                    {goal.description && (
                      <p
                        style={{
                          margin: "8px 0",
                          color: "#666",
                          fontSize: 14,
                        }}
                      >
                        {goal.description}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        alignItems: "center",
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      <span>📂 {goal.category}</span>
                      <span>
                        📅{" "}
                        {goal.dueDate
                          ? `Due: ${formatDate(goal.dueDate)}`
                          : "No due date"}
                      </span>
                      <span>📝 Created: {formatDate(goal.createdAt)}</span>
                      {goal.completedAt && (
                        <span>
                          ✅ Completed: {formatDate(goal.completedAt)}
                        </span>
                      )}
                    </div>
                    {goal.tags && goal.tags.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {goal.tags.map((tag, index) => (
                          <span
                            key={index}
                            style={{
                              background: "#ede7f6",
                              color: "#6e48aa",
                              padding: "2px 6px",
                              borderRadius: 8,
                              fontSize: 11,
                              marginRight: 4,
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: getStatusColor(goal.status),
                          flexShrink: 0,
                        }}
                        title={`Status: ${goal.status}`}
                      />
                      <select
                        value={goal.status}
                        onChange={(e) =>
                          handleStatusChange(goal._id, e.target.value)
                        }
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #b39ddb",
                          background: "#fff",
                          color: "#333",
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1).replace("-", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => setEditingGoal(goal)}
                      style={{
                        background: "#ede7f6",
                        color: "#6e48aa",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      style={{
                        background: "#ff4757",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Goal Modal */}
      {(showCreateModal || editingGoal) && (
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
          onClick={() => {
            setShowCreateModal(false);
            setEditingGoal(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              maxWidth: 500,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, color: "#6e48aa" }}>
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </h3>
            <form
              onSubmit={
                editingGoal
                  ? (e) => {
                      e.preventDefault();
                      handleUpdateGoal(editingGoal._id, newGoal);
                      setEditingGoal(null);
                      setNewGoal({
                        title: "",
                        description: "",
                        priority: "medium",
                        category: "academic",
                        dueDate: "",
                        tags: "",
                      });
                    }
                  : handleCreateGoal
              }
            >
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={
                    editingGoal
                      ? newGoal.title || editingGoal.title
                      : newGoal.title
                  }
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter goal title"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #b39ddb",
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Description
                </label>
                <textarea
                  value={
                    editingGoal
                      ? newGoal.description || editingGoal.description || ""
                      : newGoal.description
                  }
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter goal description"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #b39ddb",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={
                      editingGoal
                        ? newGoal.category || editingGoal.category
                        : newGoal.category
                    }
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 6,
                      border: "1px solid #b39ddb",
                    }}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    Priority
                  </label>
                  <select
                    value={
                      editingGoal
                        ? newGoal.priority || editingGoal.priority
                        : newGoal.priority
                    }
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 6,
                      border: "1px solid #b39ddb",
                    }}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  value={
                    editingGoal
                      ? newGoal.dueDate ||
                        (editingGoal.dueDate
                          ? editingGoal.dueDate.split("T")[0]
                          : "")
                      : newGoal.dueDate
                  }
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #b39ddb",
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={
                    editingGoal
                      ? newGoal.tags ||
                        (editingGoal.tags ? editingGoal.tags.join(", ") : "")
                      : newGoal.tags
                  }
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  placeholder="study, exam, project"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #b39ddb",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingGoal(null);
                    setNewGoal({
                      title: "",
                      description: "",
                      priority: "medium",
                      category: "academic",
                      dueDate: "",
                      tags: "",
                    });
                  }}
                  style={{
                    background: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 24px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#6e48aa",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "12px 24px",
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingGoal
                    ? "Update Goal"
                    : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
