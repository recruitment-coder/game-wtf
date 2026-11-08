# Decision log

- Use plain JavaScript without a framework or game engine because the game only needs simple movement, image drawing, and collision checks.

- Use Canvas 2D for gameplay so drawing and collisions share one coordinate system. Keep controls and endcards in the DOM for native links, keyboard access, and GSAP animations.

- Scale the 360x640 stage as one unit to preserve proportions and keep hitboxes aligned. Use `visualViewport` to account for mobile browser toolbars.

- Keep obstacle positions and speed fixed so the level is repeatable and easier to tune.

- Use one time-based animation loop so movement does not depend on frame rate. Reset and pause cancel pending frames to prevent duplicate loops and movement jumps.

- Exclude transparent image margins and shrink collision rectangles to make hits more forgiving. Keep rectangular bounds for simplicity; they do not follow every curve or letter gap.

- Keep gameplay separate from screen handling. Replay resets the game, sounds, and animations together, while preserving the user's mute choice.

- Use Web Audio with one shared volume control so mute affects every sound. Unlock audio after user interaction to respect autoplay restrictions.

- Pause gameplay and audio when the tab is hidden so players cannot lose during their absence and the ad stays silent.

- Use local GSAP for decorative animation without a CDN dependency. Limit idle motion to about 30 seconds and respect reduced-motion preferences to reduce distraction.

- Keep supplied assets unchanged; full transparent endcard layers preserve their original placement. No compression was needed because the application and assets fit below 3 MB.

- Use native links for CTAs and buttons for replay and mute. Focus the endcard CTA and preserve 44 px touch targets after scaling for keyboard and touch access.
