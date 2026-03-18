const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-cover bg-center flex items-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=80')" }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-6 relative z-10 text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">Rent Your Dream <br/> Car Today</h1>
          <p className="text-xl mb-8 max-w-lg">Affordable daily and monthly rates with or without a driver. Experience premium comfort in Pakistan.</p>
          <a href="./Cars" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition transform hover:scale-105">
            Book Now
          </a>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
            <h3 className="text-xl font-bold mb-2">Daily/Monthly</h3>
            <p className="text-gray-600">Flexible plans tailored for short trips or long-term stays.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
            <h3 className="text-xl font-bold mb-2">With Driver</h3>
            <p className="text-gray-600">Relax and enjoy the ride while our professional drivers handle the traffic.</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600">
            <h3 className="text-xl font-bold mb-2">Verified Slip</h3>
            <p className="text-gray-600">Simple payment verification. Upload your slip and get confirmed in minutes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}; 
export default Home;