import React, { useState, useEffect } from "react";
import axios from "axios";
import "./dashboard.css";
import { API_BASE_URL } from "../config";

const Analytics = () => {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Analytics user payload:", payload);
        setUser(payload);
        fetchAnalytics(payload.userId);
      } catch (err) {
        console.error("Token parsing error:", err);
        setError("Authentication error. Please login again.");
      }
    } else {
      setError("Please login to access analytics");
    }
  }, []);

  const fetchAnalytics = async (studentId) => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      const res = await axios.get(
        `${API_BASE_URL}/api/goals/analytics/${studentId}`
      );
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      console.error("Error response:", err.response?.data);
      setError(
        `Failed to fetch analytics data: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionRate = () => {
    if (!analytics || !analytics.totalGoals || analytics.totalGoals === 0)
      return 0;
    return (
      analytics.completionRate ||
      Math.round((analytics.completedGoals / analytics.totalGoals) * 100)
    );
  };

  const getStreakDays = () => {
    if (
      !analytics ||
      !analytics.dailyCompletions ||
      analytics.dailyCompletions.length === 0
    )
      return 0;

    let streak = 0;
    const today = new Date();
    const sortedDays = analytics.dailyCompletions.sort(
      (a, b) => new Date(b._id) - new Date(a._id)
    );

    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = new Date(sortedDays[i]._id);
      const diffDays = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getColorForCategory = (category) => {
    const colors = {
      academic: "#6e48aa",
      personal: "#ff6b6b",
      health: "#4ecdc4",
      career: "#45b7d1",
      other: "#96ceb4",
    };
    return colors[category] || "#95a5a6";
  };

  const getColorForPriority = (priority) => {
    const colors = {
      high: "#ff4757",
      medium: "#ffa502",
      low: "#2ed573",
    };
    return colors[priority] || "#6e48aa";
  };

  const SimpleBarChart = ({ data, title, colorKey }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 2px 10px #b39ddb33",
      }}
    >
      <h3 style={{ margin: "0 0 20px 0", color: "#6e48aa" }}>{title}</h3>
      <div style={{ height: 200 }}>
        {data && data.length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "end",
              height: "100%",
              gap: 8,
            }}
          >
            {data.map((item, index) => {
              const maxValue = Math.max(
                ...data.map((d) => d.count || d.completions || 0)
              );
              const height =
                maxValue > 0
                  ? ((item.count || item.completions || 0) / maxValue) * 160
                  : 0;
              const color =
                colorKey === "category"
                  ? getColorForCategory(item._id)
                  : colorKey === "priority"
                  ? getColorForPriority(item._id)
                  : "#6e48aa";

              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      background: color,
                      width: "100%",
                      height: `${height}px`,
                      borderRadius: "4px 4px 0 0",
                      minHeight: height > 0 ? "8px" : "0",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "bold",
                      paddingBottom: 4,
                      position: "relative",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {(item.count || item.completions || 0) > 0 &&
                      (item.count || item.completions || 0)}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#666",
                      textAlign: "center",
                      wordBreak: "break-word",
                      lineHeight: 1.2,
                      maxWidth: "100%",
                    }}
                  >
                    {item._id
                      ? typeof item._id === "string"
                        ? item._id.length > 8
                          ? formatDate(item._id)
                          : item._id
                        : formatDate(item._id)
                      : "N/A"}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: 14,
              background: "#f8f9fa",
              borderRadius: 8,
              border: "2px dashed #ddd",
            }}
          >
            📈 Complete some goals to see your daily progress!
          </div>
        )}
      </div>
    </div>
  );

  const PieChart = ({ data, title, colorKey }) => (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 20,
        boxShadow: "0 2px 10px #b39ddb33",
      }}
    >
      <h3 style={{ margin: "0 0 20px 0", color: "#6e48aa" }}>{title}</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            position: "relative",
            flexShrink: 0,
          }}
        >
          {data && data.length > 0 ? (
            <>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: `conic-gradient(${data
                    .map((item, index) => {
                      const total = data.reduce(
                        (sum, d) => sum + (d.count || 0),
                        0
                      );
                      const percentage =
                        total > 0 ? ((item.count || 0) / total) * 100 : 0;
                      const color =
                        colorKey === "category"
                          ? getColorForCategory(item._id)
                          : colorKey === "priority"
                          ? getColorForPriority(item._id)
                          : "#6e48aa";
                      return `${color} ${
                        index === 0
                          ? 0
                          : (data
                              .slice(0, index)
                              .reduce((sum, d) => sum + (d.count || 0), 0) /
                              total) *
                            360
                      }deg ${
                        (data
                          .slice(0, index + 1)
                          .reduce((sum, d) => sum + (d.count || 0), 0) /
                          total) *
                        360
                      }deg`;
                    })
                    .join(", ")})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#fff",
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#6e48aa",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                {data.reduce((sum, d) => sum + (d.count || 0), 0)}
              </div>
            </>
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                fontSize: 14,
              }}
            >
              No Data
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          {data && data.length > 0 ? (
            data.map((item, index) => {
              const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
              const percentage =
                total > 0 ? Math.round(((item.count || 0) / total) * 100) : 0;
              const color =
                colorKey === "category"
                  ? getColorForCategory(item._id)
                  : colorKey === "priority"
                  ? getColorForPriority(item._id)
                  : "#6e48aa";
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                    padding: "8px 12px",
                    background: "#f8f9fa",
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#333",
                        textTransform: "capitalize",
                      }}
                    >
                      {item._id}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {item.count || 0} goals ({percentage}%)
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                color: "#666",
                fontSize: 14,
                textAlign: "center",
                padding: 20,
              }}
            >
              No data to display
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 18, color: "#6e48aa" }}>
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 18, color: "#ff4757" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Track your goal completion progress and productivity metrics</p>
      </header>

      {/* Key Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
            boxShadow: "0 2px 10px #b39ddb33",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#6e48aa",
              marginBottom: 8,
            }}
          >
            {analytics?.totalGoals ?? 0}
          </div>
          <div style={{ color: "#666", fontSize: 14 }}>Total Goals</div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
            boxShadow: "0 2px 10px #b39ddb33",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#2ed573",
              marginBottom: 8,
            }}
          >
            {analytics?.completedGoals ?? 0}
          </div>
          <div style={{ color: "#666", fontSize: 14 }}>Completed Goals</div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
            boxShadow: "0 2px 10px #b39ddb33",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#ffa502",
              marginBottom: 8,
            }}
          >
            {analytics?.completionRate ?? 0}%
          </div>
          <div style={{ color: "#666", fontSize: 14 }}>Completion Rate</div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
            boxShadow: "0 2px 10px #b39ddb33",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#ff6b6b",
              marginBottom: 8,
            }}
          >
            {getStreakDays()}
          </div>
          <div style={{ color: "#666", fontSize: 14 }}>Day Streak</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <SimpleBarChart
          data={analytics?.dailyCompletions?.slice(-7)}
          title="Daily Completions (Last 7 Days)"
        />
        <PieChart
          data={analytics?.categoryStats}
          title="Goals by Category"
          colorKey="category"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 24,
        }}
      >
        <PieChart
          data={analytics?.priorityStats}
          title="Goals by Priority"
          colorKey="priority"
        />
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 10px #b39ddb33",
          }}
        >
          <h3 style={{ margin: "0 0 20px 0", color: "#6e48aa" }}>
            Productivity Insights
          </h3>
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#6e48aa",
                  marginBottom: 8,
                }}
              >
                🏆 Most Active Category
              </div>
              <div style={{ color: "#666", textTransform: "capitalize" }}>
                {analytics?.categoryStats && analytics.categoryStats.length > 0
                  ? analytics.categoryStats.reduce((prev, curr) =>
                      prev.count > curr.count ? prev : curr
                    )._id
                  : "No data"}
              </div>
            </div>

            <div
              style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#6e48aa",
                  marginBottom: 8,
                }}
              >
                📈 Completion Rate
              </div>
              <div style={{ color: "#666" }}>
                {analytics?.completionRate ?? 0}% across all goals
              </div>
            </div>

            <div
              style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#6e48aa",
                  marginBottom: 8,
                }}
              >
                📊 Goal Distribution
              </div>
              <div style={{ color: "#666", fontSize: 14 }}>
                🔴 High:{" "}
                {analytics?.priorityStats?.find((p) => p._id === "high")
                  ?.count || 0}{" "}
                | 🟡 Medium:{" "}
                {analytics?.priorityStats?.find((p) => p._id === "medium")
                  ?.count || 0}{" "}
                | 🟢 Low:{" "}
                {analytics?.priorityStats?.find((p) => p._id === "low")
                  ?.count || 0}
              </div>
            </div>

            <div
              style={{ padding: 16, background: "#f8f9fa", borderRadius: 8 }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#6e48aa",
                  marginBottom: 8,
                }}
              >
                📅 Recent Activity
              </div>
              <div style={{ color: "#666" }}>
                {analytics?.dailyCompletions &&
                analytics.dailyCompletions.length > 0
                  ? `${
                      analytics.dailyCompletions[
                        analytics.dailyCompletions.length - 1
                      ]?.completions || 0
                    } goals completed recently`
                  : "No recent activity"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
