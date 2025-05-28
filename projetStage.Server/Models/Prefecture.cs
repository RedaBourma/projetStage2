using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projetStage.Server.Models
{
    public class Prefecture
    {

        public int Id { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(255)")]
        public string Name { get; set; }

        public ICollection<Circonscription> Circonscriptions { get; set; }
        public ICollection<DashboardEntry> DashboardEntries { get; set; }
    }
}
