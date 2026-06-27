---
name: brainstorm-component
description: Scan existing StudyOS demo components and brainstorm a new creative interaction component. Focuses on novel input mechanics, spatial/visual/tactile interactions, and creative expression — explicitly avoids peer learning, AI scoring, and rubric-based evaluation. Use when asked to "brainstorm", "new component idea", "what should we build next", or "creative demo".
---

# Brainstorm Component

Generate a new StudyOS demo component idea by analyzing what already exists and finding creative gaps.

## Step 1: Scan existing components

Read all files in `src/demos/` and `src/pages/catalog.tsx` to build an inventory:
- List every demo by name and one-line summary
- Tag each with its **interaction model** (click-to-select, drag, text-input, audio, drawing, timeline, branching-narrative, gamified-combat, matching, building/assembling)
- Note which **sensory channels** are used (visual-only, audio, spatial/drag, text-creation, real-time-feedback)

## Step 1.5: Check rejected ideas

Read `rejected-ideas.md` at the project root. This file lists previously brainstormed ideas that were rejected. **Do not propose any idea that overlaps significantly with a rejected one.** Mention which rejected ideas you considered and why your proposal is different.

## Step 2: Identify creative gaps

Using the inventory, find what's **missing**. Check against these dimensions:

| Dimension | Examples of underexplored territory |
|-----------|-------------------------------------|
| **Input mechanic** | drawing/sketching, gesture/swipe patterns, rhythm/timing-based, physics simulation, spatial arrangement in 2D space, color mixing, tangram-style assembly |
| **Feedback loop** | cause-and-effect chains the student *builds* (not just reads), sandbox/playground with emergent behavior, visual chain reactions |
| **Creative expression** | open-ended composition (music, visual art, story weaving), remix/mashup of existing content, pattern design |
| **Temporal interaction** | speed-based challenges beyond timers, slow-reveal/progressive-disclosure, rewind-and-replay mechanics |
| **Spatial reasoning** | rotation, reflection, tessellation, 3D projection, map-based navigation, circuit/flow building |

## Step 3: Generate the idea

Propose **one** component idea that:

### MUST have
- A novel interaction mechanic not yet in the codebase
- Immediate, visual, non-text feedback (animations, spatial changes, color shifts)
- Intrinsic engagement (the interaction itself is satisfying, not points/scores)
- A clear learning connection (not just a toy)
- Feasibility with React + any npm packages that enhance the experience (embrace external libraries — physics engines, audio synthesis, 3D renderers, data viz, etc.)

### MUST NOT have
- AI-based scoring or evaluation
- Peer learning, collaboration, or social features
- Rubric-based grading or percentage scores
- External API calls

## Step 3.5: Think outside the box

Before finalizing the idea, push past the obvious. Run through these provocations:

- **Steal from other domains:** What interaction would feel at home in a music DAW, architecture tool, chemistry lab, game level editor, or flight simulator — but has never been applied to studying?
- **Physical metaphors:** What real-world tactile experience (pottery wheel, circuit board soldering, origami folding, lock picking, weaving) could be simulated in-browser to teach a concept?
- **Reverse the flow:** Instead of the student answering questions, what if they *design* the question, *break* the system, or *teach* an on-screen character?
- **Emergent complexity:** Can simple rules produce surprising behavior? (cellular automata, flocking, chain reactions, feedback loops)
- **Synesthesia:** Can you cross sensory channels — turn text into spatial layout, sound into color, math into physical forces?
- **Time as a material:** Rewind, fast-forward, branch timelines, time-lapse, slow-motion reveal — how can manipulating time itself be the interaction?

The goal is to propose something a teacher has **never seen before** — not a digital worksheet, not a quiz with animations, but something genuinely new.

### Deliverable format

Present the idea as:

```
## [Component Name] — [Chinese Name]

**One-liner:** [What the student does in one sentence]

**Learning connection:** [What cognitive skill this exercises]

**Interaction model:**
- [Step-by-step description of what the user sees and does]

**Why it's novel:** [Which gap from Step 2 this fills]

**Key animations/visuals:** [2-3 specific Framer Motion / SVG effects]

**Rough state shape:**
```ts
// TypeScript interface sketch
```

**Catalog entry:**
```ts
{ title: "...", titleZh: "...", description: "...", path: "/...", subject: "...", tags: [...] }
```
```

## Step 4: Ask the user

After presenting, ask:
1. Want me to build this component now?
2. Want to adjust the concept first?
3. Want me to brainstorm a different direction?
