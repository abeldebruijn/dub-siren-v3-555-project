# React migration plan

## Goal

Migrate the lesson project to a React site that can be published to GitHub Pages, while keeping the existing static `lessons/` folder for comparison during the migration.

The new site should make the Pico dub siren course more interactive, visual, and playful without becoming vague or decorative. The style reference is Josh W. Comeau's Whimsical Animations course: interactive, friendly, visual, and purposeful.

## Locked decisions

- This is a migration, not a restart.
- Keep the existing `lessons/` folder for now.
- Create the React app in `site/`.
- Use Vite, React, TypeScript, Tailwind, and shadcn/ui.
- Use pnpm.
- Deploy automatically to GitHub Pages when pushing to `main`.
- GitHub repo: `abeldebruijn/dub-siren-v3-555-project`.
- GitHub Pages base path: `/dub-siren-v3-555-project/`.
- Use hash routing for v1.
- Do not use MDX.
- Lessons are manual React components.
- Use one folder per migrated lesson.
- Store lesson code and lesson prose/page content in separate files.
- React site owns its own assets under `site/`; old `assets/` remains for old HTML lessons.
- Do not expose visible "Compare old HTML" links in v1.

## Visual direction

The React site should feel like an interactive electronics workbench:

- warm, readable course/document base
- playful but instrument-specific interactions
- knobs, LEDs, wires, breadboards, waveforms, mux channels, and timing loops
- purposeful motion only
- reduced-motion support
- shadcn components styled to match the course, not left as generic app UI

Do not make the site feel like:

- a SaaS dashboard
- a generic landing page
- a static textbook
- an animation showcase unrelated to the dub siren

## Page shell

Every migrated lesson page needs:

- title
- subtitle
- previous lesson link, when available
- next lesson link, when available and unlocked
- Done means checklist

The next lesson link is only shown when every Done means checkbox for the current lesson is checked.

## Homepage

The homepage is a compact landing page, not just a lesson list.

It should include:

- project title
- short description of the Raspberry Pi Pico dub siren project
- what the learner will learn
- journey display for the course
- status for each lesson
- Start Lesson 1 / Continue action
- Reset journey button when at least one lesson is in progress or done

Reset journey uses a shadcn AlertDialog, not `confirm(...)`.

Reset clears only React course progress from `localStorage`.

## Progress model

Progress is local-only for v1.

Store progress in `localStorage`.

Lesson statuses:

- `todo`: user has not visited the lesson
- `in-progress`: user has visited the lesson but not completed all Done means items
- `done`: all Done means items are checked

When a lesson changes from incomplete to complete, trigger a small `canvas-confetti` celebration.

## v1 scope

v1 should prove the React site structure without migrating everything.

Include:

- homepage
- lesson shell
- journey/status system
- local progress
- reset journey AlertDialog
- Lesson 1 migrated manually
- Lesson 1 LED blink simulator
- Lesson 1 circuit path check
- Lesson 1 interactive line-by-line code teaching
- Copy code button
- GitHub Pages workflow

Do not include in v1:

- all lessons migrated
- MDX
- visible legacy HTML comparison links
- audio engine
- complex progress dashboard

## Code rendering

Use `@pierre/diffs` from diffs.com for code rendering.

For v1:

- use it for single-file code display
- show line numbers
- use it for Lesson 1 line-by-line teaching
- clicking a line shows an explanation panel
- include a Copy code button regardless of library support

If the library does not provide copy support, wrap it with a local shadcn Button and use `navigator.clipboard.writeText(...)`.

## Lesson folder shape

Recommended structure:

```txt
site/src/lessons/lesson-001/
  LessonPage.tsx
  code.ts
  content.ts
```

The central lesson index should store metadata:

```txt
title
subtitle
slug
previousSlug
nextSlug
isMigrated
Component
```

The shell should render previous/next navigation from metadata.

## Homepage journey titles

Use these learner-facing titles:

1. Make your first light blink
2. Control the light with a button
3. Turn a button into an on/off switch
4. Read a turning knob
5. Fade the light with a knob
6. Control blink speed with a knob
7. Control speed and brightness together
8. Add a pitch dial
9. Route pitch through the switch chip
10. Share one Pico input between two dials
11. Keep timing responsive
12. Add a third dial to the switch chip
13. Add a feedback dial
14. Add a tempo dial

For v1:

- Lesson 1 is clickable and migrated.
- Lessons 2-14 are visible as coming soon / not clickable until migrated.
- Appendix lessons are hidden from the main journey.

## Lesson 1 v1 interactions

Lesson 1 should include:

- LED blink simulator with `on_time` and `off_time` controls
- circuit path check: click the path in order, `GP15 -> resistor -> LED -> GND`
- code display using `@pierre/diffs`
- line-by-line explanation panel
- Copy code button
- Done means checklist backed by `localStorage`

## Implementation order

1. Scaffold `site/` with Vite React TypeScript.
2. Add Tailwind and shadcn/ui.
3. Configure Vite base path for `/dub-siren-v3-555-project/`.
4. Add hash routing.
5. Add shared layout and lesson shell.
6. Add progress/localStorage utilities.
7. Add homepage journey with statuses and reset AlertDialog.
8. Add Lesson 1 folder and migrate content manually.
9. Add `@pierre/diffs` code display and Copy code button.
10. Add Lesson 1 interactions.
11. Add `canvas-confetti`.
12. Add GitHub Pages workflow for push to `main`.
13. Run local build.

## Open items before scaffolding

- Confirm exact package versions during implementation.
- Confirm GitHub Pages settings in the repository if deployment does not work on first push.
- Decide whether the old static lesson pages should ever be included in a later build artifact.
