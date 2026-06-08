import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import UploadAssignment from "./pages/UploadAssignment";
import RegisteredStudents from "./pages/RegisteredStudents";
import TrackAssignment from "./pages/TrackAssignment";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes with Layout and Outlet */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="goals" element={<Goals />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="upload-assignment" element={<UploadAssignment />} />
          <Route path="registered-students" element={<RegisteredStudents />} />
          <Route path="track-assignments" element={<TrackAssignment />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
