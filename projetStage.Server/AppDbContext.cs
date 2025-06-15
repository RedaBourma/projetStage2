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
        public DbSet<Resultats> Resultats { get; set; }

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

            modelBuilder.Entity<Resultats>()
                .HasOne(r => r.Bureaux)
                .WithMany(b => b.Resultats)
                .HasForeignKey(r => r.BureauxId)
                .OnDelete(DeleteBehavior.NoAction) // Or DeleteBehavior.Restrict
                .IsRequired();

            // Relationship: Resultats to Listes
             modelBuilder.Entity<Resultats>()
                .HasOne(r => r.Listes) // Note: your property name is 'Liste', but your snapshot used 'Listes' in navigation.
                               // Make sure your navigation property in Resultats is 'Liste'.
                .WithMany(l => l.Resultats)
                .HasForeignKey(r => r.ListeId)
                .OnDelete(DeleteBehavior.NoAction) // Or DeleteBehavior.Restrict
                .IsRequired();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();


            base.OnModelCreating(modelBuilder);
        }
    }
}
