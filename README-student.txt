Animal and Plant Physiology — student files

All datasets are simulated teaching data. Read data/README.md before analysis.
The core classroom activities can be completed with paper and a calculator;
R is optional. Follow the practical pages in the course website.

Keep this folder structure after extracting the ZIP:
  physiology.Rproj
  data/
  optional-computing/

For the optional example, open physiology.Rproj in RStudio. Required packages:
readr, dplyr, ggplot2, knitr and rmarkdown. Install them separately if needed.
Open optional-computing/respirometry.Rmd and Knit to HTML. Alternatively run
  rmarkdown::render("optional-computing/respirometry.Rmd")
from R at the extracted project root. The document reads the sibling data
folder using a path relative to its own directory. The HTML appears beside
the Rmd. Restart R before rendering to check that all objects are created by
the saved code.

For script-only use from the project root:
  source("optional-computing/analysis.R")
  result <- analyse_respirometry("data/animal-respirometry.csv")

Keep input data, source and your report together when sharing your work.
Instructor solutions are not included in this student archive.
