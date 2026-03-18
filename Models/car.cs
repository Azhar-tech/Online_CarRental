namespace CarRentalAPI.Models
{
    public class Car
    {
        public int Id { get; set; }
        public string Model { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Sedan, SUV, etc.
        public decimal DailyPrice { get; set; }
        public decimal MonthlyPrice { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}