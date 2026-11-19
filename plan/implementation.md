# Implementation sequence

The course is not ready for teaching merely because a website renders. Build
the core from actual course materials before making a computing decision.

| Step | Work | Reviewable result / completion condition |
| --- | --- | --- |
| 1. Confirm the baseline | Obtain the actual schedule, slides, books, protocols, specimen list, report/assessment instructions and successor syllabus where available | Each documented outcome maps to existing teaching and assessment; unresolved differences are named |
| 2. Reconcile the core plan | Review A1–A5 and P1–P5 against those materials; retain established coverage and practical-credit balance | An agreed course map, reading sections and practical specifications; no R dependency |
| 3. Resolve entry knowledge and timing | Check what students have actually studied; add short explanations of needed cell/genetic concepts; schedule experiments with lead times | Feasible timetable protecting practical work, literature, presentations and revision |
| 4. Write core materials | Adapt lectures, exercises, quizzes, lab instructions and reporting guidance into topic folders | A teachable animal block and plant block with reliable links, usable figures and expected answers |
| 5. Review analysis needs | Inspect existing practical data, current calculations and student/report difficulties alongside Intro Computing retention | A documented decision: no R, or one bounded pilot with an existing-method fallback |
| 6. Pilot only if useful | Prepare and validate the one analysis template; try it within the existing practical analysis time | Record time, support demand and physiological understanding; retain, simplify or omit |
| 7. Release the teaching site | Check coverage, accessibility of required readings/figures, student instructions and local build | Reviewed student materials; formal course/assessment details verified; publishing is a later task |

## Current state

- Implemented: reduced QuantBio-derived Quarto scaffold, core content proposal,
  evidence/book mapping, optional computing review and this sequence.
- Scaffold only: animal, plant and practical overview pages. There are no
  complete lecture decks, protocols, quizzes, datasets or assessment tasks yet.
- Pending: actual materials listed in steps 1–3. No contacts have been messaged,
  textbook adoption assumed or computing sessions scheduled.

## Conventions for the next authoring pass

Create stable topic folders when their scope is agreed, for example
`animal-gas-exchange/` or `plant-water-balance/`, with `lec.qmd`,
`exercise.qmd` and optionally `quiz.qmd`. Put teaching order in the sidebar;
do not encode timetable dates in folder names. Add files to `_quarto.yml`'s
explicit render list when ready.

Keep decks short enough to teach one coherent concept. Include a biological
question, a structure/process explanation, a concrete observation and a check
of understanding. Add calculations only when needed for the physiology.
Use a reference solution and collapsible hints where useful; do not inherit
QuantBio's advanced mathematics or its by-hand exam requirements.

If slides are added, explicitly declare Reveal output and the copied theme:

```yaml
format:
  revealjs:
    theme: [simple, ../theme.scss]
```

Student analysis reports, if an R pilot is adopted, stay in `.Rmd` to reuse
Intro Computing. Keep answers and instructor planning out of the public render
list. Record data provenance and simulation status for every future dataset.
