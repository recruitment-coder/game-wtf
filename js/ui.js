const ui = {
  init() {
    const stage = document.querySelector('.ad');
    const canvas = stage.querySelector('.ad__canvas');

    const resizeStage = () => {
      // Mobile browser bars can change the visible area without resizing the window.
      const viewport = window.visualViewport;
      const width = viewport ? viewport.width : window.innerWidth;
      const height = viewport ? viewport.height : window.innerHeight;
      const scale = Math.min(width / CONFIG.stage.width, height / CONFIG.stage.height);
      stage.style.setProperty('--scale', scale);
    };

    resizeStage();
    window.addEventListener('resize', resizeStage);
    window.addEventListener('orientationchange', resizeStage);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeStage);
    }

    // Start the game only after the world image has loaded and the player taps.
    game.init(canvas).then((gameLoop) => {
      stage.addEventListener('pointerdown', () => {
        gameLoop.start();
      }, { once: true });
    }).catch((error) => {
      console.error('Unable to start the game world.', error);
    });
  }
};

ui.init();
