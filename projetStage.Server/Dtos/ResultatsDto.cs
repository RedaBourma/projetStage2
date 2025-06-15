namespace projetStage.Server.Dtos
{
    public class ResultatsDto
    {
        public int? Id { get; set; }
        public int? BureauxId { get; set; }
        public int? ListeId { get; set; }

        public int NumInscrits { get; set; }
        public int NumElecteurs { get; set; }
        public int NumBullVoteNuls { get; set; }
        public int NumVotesExprimes { get; set; }
    }
}
