# Simulated physiology teaching data

All four CSVs were constructed for this course on 19 November 2026. They are
invented classroom examples, not measurements from animals, people, plants or
a published study. They support complete paper-and-calculator exercises. No
biological claim about a species should be estimated from their values.

The observations are intentionally simple and complete. Missing values are not
encoded as zero; these files contain none. Do not edit raw CSVs to calculate
new variables. Keep the experimental unit with its measurements.

## Animal respirometry

`animal-respirometry.csv`: 12 independent hypothetical aquatic invertebrates,
one animal per separately measured chamber. Six randomly allocated to each
temperature, balanced across measurement order and apparatus. Each animal is
measured once, after the same acclimation interval. Assume dissolved oxygen is
well mixed, equipment calibrated, no leak, adequate oxygen throughout, and
all animals quiescent. These supplied assumptions make a classroom rate
calculation possible; they are not a protocol for collecting real data.

| Column | Definition |
| --- | --- |
| `animal_id`, `chamber_id` | Unique organism and chamber/run identifiers |
| `temperature_c` | Water temperature, 15 or 25 °C |
| `mass_g` | Wet body mass, g |
| `water_volume_l` | Effective water volume after displacement, L |
| `duration_min` | Measurement interval, min |
| `initial_oxygen_umol_l`, `final_oxygen_umol_l` | Dissolved oxygen concentration, µmol L⁻¹ |
| `blank_decline_umol_l` | Mean decline from separate matched no-animal blank runs, µmol L⁻¹; assumed identical at the two temperatures in this simplified example |

Corrected amount used = (initial − final − blank decline) × water volume.
Mass-specific rate = corrected amount / duration / body mass, µmol min⁻¹ g⁻¹.
The common blank estimate is not another independent animal. Dividing by mass
does not prove that differences in body size have been fully controlled.

## Plant water balance

`plant-water.csv`: eight independently potted hypothetical plants, one per
pot, randomised to still or moving air (four each). Assume treatments are
applied independently to pots and position/order balanced; each pot has a
separately controlled air setting, not one shared chamber per group. Soil is
covered and matched plant-free setups estimate residual mass loss. Constant
light, air temperature and humidity are supplied assumptions. This is a
simplified mass-balance exercise, not a growing protocol.

| Column | Definition |
| --- | --- |
| `pot_id` | Unique independent plant/pot |
| `air_treatment` | `still` or `moving` |
| `initial_mass_g`, `final_mass_g` | Whole covered-pot setup mass at start/end, g |
| `leaf_area_cm2` | One-sided total leaf area used as the stated normalisation, cm² |
| `duration_min` | Interval, min |
| `blank_loss_g` | Mean mass loss from matched plant-free covered setups, g |

Corrected mass loss = initial − final − blank. Divide its value in mg by leaf
area and interval in hours for mg cm⁻² h⁻¹. The normalisation convention must
be stated; it is not the two-sided surface area.

## Photosynthesis

`photosynthesis.csv`: one leaf from each of three independently grown plants.
The same leaf is measured sequentially at five increasing light settings;
temperature, external CO₂ and humidity are held constant in this example.
The three plant traces are independent; the five readings from one plant
are repeated observations, not five independent plants.

| Column | Definition |
| --- | --- |
| `plant_id` | Independent plant identifier |
| `measurement_order` | Within-leaf order, 1–5, always increasing light |
| `light_umol_photons_m2_s` | Incident photosynthetic photon flux density, µmol photons m⁻² s⁻¹ |
| `net_co2_umol_m2_s` | Net CO₂ uptake per one-sided leaf area, µmol CO₂ m⁻² s⁻¹; positive = uptake, negative = release |

Negative dark values are valid observations. They are not negative gross
photosynthesis. The fixed order prevents light effects being separated fully
from acclimation or drift. No missing readings or background offsets are
included. Do not use these invented traces to fit a species response model.

## Growth and reduced watering

`growth-stress.csv`: 12 independent pots, one plant each, randomised six per
watering treatment within a common growth space with mixed positions.
Watering is applied individually; no group-specific chamber is used. Baseline
height is measured before allocation; the same plant is measured seven days
later. The labels describe the hypothetical manipulation, not a prescribed
watering dose.

| Column | Definition |
| --- | --- |
| `pot_id` | Independent pot/plant |
| `treatment` | `watered` or `reduced-water` |
| `initial_height_mm`, `final_height_mm` | Height, mm, at start/end |
| `day_interval` | Elapsed days |

Height increment = final − initial, mm. Rate = increment / day interval,
mm day⁻¹. Two heights do not create two independent plants. Height does not
measure biomass, survival, photosynthesis or yield.
