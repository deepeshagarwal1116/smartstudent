import './ForgotPassword.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import login styles for layout
import { API_BASE_URL } from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const clearMessage = () => setMessage('');

  const handleSendOtp = async () => {
    clearMessage();
    if (!email) return setMessage('Please enter your email');
    if (!isValidEmail(email)) return setMessage('Please enter a valid email');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/send-otp`, { email, purpose: 'forgot-password' });
      setStep(2);
      setMessage(res.data.message || 'OTP sent to your email');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    clearMessage();
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

  const handleResetPassword = async () => {
    clearMessage();
    if (!newPassword) return setMessage('Please enter your new password');
    if (newPassword.length < 6) return setMessage('Password should be at least 6 characters');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/reset-password`, {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message || 'Password reset successful');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Password reset failed');
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
          <h2>Forgot Password</h2>
          {message && <p className="message">{message}</p>}
          {step === 1 && (
            <div className="step-box">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button onClick={handleSendOtp} disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="step-box">
              <label>Enter OTP:</label>
              <input
                type="text"
                value={otp}
                placeholder="Enter OTP sent to email"
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
              <div className="otp-buttons">
                <button onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button onClick={handleSendOtp} disabled={loading} title="Resend OTP">
                  Resend OTP
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="step-box">
              <label>New Password:</label>
              <input
                type="password"
                value={newPassword}
                placeholder="Enter new password"
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          )}
          <div className="bottom-links">
            <p className="link-text" onClick={() => navigate('/login')}>
              Back to Login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
