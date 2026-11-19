# Practical teaching guide and answer key

First teaching draft, 19 November 2026. These are classroom activities using
constructed descriptions and simulated datasets. They complement the established
laboratory course; they do not replace tissue slides, dissection, actual
experimental methods, laboratory safety arrangements or assessment rules.
The suggested durations and feedback framework are not formal grade requirements.

## Facilitation and outcome coverage

Begin with a biological prediction and an experimental-unit question. Require
one calculation with units before any software. After interpreting results,
ask which mechanism was measured and which is proposed. A correct arithmetic
answer alone is insufficient. Give the class the data dictionary before the CSV.

| Activity | Core outcomes supported | Evidence students leave with |
| --- | --- | --- |
| Anatomy/histology | Structure/function; preparation for normal-tissue recognition | Observation/inference records and comparative diagrams |
| Animal measurements | Metabolism and temperature; experimental analysis/reporting | Corrected rates, individual plot and limitation |
| Plant water | Plant transport; experimental reasoning | Area/time conversion, water path, potential prediction |
| Photosynthesis | Plant metabolism/regulation; repeated-measurement interpretation | Traces, net/gross distinction and design improvement |
| Development/stress | Plant growth and regulation; mechanism evaluation | Within-plant increments and follow-up design |
| Reporting | Scientific laboratory communication | Traceable report with peer-review revision |
| Literature/presentation | Literature evaluation, GM-plant ethical reasoning, oral communication | Evidence sheet, argued conclusion and individual presentation |

Before running actual laboratory work, obtain current protocol, specimen list,
equipment instructions, staffing, preparation/experiment durations and report
requirements. Where these differ from this teaching example, update the
analysis specification rather than pretending the simulated dataset describes
the local experiment.

## Anatomy/histology key

The supplied descriptions are not images. They test reasoning about diagnostic
features, not the ability to find those features visually. Assess actual visual
recognition separately using the institution's normal-tissue resources.

- **A:** simple squamous epithelium. One layer and flattened cells support a
  thin exchange interface; permeability still depends on junctions and
  molecular properties. “Alveolar region” is compatible but not established
  uniquely by the text. Capillary endothelium is also a thin exchange lining.
- **B:** stratified squamous epithelium, compatible with abrasion protection.
  Keratinisation was not supplied and should not be asserted. Surface shape,
  rather than basal-cell shape, determines the squamous classification.
- **C:** simple cuboidal epithelium. Renal tubules are plausible, but ducts
  and other structures can share this shape. Ask for whole-organ architecture,
  surrounding structures and features such as glomeruli in the same section,
  without requiring every tubular profile to have one adjacent.
- **D:** skeletal muscle: parallel unbranched multinucleate fibres, peripheral
  nuclei and striations. A single feature alone may be less decisive.
- **E:** cardiac muscle: branching striated cells, central nuclei and
  specialised cell junction regions. Disrupted coordination can impair pumping;
  an observed image alone would not diagnose its cause.
- **F:** smooth muscle: spindle-shaped cells, central nuclei and no striations.
  Sustained contraction can alter lumen diameter or move contents depending
  on organ; the hollow organ is not uniquely identified.
- **G:** nervous tissue: large process-bearing cell bodies with supporting
  cells. Do not demand identification of axons versus dendrites from an
  insufficient description.

The generic tube should distinguish epithelium/lining, connective support,
muscular layer and lumen. Smooth-muscle contraction can change diameter;
gut and vessel functions differ despite shared tissue categories. In the
exchange comparison, credit a large area, thin diffusion path and maintained
gradient; require the environmental medium and blood compartments to be
labelled. Fish gills and mammalian alveoli are not interchangeable structures.
Section orientation, tissue preparation and scale must be discussed before
moving to real slides. Link human anatomy examples to comparative function
so the practical does not become solely a human-tissue checklist.

## Animal respirometry key

There are 12 independent animals, six per randomised temperature group.
Each has one chamber/run. The supplied background comes from separate
matched no-animal runs and is not extra biological replication. A temperature
effect would be confounded if all cold and warm measurements used different
apparatus or times; balanced allocation is required, not merely more readings.

Corrected amount = (initial − final − blank decline) × effective volume.
Divide by elapsed time and wet mass. Concentration difference has units
µmol/L; multiplying by L yields µmol; dividing yields µmol min⁻¹ g⁻¹.

