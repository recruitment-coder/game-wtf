const game = {
  async init(canvas) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to create a 2D canvas context.');
    }

    canvas.width = CONFIG.stage.canvasWidth;
    canvas.height = CONFIG.stage.canvasHeight;
    // Keep game positions in 360x640 units on the 2x canvas.
    context.scale(CONFIG.stage.pixelRatio, CONFIG.stage.pixelRatio);

    const [worldImage, playerImage, backgroundImages, startItemImages, borderImage] = await Promise.all([
      this.loadImage(CONFIG.world.image),
      this.loadImage(CONFIG.player.image),
      Promise.all(CONFIG.scene.background.map(({ image }) => this.loadImage(image))),
      Promise.all(CONFIG.scene.startItems.map(({ image }) => this.loadImage(image))),
      this.loadImage(CONFIG.scene.border)
    ]);

    this.drawBackground(context, backgroundImages);
    this.drawWorld(context, worldImage, 0);
    this.drawHeader(context);
    this.drawStartItems(context, startItemImages, playerImage);
    this.drawBorder(context, borderImage);

    let scrollX = 0;
    let playerY = CONFIG.player.y;
    let verticalVelocity = 0;
    let previousFrameTime = null;
    let animationFrame;

    const drawFrame = (time) => {
      // Limit long frame gaps so a pause doesn't jump the world forward.
      const secondsSinceLastFrame = previousFrameTime === null
        ? 0
        : Math.min((time - previousFrameTime) / 1000, CONFIG.world.maxSecondsPerFrame);
      previousFrameTime = time;

      scrollX = Math.min(
        scrollX + CONFIG.world.speed * secondsSinceLastFrame,
        CONFIG.world.levelLength - CONFIG.stage.width
      );

      verticalVelocity = Math.min(
        verticalVelocity + CONFIG.player.gravity * secondsSinceLastFrame,
        CONFIG.player.maxFallSpeed
      );
      playerY += verticalVelocity * secondsSinceLastFrame;

      const topLimit = CONFIG.stage.playfieldTop;
      const bottomLimit = CONFIG.stage.playfieldBottom - CONFIG.player.height;
      if (playerY < topLimit) {
        playerY = topLimit;
        verticalVelocity = 0;
      } else if (playerY > bottomLimit) {
        playerY = bottomLimit;
        verticalVelocity = 0;
      }

      context.clearRect(0, 0, CONFIG.stage.width, CONFIG.stage.height);
      this.drawBackground(context, backgroundImages);
      this.drawWorld(context, worldImage, scrollX);
      this.drawHeader(context);
      context.drawImage(
        playerImage,
        CONFIG.player.x,
        playerY,
        CONFIG.player.width,
        CONFIG.player.height
      );
      this.drawBorder(context, borderImage);

      animationFrame = requestAnimationFrame(drawFrame);
    };

    return {
      jump() {
        verticalVelocity = CONFIG.player.impulse;
        if (animationFrame === undefined) {
          animationFrame = requestAnimationFrame(drawFrame);
        }
      }
    };
  },

  drawBackground(context, backgroundImages) {
    backgroundImages.forEach((image, index) => {
      const layer = CONFIG.scene.background[index];
      context.drawImage(image, layer.x, layer.y, layer.width, layer.height);
    });
  },

  drawHeader(context) {
    context.fillStyle = CONFIG.scene.header.color;
    context.fillRect(
      CONFIG.scene.header.x,
      CONFIG.scene.header.y,
      CONFIG.scene.header.width,
      CONFIG.scene.header.height
    );
  },

  drawWorld(context, worldImage, scrollX) {
    context.drawImage(
      worldImage,
      -scrollX,
      0,
      CONFIG.world.levelLength,
      CONFIG.stage.height
    );
  },

  drawStartItems(context, itemImages, playerImage) {
    CONFIG.scene.startItems.forEach((item, index) => {
      context.drawImage(
        itemImages[index],
        item.x,
        item.y,
        item.width,
        item.height
      );
    });
    context.drawImage(
      playerImage,
      CONFIG.player.x,
      CONFIG.player.y,
      CONFIG.player.width,
      CONFIG.player.height
    );
  },

  drawBorder(context, borderImage) {
    context.drawImage(borderImage, 0, 0, CONFIG.stage.width, CONFIG.stage.height);
  },

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
      image.src = src;
    });
  }
};
