# Animal and Plant Physiology

Planning repository for the established physiology course, with a separate
investigation of whether computing from Intro Computing could help its practicals.
The core course is planned first. R is an optional addition, not a new course goal.

Start with [the proposed content and teaching plan](contentplan.md).

- [Evidence, textbook mapping and remaining uncertainties](plan/evidence.md)
- [Optional computing: fit, limits and a decision process](plan/computing.md)
- [Implementation sequence](plan/implementation.md)
- [Student-site scaffold](index.qmd)
- [Rendered local site](docs/index.html)

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

Run `make render` to build `docs/`, or `make preview` for a local preview.
Quarto is required. The present scaffold contains no executable R lessons and
needs no R packages. Future topic folders can pair `lec.qmd`, `exercise.qmd`
and `quiz.qmd` when actual teaching material is ready.

Only the explicitly listed `.qmd` pages render. This README and `contentplan.md`
and `plan/` are instructor documents, excluded from the site. This is a local
planning scaffold, not a complete teaching course or a published website.
