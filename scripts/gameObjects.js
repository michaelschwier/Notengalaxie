// --------------------------------------------------------------------------
function Planet(options)
{
  Sprite.call(this, {
    image: options.image,
    x: options.x,
    y: -800
  })
  this.passedShip = false;
  this.mover = new ConstantMover(this, 3.5);
  this.mover.setNewTargetPos(this.x, 600);
  this.audio = options.audio;
  this.audio.play();

  this.update = function(frameTime)
  {
    this.mover.move(frameTime);
  }

  this.gone = function()
  {
    if (this.y >= 600) {
      this.audio.pause();
      return true;
    }
    else {
      return false;
    }
  }

  this.setPassedState = function() 
  {
    this.passedShip = true;
  }

  this.hasPassed = function() 
  {
    return this.passedShip;
  }
}

// --------------------------------------------------------------------------
function Ship(options)
{
  MultiFrameAnimatedSprite.call(this, {
    image: options.image,
    x: options.x,
    y: 250,
    numberOfFrames: 2,
    updateRate: 0.07
  });
  this.mover = new SmoothMover(this, 0.5)
  this.blinkTime = 0.7;
  this.currBlinkTime = this.blinkTime;
  
  this.ssuper_update = this.update;
  this.update = function(frameTime = 0) 
  {
    this.mover.move(frameTime);
    if (this.currBlinkTime < this.blinkTime) {
      this.currBlinkTime += frameTime;
      if (this.currBlinkTime > this.blinkTime) {
        this.pause();
        this.rewind();
      }
    }
    this.ssuper_update(frameTime);
  }

  this.moveTo = function(x, y)
  {
    this.mover.setNewTargetPos(x, y);
  }

  this.isWaiting = function()
  {
    return !this.mover.isMoving();
  }

  this.blink = function()
  {
    this.playLoop();
    this.currBlinkTime = 0.0;
  }
}

// --------------------------------------------------------------------------
function NavigationButton(options, command)
{
  Button.call(this, options, command);
  this.relClipX = options.x;
  this.offsetX = this.clipWidth;
  this.clipWidth = options.width;

  this.overlay = new MultiFrameSprite({
    image: options.overlayImage,
    x: options.overlayX,
    y: options.overlayY,
    numberOfFrames: 2
  });

  this.super_update = function(frameTime)
  {
    this.clipX = this.frameIndex * this.offsetX + this.relClipX;
    this.overlay.setCurrentFrameIdx(this.frameIndex);
    this.overlay.update(frameTime);
  }

  this.super_render = this.render;
  this.render = function(renderContext)
  {
    this.super_render(renderContext);
    this.overlay.render(renderContext);
  }
}

// --------------------------------------------------------------------------
function ScoreBar(options)
{
  this.currScore = options.initScore || 3;
  this.maxScore = 10;
  this.looseScore = 0;
  this.scorePointSprites = [];
  for (i = 0; i < this.maxScore; i++) {
    this.scorePointSprites[i] = new MultiFrameAnimatedSprite({
      image: options.image,
      y: 378 - (i * 42),
      numberOfFrames: 2
    });
  }

  this.updateScore = function(increment) 
  {
    this.currScore += increment;
    this.currScore = this.currScore < this.looseScore ? this.looseScore : this.currScore;
    this.currScore = this.currScore > this.maxScore ? this.maxScore : this.currScore;
  }

  this.getScore = function()
  {
    return this.currScore;
  }

  this.isMax = function()
  {
    return this.currScore == this.maxScore;
  }

  this.isEmpty = function()
  {
    return this.currScore == this.looseScore;
  }

  this.update = function(framTime)
  {
    for (i = 0; i < this.maxScore; i++) {
      if (i < this.currScore) {
        this.scorePointSprites[i].setCurrentFrameIdx(1);
      }
      else {
        this.scorePointSprites[i].setCurrentFrameIdx(0);
      }
      this.scorePointSprites[i].update(framTime);
    }
  }

  this.render = function(renderContext)
  {
    for (i = 0; i < this.maxScore; i++) {
      this.scorePointSprites[i].render(renderContext);
    }
  }
}