| Animals | Corrected mass-specific rates, in order | Mean | Sample SD | Range |
| --- | --- | ---: | ---: | --- |
| A01–A06 (15 °C) | 0.18, 0.20, 0.22, 0.19, 0.21, 0.20 | 0.200 | 0.01414 | 0.18–0.22 |
| A07–A12 (25 °C) | 0.30, 0.34, 0.32, 0.31, 0.35, 0.33 | 0.325 | 0.01871 | 0.30–0.35 |

A02: (250 − 232 − 2) × 0.10 = 1.6 µmol, divided by 10 min and
0.8 g = 0.20. A07: (250 − 218 − 2) × 0.10 / 10 / 1 = 0.30.
Warm minus cool is 0.125; warm/cool is 1.625. For this 10 °C separation
the apparent two-point Q10 is 1.625, without establishing a species constant.
SD is spread among animals, not uncertainty in a mean; neither error bars
nor a test are required by the core task.

Accept increased aerobic metabolic demand over this interval as a plausible
explanation. Reject claims that oxygen alone measures ATP production, total
metabolism including anaerobic contributions, growth or fitness. Credit
limitations concerning activity, acclimation, oxygen depletion, sensor drift,
blank applicability, effective volume, leakage and body-size scaling when
their consequences are explained. All data are constructed, so species-level
generalisation is inappropriate regardless of numerical separation.

## Plant-water key

Eight independent pots/plants, four per setting. The dictionary deliberately
specifies independent application and balanced positions; a single apparatus
per setting would confound apparatus with the treatment. Subtract 0.10 g
background once per setup, convert corrected mass to mg, divide by 50 cm²
and by 0.5 h. The stated area is one-sided total leaf area.

| Group | Corrected loss (g), in order | Rates (mg cm⁻² h⁻¹) | Mean rate |
| --- | --- | --- | ---: |
| Still | 0.7, 0.9, 1.1, 0.9 | 28, 36, 44, 36 | 36 |
| Moving | 1.5, 1.9, 2.3, 1.9 | 60, 76, 92, 76 | 76 |

Moving minus still is 40 mg cm⁻² h⁻¹. W06 is 1900/(50 × 0.5) = 76.
Reject a value per minute relabelled per hour or an unexplained doubling of
leaf area. Higher setup mass loss is compatible with a thinner boundary
layer increasing vapour transport under the given conditions, but stomatal
responses can modify the effect. Mass loss does not separately measure
stomatal aperture, photosynthesis, water-use efficiency or drought tolerance.
One needs relevant gas exchange, water status, performance or survival
measurements for those claims.

Water potential case: −0.8 + 0.3 = −0.5 MPa in the cell. From an adjacent
solution at −0.2 MPa, water initially enters the cell; changes in pressure
and solute concentration alter the gradient toward equilibrium. With a
−0.9 MPa adjacent solution it initially exits. “More negative means more
water” is not a valid rule. The gradient direction does not provide a flux
without conductance and geometry.

## Photosynthesis key

Three independent plant/leaf traces, 15 total rows. Connecting points within
plants respects the supplied repeated-measurement structure. Means at light
0, 50, 200, 600 and 1200 are −2, 0, 5, 10 and 11 µmol CO₂ m⁻² s⁻¹.
The mean compensation point is about 50 µmol photons m⁻² s⁻¹ at this
resolution; individual values at 50 are 0, −0.2 and +0.2. Do not require a
nonlinear model or claim an exact universal saturation point.

The net-rate increase is +5 between 200 and 600 and +1 between 600 and
1200; a single line across the entire range misses the plateau. Net-zero
exchange does not mean photochemistry or respiration stopped. Net CO₂ uptake
is not gross carbon fixation. Adding a dark release of 2 to net uptake of
10 gives 12 only as an apparent dark-respiration-corrected estimate: dark
respiration need not equal respiration in light and photorespiration is not
resolved. Credit discussion of this limitation rather than demanding a false
gross-rate claim.

Order is fixed, so light and time are not fully disentangled. Repeated
reference settings, balanced orders and protocol-appropriate equilibration
are useful improvements. Stomatal closure could reduce CO₂ supply, but
conductance is not measured here. A short leaf-area rate cannot by itself
predict whole-plant biomass or yield; duration, total leaf area, respiration,
allocation and environmental variation matter.

