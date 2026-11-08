const ui = {
  init() {
    const stage = document.querySelector('.ad');
    const canvas = stage.querySelector('.ad__canvas');
    const startScreen = stage.querySelector('.screen--start');
    const failScreen = stage.querySelector('.screen--fail');
    const winScreen = stage.querySelector('.screen--win');
    const mute = stage.querySelector('.mute');
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clickTag = window.clickTag || 'https://example.com/landing';
    const animation = CONFIG.animation;
    let currentScreen = startScreen;
    let idleAnimation;

    stage.querySelectorAll('.screen__cta').forEach((link) => { link.href = clickTag; });

    const resizeStage = () => {
      // Mobile browser bars can change the visible area without resizing the window.
      const viewport = window.visualViewport;
      const width = viewport ? viewport.width : window.innerWidth;
      const height = viewport ? viewport.height : window.innerHeight;
      stage.style.setProperty('--scale', Math.min(width / CONFIG.stage.width, height / CONFIG.stage.height));
    };
    resizeStage();
    window.addEventListener('resize', resizeStage);
    window.addEventListener('orientationchange', resizeStage);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resizeStage);
    }

    const stopAnimations = () => {
      if (typeof gsap === 'undefined') {
        return;
      }
      if (idleAnimation) {
        idleAnimation.kill();
        idleAnimation = null;
      }
      const elements = stage.querySelectorAll('.screen img, .screen__cta, .screen__replay');
      gsap.killTweensOf(elements);
      gsap.set(elements, { clearProps: 'transform,opacity' });
    };

    const animateScreen = (screen) => {
      if (typeof gsap === 'undefined' || motionPreference.matches || document.hidden) {
        return;
      }
      const isEndcard = screen !== startScreen;
      const endcard = animation.endcard;
      if (isEndcard) {
        // Bring in the illustration first, then the headline and controls.
        gsap.from(screen.querySelector('.screen__bubble'), {
          opacity: 0, scale: endcard.bubbleScale, duration: animation.duration, ease: 'power2.out'
        });
        gsap.from(screen.querySelector('.screen__poo'), {
          opacity: 0, y: endcard.pooY, duration: endcard.pooDuration,
          delay: endcard.pooDelay, ease: endcard.pooEase
        });
        const bacteria = screen.querySelectorAll('.screen__bacteria');
        if (bacteria.length) {
          gsap.from(bacteria, {
            opacity: 0, y: endcard.bacteriaY, duration: animation.duration,
            delay: endcard.bacteriaDelay, stagger: animation.stagger, ease: animation.entranceEase
          });
        }
        gsap.from(screen.querySelector('.screen__headline'), {
          opacity: 0, y: animation.entranceY, duration: animation.duration,
          delay: endcard.headlineDelay, ease: 'power2.out'
        });
        gsap.from(screen.querySelectorAll('.screen__cta, .screen__replay'), {
          opacity: 0, y: animation.entranceY, duration: animation.duration,
          delay: endcard.buttonsDelay, stagger: animation.stagger, ease: animation.entranceEase
        });
      } else {
        gsap.from(screen.querySelector('.screen__headline'), {
          opacity: 0, y: animation.entranceY, duration: animation.duration, ease: animation.entranceEase
        });
      }
      const confetti = screen.querySelector('.screen__confetti');
      if (confetti) {
        gsap.from(confetti, { opacity: 0, y: animation.confettiY, duration: endcard.confettiDuration, ease: 'power2.out' });
      }
      const hint = screen.querySelector('.screen__gesture');
      const cta = screen.querySelector('.screen__cta');
      // Idle motion returns to its initial position and ends after about 30 seconds.
      idleAnimation = gsap.timeline({ delay: isEndcard ? endcard.idleDelay : animation.duration });
      const repeat = Math.max(0, Math.floor(animation.idleSeconds / (animation.pulseDuration * 2)) - 1);
      if (hint) {
        idleAnimation.to(hint, { scale: animation.hintPressScale, duration: animation.pulseDuration, repeat: repeat * 2 + 1, yoyo: true, ease: 'sine.inOut' });
      } else if (cta) {
        idleAnimation.to(cta, { scale: animation.pulseScale, duration: animation.pulseDuration, repeat: repeat * 2 + 1, yoyo: true, ease: 'sine.inOut' });
      }
    };

    const showScreen = (screen) => {
      stopAnimations();
      [startScreen, failScreen, winScreen].forEach((item) => { item.hidden = item !== screen; });
      currentScreen = screen;
      if (screen) {
        animateScreen(screen);
        const cta = screen.querySelector('.screen__cta');
        if (cta) {
          cta.focus({ preventScroll: true });
        }
      }
    };

    // Stop music and show the endcard reported by the game.
    const onGameEnd = (result, collided) => {
      gameAudio.stopMusic();
      if (collided) {
        gameAudio.playSound('crash');
      }
      gameAudio.playSound(result);
      showScreen(result === 'win' ? winScreen : failScreen);
    };

    mute.addEventListener('click', () => {
      gameAudio.unlockAudio();
      gameAudio.setMuted(!gameAudio.muted);
      mute.setAttribute('aria-pressed', String(gameAudio.muted));
      mute.setAttribute('aria-label', gameAudio.muted ? 'Ton an' : 'Ton aus');
      mute.querySelector('.mute__icon').textContent = gameAudio.muted ? '🔇' : '🔊';
    });

    game.init(canvas, onGameEnd).then((gameLoop) => {
      const jump = () => {
        if (currentScreen && currentScreen !== startScreen) {
          return;
        }
        gameAudio.unlockAudio();
        if (gameLoop.jump()) {
          showScreen(null);
          gameAudio.playMusic();
        }
      };
      stage.addEventListener('pointerdown', (event) => {
        if (!event.target.closest('button, a')) {
          jump();
        }
      });
      stage.querySelector('.screen__replay').addEventListener('click', () => {
        gameAudio.stopMusic();
        gameAudio.stopSounds();
        gameLoop.resetGame();
        showScreen(startScreen);
        canvas.focus({ preventScroll: true });
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          gameLoop.pause();
          gameAudio.suspend();
          stopAnimations();
        } else {
          gameAudio.resume();
          gameLoop.resume();
        }
      });
      window.addEventListener('keydown', (event) => {
        if (event.target.closest('button, a') || document.hidden) {
          return;
        }
        if (gameLoop.debugMode && (event.code === 'KeyW' || event.code === 'KeyF')) {
          event.preventDefault();
          if (!event.repeat) {
            gameAudio.unlockAudio();
            gameLoop.forceResult(event.code === 'KeyW' ? 'win' : 'fail');
          }
          return;
        }
        if (event.code === 'Space' || event.code === 'Enter') {
          event.preventDefault();
          if (!event.repeat) {
            jump();
          }
        }
      });
    }).catch((error) => console.error('Unable to start the game world.', error));

    motionPreference.addEventListener('change', stopAnimations);
    if (document.readyState === 'complete') {
      animateScreen(startScreen);
    } else {
      window.addEventListener('load', () => {
        if (currentScreen === startScreen) {
          animateScreen(startScreen);
        }
      }, { once: true });
    }
  }
};

ui.init();
