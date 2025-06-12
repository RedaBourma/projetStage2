using Microsoft.EntityFrameworkCore;
using projetStage.Server.Models;

namespace projetStage.Server
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<DashboardEntry> DashboardEntries { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Prefecture> Prefectures { get; set; }
        public DbSet<Circonscription> Circonscriptions { get; set; }

        public DbSet<Bureaux> Bureaux { get; set; }
        public DbSet<Listes> Listes { get; set; }
        public DbSet<Partis> Partis { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DashboardEntry>()
                .HasOne(de => de.User)
                .WithMany(u => u.DashboardEntries)
                .HasForeignKey(de => de.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DashboardEntry>()
                .HasOne(de => de.Prefecture)
                .WithMany(u => u.DashboardEntries)
                .HasForeignKey(de => de.PrefectureId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<DashboardEntry>()
                .HasOne(de => de.Circonscription)
                .WithMany(u => u.DashboardEntries)
                .HasForeignKey(de => de.CirconscriptionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Circonscription>()
                .HasOne(c => c.Prefecture)
                .WithMany(p => p.Circonscriptions)
                .HasForeignKey(c => c.PrefectureId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();


            base.OnModelCreating(modelBuilder);
        }
    }
}
