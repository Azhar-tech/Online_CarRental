import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { useLocation, Link } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  // 1. Initialize state so React can "watch" these values
  const [user, setUser] = useState({
    name: null,
    role: null
  });
  
  const location = useLocation();
  useEffect(() => {
    const storedName = localStorage.getItem('userName'); 
    const storedRole = localStorage.getItem('userRole');

    if (storedName) {
      setUser({
        name: storedName,
        role: storedRole
      });
    } else {
      setUser({ name: null, role: null });
    }
  }, [location]);

  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-black text-blue-600">DriveSelect</Link>
      
      <div className="flex items-center space-x-8 font-semibold text-gray-600">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/cars" className="hover:text-blue-600">Browse Cars</Link>
        
    
        {user.name && <Link to="/bookings" className="hover:text-blue-600">My Bookings</Link>}
        
        {user.role === 'Admin' && (
          <Link to="/admin" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg border border-blue-100">
            Admin Panel
          </Link>
        )}

        {user.name ? (
          <div className="flex items-center space-x-4 pl-4 border-l">
            <span className="text-sm text-gray-400">
              Hi, <b className="text-gray-800 uppercase">{user.name}</b>
            </span>
            <button 
              onClick={onLogout} 
              className="text-red-500 text-sm font-bold hover:underline"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;