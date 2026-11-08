const CONFIG = {
  // Design size and 2x canvas size.
  stage: {
    width: 360,
    height: 640,
    pixelRatio: 2,
    canvasWidth: 720,
    canvasHeight: 1280
  },
  // Background strip settings.
  world: {
    image: 'assets/01_game/gameplay.png',
    levelLength: 2528,
    speed: 120,
    // Prevents a large movement jump after a pause.
    maxSecondsPerFrame: 0.05
  },
  scene: {
    background: [
      { image: 'assets/bg.jpg', x: 0, y: 0, width: 360, height: 640 },
      { image: 'assets/01_game/bg_texture.png', x: 0, y: 0, width: 360, height: 640 }
    ],
    startItems: [
      { image: 'assets/01_game/bac6.png', x: 100, y: 317, width: 38, height: 35 },
      { image: 'assets/01_game/bac2.png', x: 269.5, y: 330, width: 26.5, height: 70 },
      { image: 'assets/01_game/txt1.png', x: 105, y: 366, width: 23, height: 94 },
      { image: 'assets/01_game/txt2.png', x: 298, y: 385, width: 34, height: 113 },
      { image: 'assets/gesture.png', x: 149, y: 450, width: 86.5, height: 96 }
    ],
    header: {
      x: 0,
      y: 58,
      width: 360,
      height: 112,
      color: '#0b1e49'
    },
    border: 'assets/border.png'
  },
  player: {
    image: 'assets/01_game/player.png',
    x: 60,
    y: 260,
    width: 42,
    height: 41
  }
};
