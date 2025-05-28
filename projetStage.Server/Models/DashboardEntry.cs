using Microsoft.Extensions.Configuration.UserSecrets;

namespace projetStage.Server.Models
{
    public class DashboardEntry
    {
        public int Id { get; set; }
        public string? entryId { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int PrefectureId { get; set; } // table
        public Prefecture Prefecture { get; set; }

        public int CirconscriptionId { get; set; } // table
        public Circonscription Circonscription { get; set; }

        public int NombreSieges { get; set; }
        public int NombreBureaux { get; set; }
        public int NombreListes { get; set; }
        public DateTime createdAt { get; set; }
        public DateTime? UpdatedAt { get; set; } = null;
    }
}
