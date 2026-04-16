using Loyalty.Data;
using Loyalty.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// DbContext configuration mapping MS SQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("LoyaltyDb"));

// Dependency Injection
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<LoyaltyService>();

// Register Repositories
builder.Services.AddScoped<Loyalty.Repositories.IProductRepository, Loyalty.Repositories.ProductRepository>();
builder.Services.AddScoped<Loyalty.Repositories.ICustomerRepository, Loyalty.Repositories.CustomerRepository>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.MapControllers();

app.Run();