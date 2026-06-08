import './Register.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import login styles for layout
import { API_BASE_URL } from "../config";
// Standardized dropdown values
const SEMESTERS = ['1','2','3','4','5','6','7','8'];
const YEARS = ['1','2','3','4'];
const BRANCHES = ['CS','Mechanical','Electrical','ECE'];

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [rollNo, setRollNo] = useState('');

  const navigate = useNavigate();

  // Simple email regex validation
  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const clearMessageAndFields = () => setMessage('');

  const handleSendOtp = async () => {
    clearMessageAndFields();
    if (!email) return setMessage('Please enter your email');
    if (!isValidEmail(email)) return setMessage('Please enter a valid email');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/send-otp`, { email, purpose: 'register' });
      setStep(2);
      setMessage(res.data.message || 'OTP sent to your email');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    clearMessageAndFields();
    if (!otp) return setMessage('Please enter the OTP');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/verify-otp`, { email, otp });
      setStep(3);
      setMessage(res.data.message || 'OTP verified successfully');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    clearMessageAndFields();
    if (!name || !email || !password || !otp)
      return setMessage('Please fill all fields');
    if (role === 'student' && (!semester || !year || !branch || !rollNo))
      return setMessage('Please fill all student fields including Roll No');
    if (password.length < 6) return setMessage('Password should be at least 6 characters');
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        otp,
        role,
        semester,
        year,
        branch
      };
      if (role === 'student') {
        payload.rollNo = rollNo.toUpperCase();
      }
      const res = await axios.post(`${API_BASE_URL}/api/register`, payload);
      setMessage(res.data.message || 'Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <h1>Welcome to SmartStudent</h1>
        <p>Your academic dashboard in one place.</p>
      </div>
      <div className="login-right">
        <div className="login-box">
          <h2>Register</h2>
          {message && <p className="message">{message}</p>}
          {step === 1 && (
            <div className="step-box">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button onClick={handleSendOtp} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="step-box">
              <label>Enter OTP:</label>
              <input
                type="text"
                placeholder="Enter the OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <div className="otp-buttons">
                <button onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button onClick={handleSendOtp} disabled={loading}>
                  Resend OTP
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="step-box">
              <label>Name:</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)} // Don't format here
              onBlur={() => {
                const formatted = name
                  .toLowerCase()
                  .split(' ')
                  .filter(Boolean)
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                setName(formatted);
              }}
              disabled={loading}
            />
              <label>Password:</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              {role === 'student' && (
                <>
                  <label>Semester:</label>
                  <select value={semester} onChange={e => setSemester(e.target.value)} disabled={loading}>
                    <option value="">Select Semester</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <label>Year:</label>
                  <select value={year} onChange={e => setYear(e.target.value)} disabled={loading}>
                    <option value="">Select Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <label>Branch:</label>
                  <select value={branch} onChange={e => setBranch(e.target.value)} disabled={loading}>
                    <option value="">Select Branch</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <label>Roll No:</label>
                  <input
                    type="text"
                    placeholder="Enter Roll Number"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value.toUpperCase())}
                    disabled={loading}
                  />
                </>
              )}
              <label>Role:</label>
              <select value={role} onChange={e => setRole(e.target.value)} disabled={loading} style={{marginBottom: '20px', padding: '10px', borderRadius: '6px', border: '1px solid #ccc'}}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
              <button onClick={handleRegister} disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
          )}
          <div className="bottom-links">
            <p className="link-text" onClick={() => navigate('/login')}>
              Already have an account? Login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
