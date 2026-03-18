import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('addCar');
  const [pendingCount, setPendingCount] = useState(0);

  // Function to fetch just the count for the tab badge
  const updatePendingCount = async () => {
    try {
      const res = await axios.get('http://localhost:5188/api/bookings/status/Pending');
      setPendingCount(res.data.length);
    } catch (err) {
      console.error("Error fetching count:", err);
    }
  };

  useEffect(() => {
    updatePendingCount();
  }, []);

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">Admin Control Center</h1>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-6 mb-10">
        <button 
          onClick={() => setActiveTab('addCar')}
          className={`text-lg font-semibold pb-2 transition-colors ${activeTab === 'addCar' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-400'}`}
        >
          Add New Car
        </button>
        <button 
          onClick={() => setActiveTab('manageBookings')}
          className={`text-lg font-semibold pb-2 transition-colors flex items-center ${activeTab === 'manageBookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-400'}`}
        >
          Pending Bookings
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'addCar' ? <AddCarForm /> : <ManageBookings onUpdate={updatePendingCount} />}
    </div>
  );
};

const AddCarForm = () => {
  const [car, setCar] = useState({ model: '', type: '', dailyPrice: '', monthlyPrice: '', image: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('model', car.model);
    formData.append('type', car.type);
    formData.append('dailyPrice', car.dailyPrice);
    formData.append('monthlyPrice', car.monthlyPrice);
    formData.append('imageFile', car.image);

    try {
      await axios.post('http://localhost:5188/api/cars/add', formData);
      alert("Car added successfully!");
      setCar({ model: '', type: '', dailyPrice: '', monthlyPrice: '', image: null });
    } catch (err) {
      alert("Error saving car.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl bg-white p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-100">
      <div className="flex flex-col"><label className="font-bold text-gray-700 mb-2">Vehicle Name</label>
      <input type="text" value={car.type} className="border-2 border-gray-200 p-3 rounded-xl" placeholder="e.g. Honda Civic" required onChange={(e) => setCar({...car, type: e.target.value})} /></div>
      <div className="flex flex-col"><label className="font-bold text-gray-700 mb-2">Year</label>
      <input type="number" value={car.model} className="border-2 border-gray-200 p-3 rounded-xl" placeholder="2022" required onChange={(e) => setCar({...car, model: e.target.value})} /></div>
      <div className="flex flex-col"><label className="font-bold text-gray-700 mb-2">Daily Price</label>
      <input type="number" value={car.dailyPrice} className="border-2 border-gray-200 p-3 rounded-xl" required onChange={(e) => setCar({...car, dailyPrice: e.target.value})} /></div>
      <div className="flex flex-col"><label className="font-bold text-gray-700 mb-2">Monthly Price</label>
      <input type="number" value={car.monthlyPrice} className="border-2 border-gray-200 p-3 rounded-xl" required onChange={(e) => setCar({...car, monthlyPrice: e.target.value})} /></div>
      <div className="md:col-span-2 flex flex-col"><label className="font-bold text-gray-700 mb-2">Image</label>
      <input type="file" className="border-2 border-dashed border-gray-300 p-6 rounded-xl" accept="image/*" required onChange={(e) => setCar({...car, image: e.target.files[0]})} /></div>
      <button className="md:col-span-2 bg-blue-600 text-white py-4 rounded-xl font-bold">Save Car</button>
    </form>
  );
};

const ManageBookings = ({ onUpdate }) => {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Pending');

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`http://localhost:5188/api/bookings/status/${filterStatus}`);
      setBookings(res.data);
      if (onUpdate) onUpdate(); // Update the tab counter
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchBookings();

    // Request notification permission
    if (Notification.permission !== "granted") Notification.requestPermission();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5188/bookingHub", { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    const startSignalR = async () => {
      try {
        if (isMounted && connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
          console.log("Connected to Real-Time Hub ✅");

          connection.on("ReceiveNewBooking", () => {
            if (isMounted) {
              fetchBookings();
              // Sound Effect
              new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
              // Browser Notification
              if (Notification.permission === "granted") {
                new Notification("🚗 New DriveSelect Booking!", {
                  body: "A new booking has arrived. Check the dashboard to approve it.",
                });
              }
            }
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error("SignalR Error: ", err);
      }
    };

    startSignalR();
    return () => { isMounted = false; connection.stop(); };
  }, [filterStatus]);

  const handleApprove = async (id) => {
    if(!window.confirm("Approve this booking?")) return;
    try {
      await axios.put(`http://localhost:5188/api/bookings/approve/${id}`);
      alert("Booking Confirmed!");
      fetchBookings();
    } catch (error) {
      alert("Failed to approve.");
    }
  };


 const handleReject = async (id) => {
  if (window.confirm("Are you sure you want to reject this booking?")) {
    try {
      // Switch from DELETE to PATCH (or POST)
      await axios.patch(`http://localhost:5188/api/bookings/reject/${id}`);
      
      alert("Booking Rejected. This car is now available for others.");
      
      // Re-fetch the data based on your current dropdown filter
      fetchBookings(); 
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to reject booking.");
    }
  }
};

  return (
   <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
  {/* TOP NAVIGATION & FILTER */}
  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
    <h2 className="text-xl font-bold text-gray-800">Booking Management</h2>
    
    <div className="flex items-center gap-3">
      <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Filter Status:</label>
      <select 
        value={filterStatus} 
        onChange={(e) => setFilterStatus(e.target.value)}
        className="bg-gray-50 border-2 border-gray-100 text-gray-700 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition"
      >
        <option value="All">All Bookings</option>
        <option value="Pending">🟡 Pending Requests</option>
        <option value="Confirmed">✅ Confirmed Bookings</option>
        <option value="Rejected">❌ Rejected/Deleted</option>
      </select>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead className="bg-gray-800 text-white">
        <tr>
          <th className="p-4">Customer</th>
          <th className="p-4">Dates</th>
          <th className="p-4">Amount</th>
          <th className="p-4 text-center">Proof</th>
          <th className="p-4 text-center">Status</th>
          {/* Action column only shows if not looking at historical data alone */}
          {filterStatus !== 'Rejected' && filterStatus !== 'Confirmed' && (
             <th className="p-4 text-center">Action</th>
          )}
        </tr>
      </thead>
      <tbody>
        {bookings.map((b) => (
          <tr key={b.id} className="border-b hover:bg-gray-50 transition">
            <td className="p-4 font-semibold">{b.customerName}</td>
            <td className="p-4 text-sm whitespace-nowrap">📅 {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}</td>
            <td className="p-4 text-blue-600 font-bold">Rs. {b.totalAmount?.toLocaleString()}</td>
            <td className="p-4 text-center">
              <a href={`http://localhost:5188/uploads/${b.paymentSlipPath}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-md border border-blue-100 hover:bg-blue-600 hover:text-white transition">View Slip</a>
            </td>
            <td className="p-4 text-center">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                b.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                b.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                'bg-yellow-100 text-yellow-700'
              }`}>
                {b.status}
              </span>
            </td>
            
            {b.status === 'Pending' && (
              <td className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => handleApprove(b.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-green-700 shadow-sm">Approve</button>
                  <button onClick={() => handleReject(b.id)} className="border-2 border-red-500 text-red-500 px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-red-500 hover:text-white transition">Reject</button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
};

export default AdminDashboard;    