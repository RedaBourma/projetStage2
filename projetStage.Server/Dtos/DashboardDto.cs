namespace projetStage.Server.Dtos
{
    public class DashboardDto
    {
        public int? Id { get; set; }
        public string? EntryId { get; set; }
        public int PrefectureId { get; set; }
        public string? PrefectureName { get; set; }
        public int CirconscriptionId { get; set; }
        public string? CirconscriptionName { get; set; }
        public int NombreSieges { get; set; }
        public int NombreBureaux { get; set; }
        public int NombreListes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

    }
}
