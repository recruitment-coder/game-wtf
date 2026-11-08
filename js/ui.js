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

    // Endcards will use this callback in the next stage.
    const onGameEnd = (result) => {
      console.log(`Game result: ${result}`);
    };

    // Let pointer and keyboard input trigger the same jump.
    game.init(canvas, onGameEnd).then((gameLoop) => {
      stage.addEventListener('pointerdown', () => {
        gameLoop.jump();
      });

      window.addEventListener('keydown', (event) => {
        // Debug keys finish the run without playing the whole level.
        if (gameLoop.debugMode && (event.code === 'KeyW' || event.code === 'KeyF')) {
          event.preventDefault();
          if (!event.repeat) {
            gameLoop.forceResult(event.code === 'KeyW' ? 'win' : 'fail');
          }
          return;
        }

        if (event.code !== 'Space' && event.code !== 'Enter') {
          return;
        }

        event.preventDefault();
        if (!event.repeat) {
          gameLoop.jump();
        }
      });
    }).catch((error) => {
      console.error('Unable to start the game world.', error);
    });
  }
};

ui.init();
