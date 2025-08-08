import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending reset email
    alert(`Reset link sent to ${email}`);
    navigate('/reset-password');
  };

  return (
    <div className="login-single-container">
      <form className="login-form-card" onSubmit={handleSubmit}>
        <h2>Password Recovery</h2>
        <p>Enter your email to receive a reset link.</p>
        <div className="form-group">
          <label>Email address</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
