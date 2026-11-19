# Instructor guide

This is a first teaching draft of the proposed established-core course, not
an approved syllabus or a reconstruction of an existing teacher's materials.
The animal and plant halves retain their 7.5 ECTS planning weights; the
predecessor's four module weights are 6, 1.5, 5 and 2.5 ECTS.

## Contents and preparation

- [Animal exercise solutions and facilitation](animal.md)
- [Plant exercise solutions and facilitation](plant.md)
- [Practical calculation keys and facilitation](practicals.md)
- [Course evidence and textbook mapping](../plan/evidence.md)
- [Optional computing decision](../plan/computing.md)
- [Student study route](../schedule.qmd)

The site contains ten units, each with a tutorial, slide deck, exercise and
self-check quiz. The slides are prompts for explanation and discussion; they
are not replacements for the tutorials. Exercise solutions are instructor
documents, while the quizzes have student-visible collapsible feedback.
All supplied practical measurements are explicitly simulated.

Before each unit, identify essential terminology and review the corresponding
exercise key. Ask students to predict an outcome or draw a pathway before
showing the explanation. Use the final quiz after discussion, then revisit
an explanation at the next meeting to check retention.

## Coverage and evidence of learning

| Core goal | Main teaching | Practice/evidence |
| --- | --- | --- |
| Animal structure/function, regulation and adaptation | A1–A5; comparative examples throughout | Unit exercises and quizzes; animal measurements; integrated revision explanations |
| Recognise representative normal tissues | A1 and organ-system units; anatomy/histology preparation | Descriptive tissue cards here; actual microscope/image identification to be supplied locally |
| Explain plant organisation and regulated life processes | P1–P5 | Unit exercises and quizzes; water, photosynthesis and growth activities |
| Evaluate physiological applications and GM-plant benefits/risks/ethics | P5; literature/presentation activity | Evidence table, stakeholder questions, qualified argument and oral discussion |
| Perform and interpret experiments; write reports | Practical activities and reporting guidance | Classroom calculation/design work here; actual experimental performance under local protocols |
| Evaluate literature; communicate individually/in groups | Literature activity; discussion in all units | Claim–evidence table, presentation, questions, report and peer feedback |

The two practical gaps in this table are substantive: reading descriptions does
not establish tissue-image recognition, and calculating from a CSV does not
establish that a student can perform an experiment. Retain the established
specimen sessions and approved laboratory teaching alongside these materials.

## Facilitation and pacing

Use the ten-week route as an ordering proposal. A tutorial can span several
short explanations rather than one long lecture. Choose examples that reinforce
the same mechanism across scales and animal groups. In week 1, introduce neural
and endocrine regulation as ideas, then revisit them during energy, circulation
and water balance; the integration unit consolidates these connections.

In the plant half, return to tissues and transport during photosynthesis and
development. Introduce source–sink relationships through both an expanding
leaf and a storage organ. Distinguish changes in environmental supply from
the organism's regulated response. Reserve time for writing and feedback within
each half, especially in the plant practical component.

Where prerequisite knowledge is missing, use `start.qmd` and a small relevant
example. Do not expand an introductory bridge into an additional cell biology
or genetics course. Track unresolved misconceptions separately from unfamiliar
vocabulary: knowing a term does not show that the student can explain its role.

## Discussion and formative feedback

For a mechanistic explanation, look for a complete causal chain, correct
direction/sign and an explicit context. For a comparison, require both a shared
physiological problem and different structural or regulatory solutions. For
data interpretation, require quantities with units, correct independent units,
observation separated from mechanism, and a limitation specific to the design.

The practical reporting page provides a feedback rubric. It is a teaching aid,
not an official grading scheme. Theory assessment arrangements, pass rules,
report requirements, compulsory sessions and presentation logistics must be
taken from the actual course syllabus and examiner instructions. Do not
introduce programming assessment through the optional R example.

## Optional R: supported example, no required session

The optional script and report reproduce the animal measurement calculation.
The core practical includes the formula and worked values independently.
Keep the example optional until the actual practical teacher has checked time,
support and retained Intro Computing skills. If software handling dominates,
use the supplied calculation/figure and return to physiology.

Verify the optional report by rendering the extracted student ZIP in a fresh
R process. Website rendering disables code execution, so a successful Quarto
build alone does not validate the R analysis.

## Release checklist

1. Reconcile scope with the current formal syllabus, lecture coverage and
   actual textbook sections; resolve any successor-course changes.
2. Insert the real timetable, specimen/image resources, apparatus instructions
   and approved laboratory protocols. Check experiment lead times and training.
3. Review teaching explanations, simulated designs and calculation keys with
   the relevant physiology instructors; pilot pacing with actual students.
4. Confirm local requirements for reports, theory exams and oral presentation.
5. Run `make render` then `make check`; render the extracted optional R report
   separately if that support is offered.

`instructor/` and `plan/` do not render into the student site or enter student
archives. They remain ordinary repository documents, not access-controlled
storage for confidential examination material.
