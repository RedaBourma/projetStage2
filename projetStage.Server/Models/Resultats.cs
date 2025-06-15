namespace projetStage.Server.Models
{
    public class Resultats
    {
        public int Id { get; set; }
        public int BureauxId { get; set; }
        public Bureaux? Bureaux { get; set; }
        public int ListeId { get; set; }
        public Listes? Listes { get; set; }
        public int NumInscrits { get; set; }
        public int NumElecteurs { get; set; }
        public int NumBullVoteNuls { get; set; }
        public int NumVotesExprimes { get; set; }
    }
}
