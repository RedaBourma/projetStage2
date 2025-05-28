using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projetStage.Server.Models
{
    public class User
    {
        public int Id { get; set; }

        
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        public ICollection<DashboardEntry> DashboardEntries { get; set; } 
    }
}
