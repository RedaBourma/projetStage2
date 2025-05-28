namespace projetStage.Server.Dtos
{
    public class PrefectureDto
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<CirconscriptionDto> Circonscriptions { get; set; } = new List<CirconscriptionDto>();

    }
}
