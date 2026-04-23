using Loyalty.Data;
using Loyalty.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// DbContext configuration mapping MS SQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowAll");
app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsDevelopment())
{
}

// app.UseHttpsRedirection();
app.MapControllers();

// Seeding Data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated();

    if (!context.AppUsers.Any())
    {
        context.AppUsers.Add(new Loyalty.Models.AppUser 
        { 
            Username = "admin", 
            Password = "123", 
            Role = "Admin", 
            FullName = "Administrator" 
        });
    }

    if (!context.Products.Any())
    {
        var product = new Loyalty.Models.Product
        {
            Sku = "BOOK-SEED-01",
            Name = "Sách Giáo Khoa Ngữ Văn 12",
            Department = "Sách",
            Category = "Giáo khoa",
            UoM = "Cuốn",
            BasePrice = 55000,
            Inventory = new Loyalty.Models.Inventory { Quantity = 100, BatchDate = DateTime.UtcNow }
        };
        context.Products.Add(product);
    }

    context.SaveChanges();
}

app.Run();