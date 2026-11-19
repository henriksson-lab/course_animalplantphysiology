# Rebuild the committed classroom figures from the supplied simulated CSVs.
# Run from the repository root: Rscript tools/make_figures.R
# Base R only; site rendering reuses the PNGs without executing R.
dir.create("assets", showWarnings = FALSE)

begin_plot <- function(name) {
  png(file.path("assets", name), width = 1500, height = 1000, res = 180)
  par(mar = c(5.5, 5.5, 2.5, 1.5), las = 1, bty = "l", cex = 1.1)
}

group_plot <- function(value, group, levels, labels, ylab, name) {
  begin_plot(name)
  group <- factor(group, levels = levels)
  x <- as.integer(group)
  # Deterministic horizontal displacement separates observations without
  # inventing vertical variation or depending on a random-number seed.
  offset <- ave(x, group, FUN = function(z) seq(-0.07, 0.07, length.out = length(z)))
  plot(x + offset, value, xlim = c(0.6, 2.4), xaxt = "n", xlab = "",
       ylab = ylab, pch = 19, col = c("#16738a", "#a04d20")[x],
       ylim = range(c(0, value)) * c(1, 1.1))
  axis(1, at = 1:2, labels = labels)
  means <- tapply(value, group, mean)
  segments(1:2 - 0.15, means, 1:2 + 0.15, means, lwd = 2)
  mtext("Simulated teaching data; points = independent units; lines = group means",
        side = 3, cex = 0.8)
  dev.off()
}

a <- read.csv("data/animal-respirometry.csv")
rate <- with(a, (initial_oxygen_umol_l - final_oxygen_umol_l - blank_decline_umol_l) *
               water_volume_l / duration_min / mass_g)
group_plot(rate, a$temperature_c, c(15, 25), c("15 °C", "25 °C"),
           expression(paste("Oxygen consumption (", mu, "mol ", min^{-1}, " ", g^{-1}, ")")),
           "animal-respirometry.png")

w <- read.csv("data/plant-water.csv")
loss <- with(w, 1000 * (initial_mass_g - final_mass_g - blank_loss_g) /
               leaf_area_cm2 / (duration_min / 60))
group_plot(loss, w$air_treatment, c("still", "moving"), c("Still air", "Moving air"),
           expression(paste("Corrected water loss (mg ", cm^{-2}, " ", h^{-1}, ")")),
           "plant-water.png")

p <- read.csv("data/photosynthesis.csv")
begin_plot("photosynthesis.png")
plot(range(p$light_umol_photons_m2_s), range(p$net_co2_umol_m2_s), type = "n",
     xlab = expression(paste("Light (", mu, "mol photons ", m^{-2}, " ", s^{-1}, ")")),
     ylab = expression(paste("Net ", CO[2], " uptake (", mu, "mol ", m^{-2}, " ", s^{-1}, ")")))
abline(h = 0, col = "grey65", lty = 2)
colours <- c("#16738a", "#a04d20", "#7154a3")
for (i in seq_along(unique(p$plant_id))) {
  leaf <- p[p$plant_id == unique(p$plant_id)[i], ]
  lines(leaf$light_umol_photons_m2_s, leaf$net_co2_umol_m2_s,
        type = "b", pch = 14 + i, col = colours[i], lwd = 1.5)
}
legend("bottomright", legend = unique(p$plant_id), col = colours, pch = 15:17,
       lty = 1, bty = "n", title = "Plant / leaf")
mtext("Simulated data; each line follows one leaf in increasing-light order",
      side = 3, cex = 0.8)
dev.off()

g <- read.csv("data/growth-stress.csv")
increment <- with(g, final_height_mm - initial_height_mm)
group_plot(increment, g$treatment, c("watered", "reduced-water"),
           c("Watered", "Reduced watering"), "Seven-day height increment (mm)",
           "growth-stress.png")
