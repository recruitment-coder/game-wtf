# Gut Run

A mobile tap-to-jump game ad for Variant A of the frontend task. Guide Poo through a scrolling gut, avoid bacteria and text obstacles, and reach the end to win.

## Technologies

- HTML5, CSS, and vanilla JavaScript (ES6+) with classic script tags
- Canvas 2D for gameplay and DOM elements for the tutorial, endcards, and controls
- Local GSAP core from `lib/gsap.min.js` for DOM animations
- Web Audio API for music and sound effects

There is no build step, framework, package manager, or CDN dependency. All runtime files are local; only CTA links navigate to an external landing page.

## Run locally

1. Open this repository in VS Code and start the Live Server extension from the repository root.
2. Open `/index.html` on the local server, for example `http://127.0.0.1:5500/index.html`.

Use a local server rather than opening the HTML file directly: audio files are loaded with `fetch`, and collision bounds require access to image pixels.

## Current behavior

- Tap the stage or press Space/Enter to start and jump. Each input sets the upward speed rather than adding to it.
- The 360x640 stage scales proportionally to the visible viewport, including changes caused by mobile browser toolbars. Different aspect ratios can leave background space around the stage.
- The level has a fixed order of six bacteria and nine text obstacles, each appearing once. World speed is constant at 120 design units per second; reaching the end takes about 18.1 seconds of gameplay.
- Hitting an obstacle or leaving the playfield shows the fail endcard. Passing all obstacles and reaching the end shows the win endcard.
- Replay on the fail endcard returns to the start and resets gameplay, sounds, and animations. The speaker button toggles music and effects together.
- Audio is unlocked after a user interaction. Music loops during gameplay; a collision plays crash and fail sounds, and a win plays applause.
- Hiding the tab pauses gameplay and audio and stops decorative animations. Gameplay resumes without a movement jump.
- GSAP animates the intro and endcards. Hint and CTA loops stop after about 30 seconds. With `prefers-reduced-motion`, decorative elements appear in their final state.
- Endcard CTAs open a new tab. Their destination uses `window.clickTag`, set before `js/ui.js` runs, or falls back to `https://example.com/landing`.


## Debug mode

Open `/index.html?debug=1` to draw player and obstacle hitboxes and playfield bounds during gameplay. Press W to force a win or F to force a fail, including from the start screen. Shortcuts are ignored while a button or link has focus; click a non-interactive area before using them.

## Next steps

- Tune obstacle placement and collision insets through playtesting, especially around tall text obstacles.
- Consider a longer preparation period and a gentle difficulty increase after checking that the level remains passable.

## Known issues and shortcuts

- Collision uses axis-aligned rectangles around non-transparent pixels, reduced by configurable insets. It does not follow every curve or the empty spaces inside letters. If pixel access fails, bounds fall back to the image rectangle, still reduced by the inset.
- The playfield is a fixed rectangle from y=170 to y=640; the decorative gut edges are not collision surfaces.
- Most endcard images are full 720x1280 transparent layers, kept unchanged and rendered at 360x640. Individual elements are animated as those complete layers.


## AI note

Claude was used for planning and step-by-step prompts. GitHub Copilot helped with the initial implementation, and Codex helped complete and review gameplay, audio, UI, and documentation. Generated code was reviewed and adjusted, including clearer variable names and changes to animation behavior. One AI-assisted UI pass called GSAP without noticing that the local library file was empty, which also interrupted tutorial hiding and music startup. The local library was supplied and guards were added so unavailable animations do not block the game.
