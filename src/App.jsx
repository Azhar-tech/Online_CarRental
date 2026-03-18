import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './Pages/AdminDashboard';
import Cars from './Pages/Cars';
import Home from './Home';
import MyBookings from './Pages/MyBookings';
import Login from './Pages/Login';
import Signup from './Pages/signup';

function App() {
  // Check specifically for 'Admin' role on load
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('userRole') === 'Admin'
  );

  // Logout clears all user data from storage
  const handleLogout = () => {
    localStorage.clear(); 
    setIsAuthenticated(false);
    window.location.href = "/"; 
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Pass auth state to Navbar to toggle links */}
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Pass setAuth to Login so it can update this parent state */}
            <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />

            <Route 
              path="/admin" 
              element={
                isAuthenticated ? (
                  <div className="relative">
                     <button 
                        onClick={handleLogout}
                        className="absolute top-4 right-6 bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 z-50 shadow-md"
                      >
                        Logout
                      </button>
                      <AdminDashboard />
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;