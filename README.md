# Animal and Plant Physiology

First teaching draft of the established 15 ECTS physiology course. Physiology
is the core; R is optional support for one supplied analysis, not a course goal.

Start with [the proposed content and teaching plan](contentplan.md).

- [Evidence, textbook mapping and remaining uncertainties](plan/evidence.md)
- [Optional computing: fit, limits and a decision process](plan/computing.md)
- [Implementation sequence](plan/implementation.md)
- [Student course home](index.qmd)
- [Rendered local site](docs/index.html)
- [Instructor guide and exercise solutions](instructor/README.md)

The draft supplies ten tutorial units, each with lecture slides, exercises and
self-check quizzes; seven practical/communication activities; four simulated
datasets and their dictionary; a student download archive; prerequisite support,
a glossary, a ten-week route and integration/revision tasks. The optional R
script and R Markdown report repeat the animal-measurement calculation. Every
core activity can be completed without R.

The documented baseline is 5MO101 (15 ECTS), with its equal animal/plant split
and four modules. Programme research identifies 5MO00S as the 2027 successor,
but its course-specific syllabus and reading list are unverified. The proposal
preserves the older core; any entry-level bridging must support that core.
The proposed topic order and readings are not claims about past teaching.

## Scaffold and build

Adapted from `/home/mahogny/github/course/quantbio-3MB00A`: Quarto website,
`docs/` output, Cosmo HTML theme, docked searchable sidebar, code-copy controls,
lecture/quiz link colours, Reveal slide settings and copied `theme.scss`.
Navigation, page selection and Makefile are reduced for this course. Building
does not stage files. QuantBio's advanced content, demos, dependencies, caches,
Git metadata and course-specific assessment rules are not copied.

Run `make render` to package student files and build `docs/`, `make check` to
check local links/anchors and publication boundaries after rendering, or
`make preview` for a local preview. Quarto and Python 3 are required. The build
uses a project-local ignored Quarto cache and never stages files.

Website code execution is disabled: students can read the optional R example
without installing packages. Running it needs R plus readr, dplyr, ggplot2,
knitr and rmarkdown. Render with
`Rscript -e 'rmarkdown::render("optional-computing/respirometry.Rmd")'`.
The report uses paths relative to its document directory. Use the extracted
student ZIP in a fresh location/session to check portability, or run
`make check-r` to automate that extracted-project render. `make figures`
regenerates the four committed example plots using base R; normal site builds
reuse those images and need no R installation.

Only the selected student `.qmd` patterns render. This README, `contentplan.md`,
`plan/` and `instructor/` are excluded from the site and student ZIP. Quizzes
deliberately include student-visible feedback; instructor exercise keys are
ordinary repository documents rather than confidential storage.

This is a local teaching draft. Actual lab protocols, specimen/image resources,
adopted readings, official assessments and the final timetable still need the
existing course materials. Supplied-data work does not establish hands-on
experimental or microscopy competence. No website has been published.