## Growth/stress key

Twelve independent pots, six per group; two measurements per plant give a
within-plant change, not 24 independent plants. The comparison of changes is
between independently allocated groups, not an artificial pairing of unrelated
watered/reduced-water plants.

Watered increments: 18, 20, 22, 19, 21, 20 mm (mean 20). Reduced-water:
10, 12, 14, 11, 13, 12 mm (mean 12). Reduced minus watered is −8 mm.
Relative reduction is (20 − 12)/20 × 100 = 40%. Mean rates over seven
days are 2.857 and 1.714 mm day⁻¹. G07 is 10/7 = 1.429 mm day⁻¹.
Two time points give an average change, not a measured daily trajectory.

Possible causal diagrams include reduced water availability → changed water
status/turgor → altered expansion → height increment; or reduced watering →
stomatal response → altered carbon acquisition → growth. Height alone tests
neither chain fully. Follow-up leaf water status and gas-exchange measurements
can discriminate parts of them, but plant development, time and other factors
remain relevant. Reject inferred hormone concentration or hormone causality
from height alone. Height is not biomass or yield, and stress tolerance must
be defined through the outcome of interest.

The follow-up design needs genotype 1/watered, genotype 1/reduced-water,
genotype 2/watered, genotype 2/reduced-water, replicated with independently
treated pots and balanced positions. It must retain relevant comparisons
within watering regimes and within genotypes without chamber confounding.

## Reporting, literature and presentation

Use the student feedback framework to identify missing question/design/units,
unsupported causal claims and untraceable sources. Do not invent marks or
grade boundaries. A report can be completed without computing. Require
honest simulated-data provenance; a polished report cannot claim actual
laboratory work from a supplied CSV.

The literature task deliberately asks students to identify exact panels and
sample definitions from the original paper, rather than supplying a purported
universal sample size. The primary reading is Karavolias et al. (2023), DOI
10.1093/plphys/kiad183, open text at
https://pmc.ncbi.nlm.nih.gov/articles/PMC10231365/. It compares edited rice
stomatal-development traits and physiology. Students should distinguish
anatomical observations from functional measurements and restrict conclusions
to tested conditions. Do not demand that they master the full gene-family
analysis. Differences between a modest and a more severe density perturbation
make “fewer stomata always better” an inadequate argument.

For discussion, ask what the results establish about gas exchange and water
conservation versus what would require field/environmental/yield evidence.
The National Academies synthesis provides context, not a second controlled
experiment or a statement of current legislation. Assess evidence use,
mechanism, uncertainty and reasoned distinction of empirical versus ethical
claims; do not reward one predetermined position on biotechnology.

Presentation suggestions are five minutes plus two minutes of questions.
Record individual contributions and use a follow-up revision so group work
does not conceal individual understanding. These timings are not official
oral-exam rules. Use licensed figures with attribution or original conceptual
diagrams; scientific citation alone is not a blanket reuse licence.

## Optional R pilot

This is an optional repetition of **one existing analysis step**, not a new
practical or outcome. It uses `readr`, `dplyr`, `ggplot2`, `knitr` and
`rmarkdown`. Analyse by hand first; supply a complete template if code handling
would displace physiology. No tests, nonlinear models or advanced reshaping
are needed.

`optional-computing/analysis.R` defines `analyse_respirometry(csv_path)`, returning
`rates`, `summary` and `plot`. From the project root, use
`analyse_respirometry("data/animal-respirometry.csv")`. The `.Rmd` uses its
default document directory, sources `analysis.R` beside it and reads
`../data/animal-respirometry.csv`. It generates self-contained HTML next to
the source and has no setup/install/network commands.

Fresh-session render example from the project root:

```r
rmarkdown::render("optional-computing/respirometry.Rmd", quiet = TRUE)
```

Validate the extracted student archive as well as the repository; a working
local project does not prove the download includes its inputs. If setup/path
errors dominate the allocated analysis time, supply the figure and numerical
checks and continue physiological discussion. Leaving R out remains acceptable.

## Validation completed

The four CSV summaries and worked values were independently recalculated in
R. The supplied analysis function reproduces the animal rates, counts, means
and SDs above. Render checks and archive portability checks are included in
the parent course build validation. No actual animal or plant measurements
have been performed or claimed.
