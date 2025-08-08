// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import '../styles/Login.css';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [userRole, setUserRole] = useState('admin');
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     setTimeout(() => {
//       if (userRole === 'admin' && email === 'admin@example.com' && password === 'admin123') {
//         navigate('/admin/dashboard');
//       } else if (userRole === 'verifier' && email === 'verifier@example.com' && password === 'verifier123') {
//         navigate('/verifier/dashboard');
//       } else {
//         alert('Invalid credentials for selected role');
//       }
//       setIsLoading(false);
//     }, 1500);
//   };

//   return (
//     <div className="login-single-container">
//       <form className="login-form-card" onSubmit={handleLogin}>
//         <div className="login-logo">
//           <svg xmlns="http://www.w3.org/2000/svg" fill="#4e73df" width="60px" height="60px" viewBox="0 0 24 24">
//             <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/>
//           </svg>
//           <h2>Welcome Back</h2>
//           <p>Login to access the system</p>
//         </div>

//         <div className="form-group">
//           <label htmlFor="userRole">Login As</label>
//           <select
//             id="userRole"
//             value={userRole}
//             onChange={(e) => setUserRole(e.target.value)}
//             required
//           >
//             <option value="admin">Administrator</option>
//             <option value="verifier">Verifier Officer</option>
//           </select>
//         </div>

//         <div className="form-group">
//           <label htmlFor="email">Email Address</label>
//           <input
//             id="email"
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             id="password"
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <div className="form-options">
//           <label className="remember-me">
//             <input type="checkbox" />
//             Remember me
//           </label>
//           <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
//         </div>

//         <button type="submit" className="login-button" disabled={isLoading}>
//           {isLoading ? <span className="spinner"></span> : 'Login'}
//         </button>

//         <div className="login-footer">
//           <p>Don't have an account? <Link to="/contact-admin">Contact Administrator</Link></p>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Login;




import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          role: userRole,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        alert(data.message || 'Login successful');

        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'verifier') {
          navigate('/verifier/dashboard');
        }
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      alert('Network error or server unavailable.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-single-container">
      <form className="login-form-card" onSubmit={handleLogin}>
        <div className="login-logo">
          <svg xmlns="http://www.w3.org/2000/svg" fill="#4e73df" width="60px" height="60px" viewBox="0 0 24 24">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z" />
          </svg>
          <h2>Welcome Back</h2>
          <p>Login to access the system</p>
        </div>

        <div className="form-group">
          <label htmlFor="userRole">Login As</label>
          <select
            id="userRole"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            required
          >
            <option value="admin">Admin</option>
            <option value="verifier">Verifier</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '40px' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#888'
              }}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
        </div>

        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" />
            Remember me
          </label>
          <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
        </div>

        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? <span className="spinner"></span> : 'Login'}
        </button>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/contact-admin">Contact Administrator</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
