import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5188/api/auth/login', credentials);
      
      // Store the essential identification data
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('userName', res.data.fullName);

      // Instantly update the parent state in App.js
      if (res.data.role === 'Admin') {
        setAuth(true); 
        navigate('/admin');
      } else {
        setAuth(false);
        navigate('/cars');
      }
    } catch (err) {
      console.error(err);
      alert("Invalid Email or Password. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to DriveSelect</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">EMAIL</label>
          <input type="email" placeholder="admin@example.com" className="w-full p-3 border-2 border-gray-50 rounded-xl focus:border-blue-500 outline-none transition-all" required 
            onChange={e => setCredentials({...credentials, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">PASSWORD</label>
          <input type="password" placeholder="••••••••" className="w-full p-3 border-2 border-gray-50 rounded-xl focus:border-blue-500 outline-none transition-all" required 
            onChange={e => setCredentials({...credentials, password: e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition-all mt-4">
          Login
        </button>
      </form>
      <p className="mt-6 text-center text-gray-500 text-sm">
        New to the platform? <a href="/signup" className="text-blue-600 font-bold hover:underline">Create Account</a>
      </p>
    </div>
  );
};

export default Login;