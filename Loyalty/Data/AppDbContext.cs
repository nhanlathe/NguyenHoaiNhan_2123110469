using Microsoft.EntityFrameworkCore;
using ConnectDB.Models;
namespace ConnectDB.Data;
public class AppDbContext : DbContext
{
    
public AppDbContext(DbContextOptions<AppDbContext> options) :
base(options)
    { }
    public DbSet<Student> Students { get; set; }
}