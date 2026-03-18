using Microsoft.AspNetCore.SignalR;

namespace CarRentalAPI.Hubs
{
    public class BookingHub : Hub
    {
        // This acts as a gateway to send messages to the Admin
        public async Task NotifyNewBooking()
        {
            await Clients.All.SendAsync("ReceiveNewBooking");
        }
    }
}