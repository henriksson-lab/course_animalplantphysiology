# Animal and Plant Physiology — proposed course plan

Working proposal, 18 November 2026. **Plan the established physiology course
first; consider computing only after its lectures, practicals and assessments
are secured.** A complete course with no added R is an acceptable result.

**Implementation, 19 November 2026:** the first teaching draft now supplies
ten tutorial units with slides, exercises and quizzes, classroom practicals,
simulated datasets, reporting/literature guidance, revision and instructor keys.
The student route starts at `index.qmd`. Actual laboratory protocols, specimen
resources, adopted readings and official assessment details still require
local course materials. One optional R example repeats an existing calculation;
the core has no required R sessions.

## 1. Scope and evidence

Use the documented 15 ECTS predecessor, **5MO101**, as the core baseline.
Its [official syllabus](https://www.umu.se/en/education/syllabus/5mo101/)
specifies an equal animal/plant split, four modules, practical investigation,
tissue identification, literature evaluation and scientific communication.

The neighbouring programme repository targets the 2027 intake and identifies
**5MO00S**, physiology in year 1. This changes the likely entry knowledge, but
does not itself establish changes to physiology content. Preserve the core
and provide short prerequisite explanations where necessary. The successor's
formal outcomes, entry requirements and assessments still need verification.
See [the evidence record](plan/evidence.md).

The detailed animal topics below are a proposed unpacking of the predecessor's
broad organ-system remit using the candidate textbook. They are not a recovered
lecture timetable. Similarly, the proposed practical examples require checking
against existing protocols before adoption.

## 2. Preserve the module structure

| Baseline module | ECTS | Protected purpose |
| --- | ---: | --- |
| Animal theory and group work | 6 | Comparative structure, function, regulation, evolution and environmental adaptation |
| Animal practical work | 1.5 | Anatomy, physiological observations, normal histology and thematic work |
| Plant theory | 5 | Structure, metabolism, growth, development, regulation, stress and biotechnology |
| Plant practical work | 2.5 | Experimental methods, analysis, writing, discussion and presentation |
| Total | 15 | Animal 7.5; plant 7.5 |

These are the predecessor's credits, retained as the planning baseline;
they are not verified successor module credits. Computing gets no separate
module or additional credits in this proposal.

## 3. Core learning goals

Retain the substance of the predecessor's outcomes. Students should be able to:

1. Relate animal cells, tissues, organs and systems to their functions,
   regulation, evolutionary history and environmental conditions.
2. Recognise representative normal tissues and explain how their structures
   support function.
3. Explain plant cellular organisation and regulated life processes, including
   growth, photosynthesis, metabolism, differentiation and death.
4. Use physiological knowledge to discuss benefits, risks and ethical aspects
   of genetically modified plants.
5. Perform experiments, interpret measurements and communicate scientific
   findings in laboratory reports.
6. Find and evaluate relevant research, work individually and collaboratively,
   and communicate orally and in writing.

These are planning paraphrases of 5MO101, not newly approved 5MO00S outcomes.
Being able to write R code is not an additional core learning goal.

## 4. Animal content

Organise the animal half around how an organism maintains function in its
environment. Use mammals as a reference while making deliberate comparisons
with other animal groups. Avoid turning this into human physiology alone.

| Proposed unit | Essential content and question | Teaching/practical connection |
| --- | --- | --- |
| A1. Organisation and diversity | Cells → tissues → organs → systems; body plans; exchange surfaces; feedback; acclimation versus evolutionary adaptation | Tissue orientation; explain a structure–function example in two animal groups |
| A2. Nutrition, energy and temperature | Feeding and digestion; absorption; metabolic fuel use; aerobic/anaerobic work; energy budgets; thermal strategies | Compare digestive specialisation and temperature responses; interpret supplied measurements |
| A3. Exchange and circulation | Diffusion; ventilation; gas transport; circulatory arrangements; coordination of oxygen supply and demand | Connect respiratory and vascular tissues to whole-organism function; compare water and air breathers |
| A4. Water, ions and excretion | Osmotic challenges; epithelial transport; nitrogen disposal; kidney function; freshwater, marine and terrestrial strategies | Explain water/solute balance with diagrams and representative tissues |
| A5. Integration, movement and reproduction | Membrane potentials; neural and sensory signalling; muscle function; endocrine feedback; reproductive regulation | Relate nervous/muscle/endocrine structure to function; integrate two systems in an adaptation case |

Cell transport and signalling receive brief explanations here even if students
have seen them previously. If first-year students lack cell biology, teach
the concepts needed for these physiological explanations; do not add a full
cell biology or genetics course. Choose the exact normal tissue/specimen list
from the existing practical manual rather than inventing a replacement list.

## 5. Plant content

Organise the plant half around building and maintaining an organism that
acquires resources, grows in place and responds to its surroundings. Keep
development and biotechnology visible alongside transport and photosynthesis.

| Proposed unit | Essential content and question | Teaching/practical connection |
| --- | --- | --- |
| P1. Plant organisation | Cell and tissue organisation; walls; growth by expansion; meristems and differentiation; nuclear, plastid and mitochondrial genomes | Identify functional tissues and explain where growth occurs |
| P2. Resource acquisition and transport | Water potential and water balance; roots, xylem, transpiration and stomata; mineral acquisition and membrane transport | Explain an existing water-relations or nutrient practical through its measurements |
| P3. Carbon and metabolism | Photosynthetic energy capture and carbon fixation; environmental limits; source–sink relations; phloem; respiration and nutrient assimilation | Interpret photosynthesis or pigment/assay results; connect metabolism to growth |
| P4. Regulation and development | Hormones and signalling; light responses; germination; vegetative growth; flowering and reproductive development; senescence and cell death | Follow a developmental response from signal to tissue/organ behaviour |
| P5. Environment and applications | Abiotic/biotic stress; natural products; herbivory and growth–defence; model systems; transformation and tissue culture; tissue-specific expression and relevant databases | Discuss a physiological application, including genetically modified plants, using evidence and ethical reasoning |

Keep the predecessor's molecular-to-ecosystem connections. Explain essential
gene-expression terms when first needed; detailed genetic mechanisms can be
signposted to later courses. Database use in a biotechnology case can be a
guided lookup; it does not require a new bioinformatics component.

## 6. Practical work and communication come first

Recover and retain existing protocols, specimen sessions and marking guidance
before choosing new datasets or software. In particular:

- **Animal anatomy and histology:** observation, identification and explanation
  of normal structure and function; retain comparative examples and existing
  dissection arrangements. These sessions stand on their own without R.
- **Animal physiology:** carry out and interpret the existing measurements,
  identifying organism, experimental unit, conditions, units and limitations.
- **Plant experiments:** retain the established plant methods and the time
  needed for handling material, controls, observations and interpretation.
  Water balance, photosynthesis, nutrition or growth are candidate contexts,
  not confirmed descriptions of the current practicals.
- **Reporting:** connect question, method, figure and physiological explanation.
  Preserve scientific writing rather than replacing it with a coding task.
- **Literature and presentation:** retain discussion, critical reading and
  individual oral communication. Include biotechnology benefits, risks and
  ethics in the plant half.

For each actual practical, write a one-page teaching specification: existing
physiological objective; required observations; independent unit; controls;
calculations/figures; student explanation; report requirements; contact and
preparation time. Software choice comes afterwards.

## 7. Provisional ten-week sequence

Ten full-time weeks is a planning assumption for 15 ECTS, not a recovered
contact timetable. Within each half, practicals and discussion run alongside
theory. Check the old schedule and growth/measurement lead times before dating
sessions. Start any long plant experiment early enough to finish and report it.

| Week | Core focus | Protected practical/communication work |
| --- | --- | --- |
| 1 | A1; introduce A2 | Structure–function orientation; anatomy/histology preparation |
| 2 | A2 | Relevant animal observations/measurements; normal tissue work |
| 3 | A3 | Comparative respiratory/circulatory structure and function |
| 4 | A4 | Water-balance interpretation; anatomy/histology consolidation |
| 5 | A5 and animal integration | Animal thematic discussion, report completion and theory assessment window |
| 6 | P1 and introduction to P2 | Plant anatomy/methods; establish longer experiments if not started earlier |
| 7 | P2 | Existing plant transport/nutrition practical and interpretation |
| 8 | P3 | Existing photosynthesis/metabolism practical and report work |
| 9 | P4 | Developmental observations; literature and presentation preparation |
| 10 | P5 and plant integration | Biotechnology discussion, oral presentation, report completion and theory assessment window |

The table allocates equal duration to animal and plant physiology; it does not
allocate identical laboratory hours. Preserve the different practical-credit
weights. Lecture counts, room bookings, laboratory hours and assessment dates
remain to be taken from the actual course. The animal integrating unit is
broad: preview neural/endocrine regulation throughout weeks 1–4 and use week 5
to bring it together, rather than introducing every system just before an exam.

## 8. Reading strategy

Use **selected sections**, with a question or diagram task attached, rather
than assigning two whole specialist books in ten weeks. The animal candidate
is Hill, Cavanaugh and Anderson, *Animal Physiology*, 5th edition; the plant
candidate is Taiz and colleagues, *Plant Physiology and Development*, 7th edition.
Neither is a confirmed course requirement. Their publisher contents support
the topic mapping in [the evidence record](plan/evidence.md).

Before teaching, match existing lecture/practical coverage to the actual adopted
edition and record section/page ranges. Particularly on the plant side,
specialist detail needs selection for the available entry knowledge and time.
Retain research papers and supplied practical instructions where those already
carry the course. No textbook figures or restricted resources have been copied.

## 9. Assessment baseline

The predecessor uses written examinations for the two theory modules,
laboratory reports and individual oral presentation, with compulsory practical
and thematic participation. Preserve that as the working baseline and obtain
the current assessment instructions before specifying tasks, marks or dates.
The 2027 assessment rules remain unverified.

Review coverage explicitly: tissues need recognition tasks; regulation needs
mechanistic explanations; adaptation needs comparison; experimental work needs
design and interpretation; literature/biotechnology needs evidence-based
argument. A graph alone does not demonstrate any of these in full.

If computing is later adopted, assess the physiological reasoning and the
reproducibility needed for that practical. Do not introduce a programming exam
or change the course grading scheme as a side effect.

## 10. Computing is a later, separable decision

First complete the course map and practical specifications above. Then inspect
the real data and current analysis burden. R may help replace a repetitive
calculation or graph students already need; it need not appear in every unit.
The [separate computing review](plan/computing.md) records candidates, costs,
an optional one-practical pilot, and reasons to decide against adoption.

Until that review is resolved, this plan assumes **no required R sessions**.
The core timetable and learning goals remain viable on that basis.
