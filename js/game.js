const game = {
  async init(canvas, onGameEnd) {
    if (typeof onGameEnd !== 'function') {
      throw new TypeError('A game-end callback is required.');
    }

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to create a 2D canvas context.');
    }

    canvas.width = CONFIG.stage.canvasWidth;
    canvas.height = CONFIG.stage.canvasHeight;
    // Scale drawing coordinates to the 360x640 design size.
    context.scale(CONFIG.stage.pixelRatio, CONFIG.stage.pixelRatio);

    const [worldImage, playerImage, backgroundImages, startItemImages, borderImage, obstacleImages] = await Promise.all([
      this.loadImage(CONFIG.world.image),
      this.loadImage(CONFIG.player.image),
      Promise.all(CONFIG.scene.background.map(({ image }) => this.loadImage(image))),
      Promise.all(CONFIG.scene.startItems.map(({ image }) => this.loadImage(image))),
      this.loadImage(CONFIG.scene.border),
      Promise.all(CONFIG.level.map(({ image }) => this.loadImage(image)))
    ]);

    const playerHitbox = this.getVisibleHitbox(
      playerImage,
      CONFIG.player.width,
      CONFIG.player.height,
      CONFIG.hitbox.playerInset
    );
    const obstacleHitboxes = obstacleImages.map((image) => this.getVisibleHitbox(
      image,
      image.naturalWidth / CONFIG.stage.pixelRatio,
      image.naturalHeight / CONFIG.stage.pixelRatio,
      CONFIG.hitbox.obstacleInset
    ));
    const debugMode = new URLSearchParams(window.location.search).get('debug') === '1';

    let state;
    let scrollX;
    let playerY;
    let playerSpeedY;
    let previousFrameTime;
    let animationFrame;
    let runStartedAt = null;

    const resetGame = () => {
      cancelAnimationFrame(animationFrame);
      state = 'start';
      scrollX = 0;
      playerY = CONFIG.player.y;
      playerSpeedY = 0;
      previousFrameTime = null;
      animationFrame = undefined;
      runStartedAt = null;
    };

    const drawStartScreen = () => {
      context.clearRect(0, 0, CONFIG.stage.width, CONFIG.stage.height);
      this.drawBackground(context, backgroundImages);
      this.drawWorld(context, worldImage, 0);
      this.drawObstacles(context, obstacleImages, 0);
      this.drawHeader(context);
      this.drawStartItems(context, startItemImages, playerImage);
      this.drawBorder(context, borderImage);
    };

    const finishGame = (result, time, collided = false) => {
      if (state !== 'playing') {
        return;
      }

      state = result;
      // Cancel a queued frame when a debug key ends the run.
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
      const runSeconds = runStartedAt === null ? 0 : (time - runStartedAt) / 1000;
      console.log(`Total run time: ${runSeconds.toFixed(2)} seconds`);
      onGameEnd(state, collided);
    };

    const startGame = () => {
      resetGame();
      state = 'playing';
    };

    resetGame();
    drawStartScreen();

    const drawFrame = (time) => {
      if (state !== 'playing') {
        return;
      }

      if (runStartedAt === null) {
        runStartedAt = time;
      }

      // Limit long frame gaps so a pause doesn't jump the world forward.
      const secondsSinceLastFrame = previousFrameTime === null
        ? 0
        : Math.min((time - previousFrameTime) / 1000, CONFIG.world.maxSecondsPerFrame);
      previousFrameTime = time;

      scrollX = Math.min(
        scrollX + CONFIG.world.speed * secondsSinceLastFrame,
        CONFIG.world.levelLength - CONFIG.stage.width
      );

      playerSpeedY = Math.min(
        playerSpeedY + CONFIG.player.gravity * secondsSinceLastFrame,
        CONFIG.player.maxFallSpeed
      );
      playerY += playerSpeedY * secondsSinceLastFrame;

      const topLimit = CONFIG.stage.playfieldTop;
      const bottomLimit = CONFIG.stage.playfieldBottom;
      const playerBox = {
        x: CONFIG.player.x + playerHitbox.x,
        y: playerY + playerHitbox.y,
        width: playerHitbox.width,
        height: playerHitbox.height
      };
      let result = null;
      let collided = false;

      if (playerBox.y < topLimit || playerBox.y + playerBox.height > bottomLimit) {
        result = 'fail';
      }

      context.clearRect(0, 0, CONFIG.stage.width, CONFIG.stage.height);
      this.drawBackground(context, backgroundImages);
      this.drawWorld(context, worldImage, scrollX);
      this.drawObstacles(context, obstacleImages, scrollX);

      CONFIG.level.forEach((obstacle, index) => {
        const hitbox = obstacleHitboxes[index];
        const obstacleBox = {
          x: obstacle.worldX - scrollX + hitbox.x,
          y: obstacle.y + hitbox.y,
          width: hitbox.width,
          height: hitbox.height
        };
        const overlaps = playerBox.x < obstacleBox.x + obstacleBox.width
          && playerBox.x + playerBox.width > obstacleBox.x
          && playerBox.y < obstacleBox.y + obstacleBox.height
          && playerBox.y + playerBox.height > obstacleBox.y;

        if (result === null && overlaps) {
          result = 'fail';
          collided = true;
        }
      });

      this.drawHeader(context);
      context.drawImage(
        playerImage,
        CONFIG.player.x,
        playerY,
        CONFIG.player.width,
        CONFIG.player.height
      );
      this.drawBorder(context, borderImage);

      if (debugMode) {
        this.drawDebug(context, playerBox, obstacleHitboxes, scrollX, topLimit, bottomLimit);
      }

      const levelEnd = CONFIG.world.levelLength - CONFIG.stage.width;
      const allObstaclesPassed = CONFIG.level.every((obstacle, index) => {
        const hitbox = obstacleHitboxes[index];
        return obstacle.worldX - scrollX + hitbox.x + hitbox.width <= playerBox.x;
      });

      if (result === null && scrollX >= levelEnd && allObstaclesPassed) {
        result = 'win';
      }

      if (result !== null) {
        finishGame(result, time, collided);
      } else {
        animationFrame = requestAnimationFrame(drawFrame);
      }
    };

    return {
      resetGame() {
        resetGame();
        drawStartScreen();
      },
      jump() {
        const started = state === 'start';
        if (state === 'start') {
          startGame();
        }
        if (state !== 'playing') {
          return;
        }

        playerSpeedY = CONFIG.player.impulse;
        if (animationFrame === undefined) {
          animationFrame = requestAnimationFrame(drawFrame);
        }
        return started;
      },
      pause() {
        cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
        previousFrameTime = null;
      },
      resume() {
        if (state === 'playing' && animationFrame === undefined) {
          animationFrame = requestAnimationFrame(drawFrame);
        }
      },
      forceResult(result) {
        if (!debugMode || (result !== 'fail' && result !== 'win')) {
          return;
        }
        if (state === 'start') {
          startGame();
        }
        finishGame(result, performance.now());
      },
      debugMode
    };
  },

  getVisibleHitbox(image, drawWidth, drawHeight, inset) {
    // Ignore transparent margins before shrinking the collision rectangle.
    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = image.naturalWidth;
    pixelCanvas.height = image.naturalHeight;
    const pixelContext = pixelCanvas.getContext('2d');
    if (!pixelContext) {
      throw new Error('Unable to create a canvas for hitbox detection.');
    }
    pixelContext.drawImage(image, 0, 0);

    let left = 0;
    let top = 0;
    let right = image.naturalWidth;
    let bottom = image.naturalHeight;

    try {
      const pixels = pixelContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
      left = image.naturalWidth;
      top = image.naturalHeight;
      right = -1;
      bottom = -1;

      for (let y = 0; y < image.naturalHeight; y += 1) {
        for (let x = 0; x < image.naturalWidth; x += 1) {
          if (pixels[(y * image.naturalWidth + x) * 4 + 3] === 0) {
            continue;
          }
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x + 1);
          bottom = Math.max(bottom, y + 1);
        }
      }

      if (right < 0 || bottom < 0) {
        left = 0;
        top = 0;
        right = image.naturalWidth;
        bottom = image.naturalHeight;
      }
    } catch (error) {
      console.warn('Unable to read image pixels; using the full image for hitbox bounds.', error);
    }

    const scaleX = drawWidth / image.naturalWidth;
    const scaleY = drawHeight / image.naturalHeight;
    const visibleX = left * scaleX;
    const visibleY = top * scaleY;
    const visibleWidth = (right - left) * scaleX;
    const visibleHeight = (bottom - top) * scaleY;
    const insetX = Math.min(inset, Math.max((visibleWidth - 1) / 2, 0));
    const insetY = Math.min(inset, Math.max((visibleHeight - 1) / 2, 0));

    return {
      x: visibleX + insetX,
      y: visibleY + insetY,
      width: visibleWidth - insetX * 2,
      height: visibleHeight - insetY * 2
    };
  },

  drawDebug(context, playerBox, obstacleHitboxes, scrollX, topLimit, bottomLimit) {
    context.strokeStyle = CONFIG.debug.playerColor;
    context.lineWidth = CONFIG.debug.lineWidth;
    context.strokeRect(playerBox.x, playerBox.y, playerBox.width, playerBox.height);
    context.strokeStyle = CONFIG.debug.obstacleColor;
    CONFIG.level.forEach((obstacle, index) => {
      const hitbox = obstacleHitboxes[index];
      const x = obstacle.worldX - scrollX + hitbox.x;
      if (x + hitbox.width <= 0 || x >= CONFIG.stage.width) {
        return;
      }
      context.strokeRect(x, obstacle.y + hitbox.y, hitbox.width, hitbox.height);
    });
    context.strokeStyle = CONFIG.debug.playfieldColor;
    context.strokeRect(0, topLimit, CONFIG.stage.width, bottomLimit - topLimit);
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

  drawObstacles(context, obstacleImages, scrollX) {
    CONFIG.level.forEach((obstacle, index) => {
      const image = obstacleImages[index];
      const width = image.naturalWidth / CONFIG.stage.pixelRatio;
      const height = image.naturalHeight / CONFIG.stage.pixelRatio;
      const x = obstacle.worldX - scrollX;

      if (x + width <= 0 || x >= CONFIG.stage.width) {
        return;
      }

      context.drawImage(image, x, obstacle.y, width, height);
    });
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
