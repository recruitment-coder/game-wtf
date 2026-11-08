const CONFIG = {
  // Design size and 2x canvas size.
  stage: {
    width: 360,
    height: 640,
    pixelRatio: 2,
    canvasWidth: 720,
    canvasHeight: 1280,
    playfieldTop: 170,
    playfieldBottom: 640
  },
  // Background strip settings.
  world: {
    image: 'assets/01_game/gameplay.png',
    levelLength: 2528,
    speed: 120,
    // Prevents a large movement jump after a pause.
    maxSecondsPerFrame: 0.05
  },
  level: [
    { image: 'assets/01_game/bac1.png', worldX: 380, y: 240 },
    { image: 'assets/01_game/txt1.png', worldX: 505, y: 365 },
    { image: 'assets/01_game/bac2.png', worldX: 630, y: 180 },
    { image: 'assets/01_game/txt2.png', worldX: 755, y: 340 },
    { image: 'assets/01_game/bac3.png', worldX: 880, y: 250 },
    { image: 'assets/01_game/txt3.png', worldX: 1005, y: 400 },
    { image: 'assets/01_game/bac4.png', worldX: 1130, y: 210 },
    { image: 'assets/01_game/txt4.png', worldX: 1255, y: 350 },
    { image: 'assets/01_game/bac5.png', worldX: 1380, y: 260 },
    { image: 'assets/01_game/txt5.png', worldX: 1505, y: 410 },
    { image: 'assets/01_game/bac6.png', worldX: 1630, y: 220 },
    { image: 'assets/01_game/txt6.png', worldX: 1755, y: 380 },
    { image: 'assets/01_game/txt7.png', worldX: 1880, y: 230 },
    { image: 'assets/01_game/txt8.png', worldX: 2005, y: 380 },
    { image: 'assets/01_game/txt9.png', worldX: 2130, y: 300 }
  ],
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
    height: 41,
    gravity: 900,
    impulse: -350,
    maxFallSpeed: 420
  },
  audio: {
    files: {
      music: 'assets/music/background_music/Funny Game Loop.mp3',
      crash: 'assets/music/crash/Cartoon Crash Boing.mp3',
      fail: 'assets/music/endcard_fail/Fail.mp3',
      win: 'assets/music/endcard_win/applause.mp3'
    },
    volume: 1,
    mutedVolume: 0
  },
  hitbox: {
    playerInset: 5,
    obstacleInset: 4
  },
  debug: {
    playerColor: '#00ff00',
    obstacleColor: '#ff0000',
    playfieldColor: '#00ffff',
    lineWidth: 2
  }
};
