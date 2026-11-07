const game = {
  init(canvas) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to create a 2D canvas context.');
    }

    canvas.width = CONFIG.stage.canvasWidth;
    canvas.height = CONFIG.stage.canvasHeight;
    // Let game code use the 360x640 design size.
    context.scale(CONFIG.stage.pixelRatio, CONFIG.stage.pixelRatio);

    return context;
  }
};
