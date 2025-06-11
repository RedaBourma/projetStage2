namespace projetStage.Server.Dtos
{
    public class BureauDetailsDto
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public string? DashboardEntryGUID { get; set; }
        public int? DashboardEntryId { get; set; }
        public int? NombreSieges { get; set; }
        public List<ListeDto> Listes { get; set; } = new List<ListeDto>();
    }
}
