# To do: "Bioinformatics and R" sections for P4 and P5

Handover notes for whoever finishes this (person or LLM). Units A1–A5 and P1–P3
are done. P4 (`plant/development/exercise.qmd`) and P5
(`plant/stress-biotechnology/exercise.qmd`) still have the old, too-basic
`## R and bioinformatics {#r-exercises}` section, which must be replaced.

## What the course owner wants

Quotes from the owner:

- "bioinfo exercises are too simple … ideally they learn a bit of new
  bioinformatics including how to search for relevant info in this context"
- "these R exercises as of now are more about just learning R. not about using
  R to solve interesting problems in this context"
- "most things are too basic for warmup" / "just ignore what we have. redo
  bioinfo properly"
- "I dont want a single case study. it should be multiple exercises"

All exercises in the course are closed questions with answers (no open-ended
writing, no essays) and carry no time estimates.

## Look at a finished unit first

Read the `## Bioinformatics and R {#bioinformatics}` section of:

- `plant/carbon-metabolism/exercise.qmd`: KEGG and rbcL barcoding, the real
  `CO2` dataset
- `plant/organisation/exercise.qmd`: plant gene structure via NCBI and Ensembl
  Plants
- `animal/gas-circulation/exercise.qmd`: BLAST, orthologs, Clustal Omega

Match their structure, tone and callout style exactly.

## Required structure in each file

1. Delete the whole existing `## R and bioinformatics {#r-exercises}` section
   (its heading and its tasks R1–R6).
2. In its place, after the `## Explore: …` demo sections and before the closing
   "Continue with the self-check quiz" line, add
   `## Bioinformatics and R {#bioinformatics}`:
   - **Intro:** a short paragraph naming the unit's **database skill** and the
     **R analysis** it uses.
   - **Tip box:** a `::: {.callout-tip}` box "How to search …" that teaches the
     concrete technique:
     - the URL;
     - the exact query and its syntax, plus any filters;
     - how to recognise the right hit;
     - what the key fields mean.
   - **Exercises:** 4–6 independent exercises, `### B1. <problem as a
     question>` … Each one:
     - is a small, interesting physiological problem;
     - has closed parts (a), (b), (c)…;
     - has a collapsed `::: {.callout-note collapse="true"}` callout with a
       `## Answer` line, giving answers plus a one- or two-sentence biological
       explanation.
