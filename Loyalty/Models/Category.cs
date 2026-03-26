using System.ComponentModel.DataAnnotations;
namespace ConnectDB.Models;

public class Category
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    public string? Description { get; set; }
}
