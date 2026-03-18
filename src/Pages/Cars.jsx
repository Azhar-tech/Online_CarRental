import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const navigate = useNavigate();

  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    withDriver: false,
    slip: null,
    customerName: ''
  });

  const API_BASE_URL = 'http://localhost:5188';

  // --- 1. Helper: Check if a specific date is already booked ---
  const isDateBusy = (dateToCheck, busyDates) => {
    if (!dateToCheck || !busyDates || busyDates.length === 0) return false;
    
    const selected = new Date(dateToCheck);
    selected.setHours(0, 0, 0, 0);

    return busyDates.some(range => {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return selected >= start && selected <= end;
    });
  };

  // --- 2. Helper: Calculate Price ---
 const calculateTotalPrice = (startDate, endDate, dailyPrice, monthlyPrice) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) return 0;

  // Calculate difference in milliseconds
  const timeDifference = end.getTime() - start.getTime();
  
  // Convert to days and ADD 1 to include the first day
  let days = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1; 

  // Apply your pricing logic (Daily vs Monthly)
  let totalAmount = days <= 10 ? days * dailyPrice : days * (monthlyPrice / 30);
  
  return Math.round(totalAmount);
};

  // --- 3. Fetch Cars ---
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cars`);
        setCars(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  // --- 4. Update Price & Availability Status ---
  useEffect(() => {
    const updateStatus = async () => {
      if (selectedCar && bookingData.startDate && bookingData.endDate) {
        const price = calculateTotalPrice(
          bookingData.startDate, 
          bookingData.endDate, 
          selectedCar.dailyPrice, 
          selectedCar.monthlyPrice
        );
        setTotalPrice(price);

        try {
          const res = await axios.get(`${API_BASE_URL}/api/bookings/check-availability`, {
            params: { 
              carId: selectedCar.id, 
              start: bookingData.startDate, 
              end: bookingData.endDate 
            }
          });
          setIsAvailable(res.data.available);
        } catch (err) {
          console.error("Availability check failed", err);
        }
      } else {
        setTotalPrice(0);
        setIsAvailable(true);
      }
    };
    updateStatus();
  }, [bookingData.startDate, bookingData.endDate, selectedCar]);

  const handleBookNowClick = (car) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Please login to book a car!");
      navigate('/login');
      return;
    }
    setSelectedCar(car);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (!isAvailable || isDateBusy(bookingData.startDate, selectedCar.busyDates) || isDateBusy(bookingData.endDate, selectedCar.busyDates)) {
      alert("Selected dates are unavailable.");
      return;
    }

    const formData = new FormData();
    formData.append('carId', selectedCar.id);
    formData.append('userId', userId);
    formData.append('customerName', userName); 
    formData.append('startDate', bookingData.startDate);
    formData.append('endDate', bookingData.endDate);
    formData.append('totalAmount', totalPrice);
    formData.append('slip', bookingData.slip);

    try {
      await axios.post(`${API_BASE_URL}/api/bookings/upload-slip`, formData);
      alert("Booking submitted successfully!");
      setSelectedCar(null);
    } catch (error) {
      alert("Failed to submit booking.");
    }
  };

  if (loading) return <div className="text-center py-20">Loading Fleet...</div>;

  return (
    <div className="container mx-auto px-6 py-10">
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-8">
   {cars.map((car) => (
    <div key={car.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-56 overflow-hidden">
        <img src={`${API_BASE_URL}${car.imageUrl}`} alt={car.type} className="w-full h-full object-cover" />
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{car.type}</h3>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-semibold">{car.model}</span>
        </div>

        <div className="mb-4">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Daily Rental</p>
          <p className="text-2xl font-black text-blue-600">Rs. {car.dailyPrice?.toLocaleString() || "0"}</p>
        </div>

        <div className="mt-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-[10px] font-bold text-orange-500 uppercase mb-2">Booked Slots:</p>
          {car.busyDates && car.busyDates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {car.busyDates.map((date, idx) => (
                <span key={idx} className="text-[11px] font-bold text-orange-700 bg-white border border-orange-200 px-2 py-1 rounded-md">
                  {new Date(date.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(date.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] font-bold text-green-600">✨ Available Now</p>
          )}
        </div>

        <div className="mt-auto pt-6">
          <button 
            onClick={() => handleBookNowClick(car)} 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-md"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  ))}
  </div>
      {selectedCar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Book {selectedCar.type}</h2>
            <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Model Year: {selectedCar.model}</p>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <input type="text" placeholder="Your Full Name" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none" required 
                onChange={e => setBookingData({...bookingData, customerName: e.target.value})} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 ml-1">START DATE</label>
                  <input 
                    type="date" 
                    className={`w-full border-2 p-3 rounded-xl ${isDateBusy(bookingData.startDate, selectedCar.busyDates) ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} 
                    required 
                    onChange={e => setBookingData({...bookingData, startDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 ml-1">END DATE</label>
                  <input 
                    type="date" 
                    className={`w-full border-2 p-3 rounded-xl ${isDateBusy(bookingData.endDate, selectedCar.busyDates) ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} 
                    required 
                    onChange={e => setBookingData({...bookingData, endDate: e.target.value})} 
                  />
                </div>
              </div>

              {(!isAvailable || isDateBusy(bookingData.startDate, selectedCar.busyDates) || isDateBusy(bookingData.endDate, selectedCar.busyDates)) && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-600 text-sm font-bold text-center">
                  ⚠️ Already booked for these dates!
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl flex justify-between items-center border border-blue-100">
                <span className="text-sm font-bold text-gray-600">Total Amount:</span>
                <span className="text-2xl font-extrabold text-blue-600">{totalPrice > 0 ? `Rs. ${totalPrice.toLocaleString()}` : '---'}</span>
              </div>

              <div className="border-2 border-dashed border-blue-200 p-4 rounded-xl text-center bg-blue-50">
                <p className="text-xs font-bold text-blue-500 mb-2">UPLOAD PAYMENT SLIP</p>
                <input type="file" accept="image/*" required onChange={e => setBookingData({...bookingData, slip: e.target.files[0]})} />
              </div>
 
              <div className="flex space-x-3 pt-4">
                <button   
                  type="submit" 
                  disabled={!isAvailable || isDateBusy(bookingData.startDate, selectedCar.busyDates) || isDateBusy(bookingData.endDate, selectedCar.busyDates)}
                  className={`flex-1 py-3 rounded-xl font-bold transition shadow-lg text-white ${
                    (isAvailable && !isDateBusy(bookingData.startDate, selectedCar.busyDates) && !isDateBusy(bookingData.endDate, selectedCar.busyDates)) 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {(isAvailable && !isDateBusy(bookingData.startDate, selectedCar.busyDates)) ? `Confirm (Rs. ${totalPrice})` : 'Unavailable'}
                </button>  
                <button type="button" onClick={() => setSelectedCar(null)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div> 
      )}
    </div>
  ); 
};

export default Cars;