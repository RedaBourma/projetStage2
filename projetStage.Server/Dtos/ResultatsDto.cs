namespace projetStage.Server.Dtos
{
    public class ResultatsDto
    {
        public int? Id { get; set; }
        public int numInscrits { get; set; }
        public int numElecteurs { get; set; }
        public int numBulletsNuls { get; set; }
        public int numVotesExprimes { get; set; }
        public int? BureauId { get; set; }
        public int? ListeId { get; set; }
    }
}
