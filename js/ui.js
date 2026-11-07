const ui = {
  init() {
    const stage = document.querySelector('.ad');
    const canvas = stage.querySelector('.ad__canvas');

    // Scale the stage to fit the visible screen without stretching it.
    const resizeStage = () => {
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

    game.init(canvas);
  }
};

ui.init();
