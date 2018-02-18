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
    var newVolume = this.audio.volume - (frameTime / 2);
    this.audio.volume = newVolume < 0 ? 0 : newVolume;
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
