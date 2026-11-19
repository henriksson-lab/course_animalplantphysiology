# Optional supplied analysis. Source from the project root; then call
# analyse_respirometry("data/animal-respirometry.csv").
# This defines a function only; calling it reads inputs without modifying them.
analyse_respirometry <- function(csv_path) {
  measurements <- readr::read_csv(csv_path, show_col_types = FALSE)
  required <- c("animal_id", "chamber_id", "temperature_c", "mass_g",
                "water_volume_l", "duration_min", "initial_oxygen_umol_l",
                "final_oxygen_umol_l", "blank_decline_umol_l")
  stopifnot(all(required %in% names(measurements)),
            !anyNA(measurements),
            anyDuplicated(measurements$animal_id) == 0L,
            anyDuplicated(measurements$chamber_id) == 0L,
            all(measurements$mass_g > 0),
            all(measurements$duration_min > 0),
            all(measurements$water_volume_l > 0))

  rates <- measurements |>
    dplyr::mutate(
      corrected_decline_umol_l = initial_oxygen_umol_l -
        final_oxygen_umol_l - blank_decline_umol_l,
      oxygen_used_umol = corrected_decline_umol_l * water_volume_l,
      rate_umol_min_g = oxygen_used_umol / duration_min / mass_g
    )
  stopifnot(all(rates$corrected_decline_umol_l >= 0))

  summary <- rates |>
    dplyr::group_by(temperature_c) |>
    dplyr::summarise(
      n_animals = dplyr::n(),
      mean_rate = mean(rate_umol_min_g),
      sd_rate = stats::sd(rate_umol_min_g),
      min_rate = min(rate_umol_min_g),
      max_rate = max(rate_umol_min_g),
      .groups = "drop"
    )

  plot <- ggplot2::ggplot(
    rates, ggplot2::aes(x = factor(temperature_c), y = rate_umol_min_g)
  ) +
    ggplot2::geom_point(
      position = ggplot2::position_jitter(width = 0.08, height = 0, seed = 19),
      size = 2
    ) +
    ggplot2::labs(
      x = "Water temperature (°C)",
      y = "Oxygen consumption (µmol O2 min^-1 g^-1)",
      caption = "Simulated data; each point is one independent animal."
    ) +
    ggplot2::theme_minimal()

  list(rates = rates, summary = summary, plot = plot)
}
