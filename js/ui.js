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

    // Stop music and play the sounds for the game result.
    const onGameEnd = (result, collided) => {
      gameAudio.stopMusic();
      if (collided) {
        gameAudio.playSound('crash');
      }
      gameAudio.playSound(result);
      console.log(`Game result: ${result}`);
    };

    // Let pointer and keyboard input trigger the same jump.
    game.init(canvas, onGameEnd).then((gameLoop) => {
      const jump = () => {
        gameAudio.unlockAudio();
        if (gameLoop.jump()) {
          gameAudio.playMusic();
        }
      };
      stage.addEventListener('pointerdown', jump);

      // Pause both the animation and audio while the tab is hidden.
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          gameLoop.pause();
          gameAudio.suspend();
        } else {
          gameAudio.resume();
          gameLoop.resume();
        }
      });

      window.addEventListener('keydown', (event) => {
        // Debug keys finish the run without playing the whole level.
        if (gameLoop.debugMode && (event.code === 'KeyW' || event.code === 'KeyF')) {
          event.preventDefault();
          if (!event.repeat) {
            gameAudio.unlockAudio();
            gameLoop.forceResult(event.code === 'KeyW' ? 'win' : 'fail');
          }
          return;
        }

        if (event.code !== 'Space' && event.code !== 'Enter') {
          return;
        }

        event.preventDefault();
        if (!event.repeat) {
          jump();
        }
      });
    }).catch((error) => {
      console.error('Unable to start the game world.', error);
    });
  }
};

ui.init();