3. R rules:
   - Use base R only; `MASS` is allowed because it ships with R.
   - Code goes in plain ```` ```r ```` blocks, because the site does not
     execute code.
   - Read sequences straight from REST URLs with `readLines()`.
   - Prefer real data: database records and R's built-in datasets (`ChickWeight`,
     `PlantGrowth`, `Loblolly`, `OrchardSprays`, `InsectSprays`, `CO2`, …).
     Invented numbers are a last resort and must be labelled as invented.
   - R is the tool for answering a physiological question, not the topic. No
     drills such as "compute the mean" or "GC content of a toy string".
4. Answers must stay stable across database releases. Ask about:
   - accessions and gene IDs;
   - domain names;
   - residues at annotated positions;
   - exon counts and lengths of versioned records (for example
     `NM_xxxxx.N`);
   - which hit or species is top;
   - whether a residue is conserved.

   Do not make exact E-values, hit counts or TPM values the answer.
5. **Verify everything live** before writing it down:
   - Use the REST APIs, for example UniProt `rest.uniprot.org`, NCBI
     E-utilities, Ensembl `rest.ensembl.org`, KEGG `rest.kegg.jp` and
     Expression Atlas.
   - Run every R block with `Rscript`, from outside the repo so no
     `Rplots.pdf` lands in it, and copy the outputs exactly.
   - If a fact can't be verified, leave it out.
   - Known problems from earlier units:
     - TAIR blocks scripted access, so cross-check via NCBI or Ensembl.
     - The EBI job dispatcher and NCBI BLAST can be slow or rate-limited;
       local `blastp`/`clustalo` against a Swiss-Prot download works as a
       check.
     - The Ensembl orthologue pages have moved.
6. Don't re-teach a skill another unit already teaches (see the progression
   below). A brief recap is fine when reusing one.

## Skill progression (one new skill per unit)

| Unit | Skill | Status |
|---|---|---|
| A1 | UniProtKB search, query syntax, Reviewed filter, FASTA into R | done |
| A2 | InterPro/Pfam domains, GO terms, Human Protein Atlas | done |
| A3 | BLAST, E-value/% identity, orthologs vs paralogs, Clustal Omega | done |
| A4 | RCSB PDB, AlphaFold pLDDT, ClinVar/UniProt disease variants | done |
| A5 | NCBI Gene and Ensembl genes and orthologues across species | done |
| P1 | Plant gene IDs (AGI), gene structure, genomic/mRNA/CDS/protein | done |
| P2 | Plant gene families and expression atlases (Expression Atlas, eFP) | done |
| P3 | KEGG maps and EC numbers; DNA barcoding by BLASTn of *rbcL* | done |
| **P4** | **Orthologues across species and conserved function-switching residues; reading a gene tree** | to do |
| **P5** | **Stress and defence genes: finding them, their regulation under stress, and how crop traits are engineered** | to do |

## Ideas for P4 (development: hormones, light, photoperiod, flowering)

Read `plant/development/index.qmd` first. Candidates (verify all before use):

- **Does rice use the same flowering signal as Arabidopsis?**
  - Arabidopsis FT (UniProt Q9SXZ2, AT1G65480) and rice Hd3a (Q93WI9).
  - Find the orthologue through a gene tree or BLAST, read both into R and
    compute identity.
- **Why do FT and TFL1 have opposite effects?**
  - Compare FT with its paralogue TFL1 (P93003).
  - The literature names residues that switch function: FT Tyr85 against
    TFL1 His88, and the segment around FT Gln140 against TFL1 Asp144 (Hanzawa
    et al. 2005 PNAS; Ahn et al. 2006 EMBO J).
  - Check these positions against the real sequences before using them.
- **Phytochrome:**
  - PHYB (P14713) domain architecture.
  - The chromophore-binding cysteine, which UniProt annotates.
  - How many PHY genes Arabidopsis has (PHYA–PHYE).
- **Gibberellin dwarfs and the Green Revolution:**
  - DELLA proteins (GAI, RGA). The *gai* mutant lacks the DELLA motif.
  - Wheat Rht-B1/Rht-D1 are DELLA genes.
  - In R, find the DELLA motif in the sequences.
- **R on real data:** day-length or growth curves from built-in datasets,
  for example `Loblolly` (height over age) or `ChickWeight`-style growth
  fitting, only if it connects naturally to the unit.

## Ideas for P5 (stress, defence, biotechnology)

Read `plant/stress-biotechnology/index.qmd` first. The unit covers:

- drought and ABA-driven stomatal closure;
- osmotic adjustment and salt (SOS1, NHX);
- pathogen defence (the HR/SAR split);
- tissue culture;
- *Agrobacterium* transformation;
- reporters such as GUS and GFP;
- Bt crops and refuges;
- CRISPR in crops.

Candidates (verify all before use):

- **ABA signalling:**
  - Find the ABA receptor PYR1/PYL family, the phosphatase ABI1 and the
    kinase OST1/SnRK2.6 in UniProt or NCBI.
  - Ask which gene is the guard-cell kinase.
  - Cover domain families via InterPro.
- **Is the gene switched on by drought?** Use a stress experiment in
  Expression Atlas (for example an ABA or drought treatment of Arabidopsis).
  Ask only about robust facts, such as whether RD29A or RAB18 is up after ABA.
- **Salt tolerance:**
  - SOS1 (a plasma-membrane Na⁺/H⁺ antiporter) against NHX1 (vacuolar).
  - Compare their subcellular locations and transmembrane counts in UniProt.
- **Pathogen defence:**
  - NPR1 and salicylic acid.
  - Typical resistance-gene architecture: NB-LRR (NLR) domains in InterPro,
    for example RPS2 or RPM1.
- **Bt toxins:**
  - Cry1Ac in UniProt: domain architecture and the organism (*Bacillus
    thuringiensis*).
  - R on the real `InsectSprays` dataset to compare insecticide treatments.
- **Reporter genes:** GUS (uidA, *E. coli*) and GFP (*Aequorea victoria*,
  P42212). Ask about the organism of origin and the chromophore residues
  (S65-Y66-G67) in R.

An earlier attempt was stopped by an automated safety filter, probably the
hands-on CRISPR guide-design part (finding PAM sites in a real gene and
picking guides). Keep gene editing at a conceptual level, or leave it out,
and centre P5 on the stress-physiology and defence genes above.

## After writing

- Render each page:
  `cd /data/henriksson/github/course/animalplantphysiology && XDG_CACHE_HOME=$PWD/.quarto/cache quarto render plant/<unit>/exercise.qmd`.
- In `_quarto.yml`, change the two sidebar entries
  `plant/development/exercise.qmd#r-exercises` and
  `plant/stress-biotechnology/exercise.qmd#r-exercises` (text "R and
  bioinformatics") to `…#bioinformatics` with text "Bioinformatics and R",
  as for the other units.
- Run `make render` and then `make check` (the local link and anchor checker)
  with `XDG_CACHE_HOME=$PWD/.quarto/cache`.
- Commit, then push. SSH push fails, so use
  `git push https://github.com/henriksson-lab/course_animalplantphysiology.git main`.
