# Optional computing review — after the core is mapped

**Current decision: no required R component.** First retain the existing
physiology teaching, practical methods and assessment. Then ask whether a small
use of R improves work students already do. Choosing no addition is acceptable.

Nothing in this file is a scheduled or compulsory lesson.

## What students might bring from Intro Computing

The inspected teaching draft introduces RStudio projects, CSV import, units,
identifiers and missing values; `readr`, `dplyr` and `ggplot2`; derived variables,
group summaries, SD and uncertainty; guided independent/paired comparisons;
straight-line fitting; and `.Rmd` → HTML reports. It uses simulated biological
data, including plants and duckweed.

Useful local references, relative to `/home/mahogny/github/course/introcomputing/`:

| Material | Possible reuse |
| --- | --- |
| `week2/07-import.qmd`, `08-transform-plot.qmd` | Read and inspect a supplied physiological measurement table; reuse a labelled plot |
| `week3/13-group-summaries.qmd`, `14-replicates-uncertainty.qmd` | Describe variation while identifying the independent organism/pot/chamber |
| `week4/18-paired.qmd` | Within-organism changes, preserving IDs and acknowledging order effects |
| `week4/19-calibration.qmd` | Existing assay calibration, if the physiology protocol needs it |
| `week5/23-mini-study.qmd`, `24-reproduce.qmd`, `report.Rmd` | A short report and fresh-session reproduction |

These are possible transfer skills, **not verified entry requirements**.
The introductory course is itself a draft. Check both actual teaching order
and retained skills before asking physiology students to reuse them.

If reused, keep the same package vocabulary and R Markdown format. Students
need not learn Quarto authoring because the teaching site uses Quarto. No SSH,
Linux terminal, HPC, new programming language or advanced statistics is needed
for small physiology tables.

## Where computing might help, and where it adds little

All entries depend on the actual practical manual; these examples are not new
experiments to insert into the course.

| Existing task, if present | Possible contribution | Main difficulty or constraint | Initial disposition |
| --- | --- | --- | --- |
| Anatomy, dissection, normal histology | Annotated observation records | Software does not teach specimen handling or tissue recognition | Keep existing teaching; no R task |
| Animal metabolic/temperature measurements | Apply the existing unit conversion or rate calculation; plot observations | Calibration, blank correction, acclimation and organism/chamber identity must be understood first | Possible single-task pilot |
| Animal physiological time series | Plot each organism's trace and explain recovery/response | Time points from one animal are not independent animals; signal processing can overwhelm the objective | Supplied plotting code only, if already useful |
| Plant water-relations measurements | Calculate a specified change or normalisation; show observations | Water-potential sign conventions, units and equilibration are the real learning task | Possible single-task pilot |
| Plant photosynthesis measurements | Plot a measured response and compare conditions | Repeated leaves/light levels, chamber effects and order complicate inference | Descriptive plot first; no nonlinear fitting requirement |
| Existing pigment or other calibrated assay | Reuse a given calibration workflow and check range/dilution | A new chemical method plus unfamiliar code may be too much at once | Use only after the protocol is understood |
| Plant growth or stress treatment | Reuse grouped summaries and an existing report template | Multiple plants in one pot/tray may share a treatment unit; shared chambers can limit replication | Strong candidate if the design/data are simple |
| Literature discussion, developmental mechanisms, GM-plant ethics | Read and interpret an existing figure | Reproducing a figure can distract from evaluating its evidence | Preserve discussion; no computation needed |

The easier starting point is a small endpoint table from an established
practical, with one clear unit and one outcome. A model that is natural for
physiology is not automatically a suitable beginner programming exercise.

Do not add ODE solving, Hodgkin–Huxley models, nonlinear dose-response fitting,
mixed models, allometry, image-analysis pipelines or omics to justify using R.
These are unnecessary for the proposed core. Even a familiar t-test should
only appear when the question, design and assumptions warrant it.

## Optional pilot: replace one existing analysis step

Choose **one** existing practical, animal or plant, after inspecting its data.
Do not replace observation time, introduce a new experiment, or add a new
assessment. The candidate must already require a calculation or figure that
would otherwise be completed by another supported method.

Prepare a project folder, raw CSV, data dictionary, a complete worked example,
and a short `.Rmd` template. The instructor first verifies that the template
reproduces the current accepted calculation. Use existing packages and relative
paths. Install/test software before the practical, not during specimen work.

The student task is deliberately small:

1. Explain what was measured, its units and the independent unit.
2. Reproduce one calculation by hand and identify it in the supplied code.
3. Import the table and adapt one familiar plot or summary.
4. Write the physiological interpretation and one experimental limitation.
5. Render the existing report format from a fresh session, with support.

Do not make inference or new data reshaping part of the first pilot. Use a
complete template if needed; independent code composition is not its purpose.

## How to decide whether the addition is worth keeping

This is a proposed local teaching decision, not an evidence-based universal
threshold. Agree the time budget with the practical teacher before piloting.
For example, cap the software segment at the analysis time already allocated,
and use an early checkpoint after about 15 minutes.

Record whether each student can open the project, reproduce the example,
make the intended figure, and explain it. Separate installation/path errors
from misconceptions about physiology or experimental design. Compare the
quality of biological explanations with the existing approach, and record
student time and teacher support burden. Do not equate successful rendering
with understanding or claim a small pilot establishes causal learning gains.

- **Keep:** the majority can complete the small step in the existing time,
  support is manageable and the physiological discussion is preserved. Repeat
  this same workflow in a later practical before expanding it.
- **Simplify:** students can interpret results but code/path handling dominates.
  Supply complete code and figures; let students focus on measurements and
  interpretation. Recheck the workload before making it routine.
- **Leave R out:** software prevents students doing the practical, displaces
  core physiology, requires unsupported equipment, or no useful existing
  calculation/figure can be improved. Retain the established supported method.

Fallback materials must be ready before the pilot: a checked table, labelled
figure and hand-worked calculation. Students still perform the physiological
reasoning and reporting. Any change affecting formal assessment must be
consistent with the actual syllabus and equal access to the required tools.

## Recommendation

Proceed with the physiology course map and recovery of existing teaching
materials. Defer R adoption. If a suitable established practical emerges,
trial one familiar analysis step; otherwise teach the core without an R addition.
