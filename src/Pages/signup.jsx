import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5188/api/auth/signup', formData);
      alert("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data || "Registration Failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl border">
      <h2 className="text-2xl font-bold mb-6 text-center">Create DriveSelect Account</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl" required 
          onChange={e => setFormData({...formData, fullName: e.target.value})} />
        <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-xl" required 
          onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="text" placeholder="Phone Number (e.g. 03001234567)" className="w-full p-3 border rounded-xl" required 
          onChange={e => setFormData({...formData, phone: e.target.value})} />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" required 
          onChange={e => setFormData({...formData, password: e.target.value})} />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Sign Up</button>
      </form>
    </div>
  );
};
export default Signup;