namespace projetStage.Server.Dtos
{
    public class ListeDto
    {
        public int? Id { get; set; }
        public string? PnAgentListe { get; set;}

        public int PartiId { get; set; }
        public PartisDto? Parti  { get; set; }
        public int NumListe { get; set; }
    }
}
