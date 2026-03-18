namespace CarRentalAPI.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int CarId { get; set; }
        public Car? Car { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool WithDriver { get; set; }
        public decimal TotalAmount { get; set; }
        public string? PaymentSlipPath { get; set; } // Stores the filename of the uploaded image
        public string Status { get; set; } = "Pending";
        public int UserId { get; set; } // The ID of the user who is booking
        public User? User { get; set; } // Navigation property; // Pending, Confirmed, Rejected
    }
}