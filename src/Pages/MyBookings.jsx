import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Redirect if they try to access this page without logging in
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchMyHistory = async () => {
      try {
        // Fetch specific history for this user only
        const res = await axios.get(`http://localhost:5188/api/bookings/my-history/${userId}`);
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching history");
      }
    };
    fetchMyHistory();
  }, [userId, navigate]);

  return (
    <div className="container mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-8">My Rental History</h2>
      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white border-2 rounded-2xl p-6 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-6">
              <img src={`http://localhost:5188${b.carImage}`} className="w-24 h-16 object-cover rounded-lg" alt="car" />
              <div>
                <h3 className="text-xl font-bold">Booking #{b.id} - {b.carName} ({b.carYear})</h3>
                <p className="text-sm text-gray-500">Dates: {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-600 font-extrabold text-lg">Rs. {b.totalAmount.toLocaleString()}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {b.status}
              </span>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text   -center text-gray-400 py-10">No bookings found for your account.</p>}
      </div>
    </div>
  );
};

export default MyBookings;