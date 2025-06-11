using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projetStage.Server.Models
{
    public class Bureaux
    {
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string? Name { get; set; }
        public int DashboardEntryId { get; set; }
        public DashboardEntry? DashboardEntry { get; set; }
        public ICollection<Listes> Listes { get; set; } = new List<Listes>();
    }
}
