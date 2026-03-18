import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 mt-20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 text-blue-400">DriveSelect</h3>
          <p className="text-gray-400">The most reliable car rental service in Pakistan. Daily, weekly, and monthly plans available.</p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="text-gray-400 space-y-2">
            <li><Link to="/cars">All Cars</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Contact Info</h4>
          <p className="text-gray-400">📍 Lahore, Pakistan</p>
          <p className="text-gray-400">📞 +92 300 1234567</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
        © 2026 DriveSelect. Built by Azhar Tech.
      </div>
    </footer>
  );
};

export default Footer;