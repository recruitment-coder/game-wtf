# AGENTS.md

## Project
Gut Run (variant A): fullscreen mobile Flappy-Bird-style game ad, designed at 360x640 CSS px (assets 720x1280, 2x). A smiling poo flies through a gut and avoids bacteria and text obstacles. Screens: start, fail endcard, win endcard. Task description: docs/task.md.
Talk to me in Polish. Code, comments and commits in English.

## Stack (nothing else)
Plain HTML, CSS and vanilla JS (ES6+, classic script tags). Gameplay on one <canvas> 2D, screens and UI in the DOM. GSAP core from lib/gsap.min.js, for DOM animations only. Audio with the Web Audio API. No frameworks, Phaser, bundlers, npm packages, CDN or tests. Mobile browsers, served from a local server. Total shipped size under 3 MB, no external requests.

## Files
At the repository root: index.html, style.css, reset.css, js/, lib/.
js/ has config.js, audio.js, game.js, ui.js, loaded in this order with classic script tags. Each file exposes one global: CONFIG, gameAudio, game, ui. game.js knows nothing about the DOM screens, it reports win or fail through one callback.
assets/ and design/ are provided: do not edit, rename or add files there. lib/ holds gsap.min.js: do not edit it.
README.md and DECISIONS.md at the repo root.

## KISS (top priority)
- The simplest solution that works wins. Plain functions and plain objects. No classes, patterns, abstractions, event bus or build step unless I ask.
- Few files, short functions with one job, no settings nobody uses, no premature optimisation.
- Do only what the current prompt asks. No extra features, no nice-to-haves, no refactoring I did not ask for.
- If there are two options, give both with a one-line trade-off and recommend the simpler one.
- Prefer deleting code over adding code. If something feels clever, make it boring.

## Rules
- Images are 2x: render them at 50% of their pixel size. DOM images have explicit width and height, on canvas draw them at half size.
- Use only the positions and texts I give in the prompt. Never guess them from an image. You may propose game-feel numbers (gravity, impulse, speed, insets, obstacle spacing), I tune them. All numbers live in js/config.js, no magic numbers elsewhere.
- CSS: BEM (block__element--modifier), class selectors, no ids, no !important, no style attributes in HTML. Blocks: "ad", "screen", "mute". JS uses the same classes. JS may set only the CSS variable --scale, GSAP sets its own transforms and opacity.
- Link reset.css before style.css. It sets box-sizing: border-box, margin: 0 and padding: 0 for *, *::before and *::after.
- Layout: the 360x640 stage scales as one unit to the visible viewport (window.visualViewport, fallback innerWidth and innerHeight, updated on resize and orientationchange), without distortion. Page background is the colour of the design edge. The page does not scroll or zoom (touch-action, overscroll-behavior, user-select).
- Canvas backing store is 720x1280, drawn with ctx.scale(2, 2) in 360x640 units.
- Gameplay: player x is fixed. A tap SETS vertical velocity (impulse), gravity pulls down, fall speed is clamped. The world scrolls with scrollX. The level is a list in config (sprite, worldX, y), each obstacle appears exactly once per run. Movement uses dt only, no setInterval or setTimeout in gameplay.
- Collision: the hitbox is the opaque part of the sprite (getImageData in try/catch, fallback to the full image) shrunk by an inset from config. Never the full image rectangle. ?debug=1 draws hitboxes and the playfield, keys W and F force win and fail.
- One resetGame() sets the whole state, also on first start. One rAF loop. Replay leaves no timers, no extra speed, no doubled sounds, and kills GSAP tweens.
- Audio starts only after the first tap. One master gain for mute. visibilitychange pauses the loop and suspends audio, and resumes without a dt jump.
- GSAP animates only transform and opacity in the DOM, never the game loop. The intro starts on window load. Respect prefers-reduced-motion (final state, no decorative motion, gameplay stays). Idle loops (gesture hint, CTA pulse) are calm and stop after about 30 s.
- Clickout: const clickTag = window.clickTag || 'https://example.com/landing'; each CTA is one <a> with href=clickTag, target="_blank", rel="noopener noreferrer". Replay and mute are <button>.
- Accessibility: visible :focus-visible outline, Space and Enter also flap, touch targets at least 44 px, alt, aria-label and aria-pressed text only from the words I give (decorative images alt=""), <html lang> and <title> set, canvas has an aria-label, focus moves to the CTA when an endcard opens.
- Before a new mechanic, explain the concept in 3-5 simple sentences. After each change explain in 3-5 sentences what and why. Ask if something is unclear.
- If I tell you your output was wrong, say in one sentence what was wrong, so I can note it.

## Git
- Run `git status` before a new task. If there are uncommitted changes, stop and tell me.
- For each new task, create and work on a dedicated branch from `main`; never start new work directly on `main`. Use `feat/`, `fix/`, `docs/`, `perf/`, or `chore/` prefixes with a short English description.
- Do not move work that is already on `main` to a new branch retroactively unless I ask.
- Never commit or push. Propose a commit message: `type(scope): description` (chore, feat, fix, perf, docs).
- Never rewrite history. Never add node_modules or large files.