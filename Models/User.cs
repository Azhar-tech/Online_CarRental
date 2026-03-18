public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty; // Users log in with Email
    public string Phone { get; set; } = string.Empty; // Added Phone No
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "User"; // Default is "User", Admin will be "Admin"
}