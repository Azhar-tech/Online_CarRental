using Microsoft.EntityFrameworkCore;
using CarRentalAPI.Data; 
using CarRentalAPI.Models;
using CarRentalAPI.Hubs;
using Microsoft.AspNetCore.SignalR;
var builder = WebApplication.CreateBuilder(args);

// 1. SQL Server Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString)); 

// 2. CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Your Vite Port
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // <--- THIS IS THE FIX
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 3. Swagger Configuration (Using Full Path to avoid errors)
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "RentA-Car API", 
        Version = "v1" 
    });
});
builder.Services.AddSignalR();
var app = builder.Build();


// 4. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "RentA-Car API v1"));
}

app.UseStaticFiles(); 
app.UseCors("AllowReact");
app.MapHub<BookingHub>("/bookingHub");
app.UseAuthorization();
app.MapControllers();

app.Run();