using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace projetStage.Server.Models
{
    public class Listes
    {
        public int Id { get; set; }
        public int BureauId { get; set; }
        [ForeignKey("BureauId")] 
        public Bureaux? Bureaux { get; set; }
        public int PartiId { get; set; }
        [ForeignKey("PartiId")] 
        public Partis? Partis { get; set; }

        [Column(TypeName = "nvarchar(255)")]
        public string? PnAgentListe { get; set; }
        public int NumListe { get; set; }
        public int? numVotes { get; set; }

    }
}
