// --------------------------------------------------------------------------
// Resource Handling
// --------------------------------------------------------------------------
function ResourcePreLoader()
{
  var images = {};
  var loadedImagesCount = 0;
  var callback = null;

  this.addImage = function(name, src)
  {
    images[name] = src;
  }

  this.getImage = function(name)
  {
    return images[name];
  }

  function loadNext()
  {
    var imageSrc = null;
    var key;
    for (key in images) {
      var value = images[key];
      if (typeof value === 'string') {
        imageSrc = value;
        break;
      }
    }
    if (imageSrc) {
      var image = new Image();
      images[key] = image;
      image.addEventListener("load", loadNext);
      image.src = imageSrc;
    }
    else {
      callback();
    }
  }

  this.loadAndCallWhenDone = function(c)
  {
    callback = c;
    loadNext();
  }
}

// --------------------------------------------------------------------------
// Sprites
// --------------------------------------------------------------------------
function Sprite(options)
{
  this.image = options.image;
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.width = options.width || this.image.naturalWidth;
  this.height = options.height || this.image.naturalHeight;
  this.clipX = options.clipX || 0;
  this.clipY = options.clipY || 0;
  this.clipWidth = options.clipWidth || this.image.naturalWidth;
  this.clipHeight = options.clipHeight || this.image.naturalHeight;

  this.update = function(frameTime = 0)
  { }
  
  this.render = function(renderContext)
  {
    renderContext.drawImage(
      this.image,
      this.clipX,
      this.clipY,
      this.clipWidth,
      this.clipHeight,
      this.x,
      this.y,
      this.width,
      this.height);
  }
}

// --------------------------------------------------------------------------
function ScrollSprite(options)
{
  Sprite.call(this, options);

  this.xScrollPerSec = options.xScrollPerSec || 0;
  this.yScrollPerSec = options.yScrollPerSec || 0;
  this.loop = options.loop || false;

  this.update = function(frameTime = 0)
  {
    this.updateClip(frameTime);
    if (this.clipExceedsImage()) {
      if (this.loop) {
        this.handleClipOverflow();
      }
      else {
        this.setClipToEnd();
      }
    }
  }

  this.updateClip = function(frameTime)
  {
    this.clipX += this.xScrollPerSec * frameTime;
    this.clipY += this.yScrollPerSec * frameTime;
  }

  this.clipExceedsImage = function()
  {
    if (this.clipX < 0) { return true; }
    if (this.clipY < 0) { return true; }
    if (this.clipX + this.clipWidth > this.image.naturalWidth) { return true; }
    if (this.clipY + this.clipHeight > this.image.naturalHeight) { return true; }
    return false;
  }

  this.handleClipOverflow = function()
  {
    if (this.xScrollPerSec > 0) {
      this.clipX -= (this.image.naturalWidth - this.clipWidth);
    }
    else if (this.xScrollPerSec < 0) {
      this.clipX += (this.image.naturalWidth - this.clipWidth);
    }
    if (this.yScrollPerSec > 0) {
      this.clipY -= (this.image.naturalHeight - this.clipHeight);
    }
    else if (this.yScrollPerSec < 0) {
      this.clipY += (this.image.naturalHeight - this.clipHeight);
    }
  }

  this.setClipToEnd = function()
  {
    if (this.xScrollPerSec > 0) {
      this.clipX = this.image.naturalWidth - this.clipWidth;
    }
    else if (this.xScrollPerSec < 0) {
      this.clipX = 0;
    }
    if (this.yScrollPerSec > 0) {
      this.clipY = this.image.naturalHeight - this.clipHeight;
    }
    else if (this.yScrollPerSec < 0) {
      this.clipY = 0;
    }    
  }
}

// --------------------------------------------------------------------------
function SinusAnimationSprite(options)
{
  Sprite.call(this, options);

  var verticalRelPos = 0.0;
  var horizontalRelPos = 0.0;
  var verticalStepSize = Math.PI / options.verticalSteps;
  var horizontalStepSize = Math.PI / options.horizontalSteps;
  var verticalMoveRange = options.verticalMoveRange;
  var horizontalMoveRange = options.horizontalMoveRange;

  this.update = function(frameTime = 0)
  {
    verticalRelPos += verticalStepSize;
    if (verticalRelPos > (2 * Math.PI)) {
      verticalRelPos -= (2 *Math.PI);
    }
    horizontalRelPos += horizontalStepSize;
    if (horizontalRelPos > (2 * Math.PI)) {
      horizontalRelPos -= (2 * Math.PI);
    }
    this.clipX = horizontalMoveRange + Math.sin(horizontalRelPos) * horizontalMoveRange;
    this.clipY = verticalMoveRange + Math.sin(verticalRelPos) * verticalMoveRange;
  }
}

// --------------------------------------------------------------------------
function MultiFrameSprite(options)
{
  Sprite.call(this, options);
  this.width = options.width || this.image.naturalWidth / options.numberOfFrames;
  this.clipWidth = options.clipWidth || this.image.naturalWidth / options.numberOfFrames;

  this.frameIndex = 0;
  this.numberOfFrames = options.numberOfFrames || 1;

  this.getNumberOfFrames = function()
  {
    return this.numberOfFrames;
  }

  this.setCurrentFrameIdx = function(newFrameIndex)
  {
    this.frameIndex = Math.min((this.numberOfFrames - 1), Math.max(0, newFrameIndex));
  }

  this.increaseCurrentFrameIdxBy = function(step)
  {
    this.setCurrentFrameIdx(this.frameIndex + step)
  }

  this.getCurrentFrameIdx = function()
  {
    return this.frameIndex;
  }

  this.update = function(frameTime = 0) 
  { 
    this.clipX = this.frameIndex * this.clipWidth;
  }

  this.reset = function()
  {
    this.frameIndex = 0;
    this.update();
  }
}

// --------------------------------------------------------------------------
function MultiFrameAnimatedSprite(options)
{
  MultiFrameSprite.call(this, options);

  this.isPlaying = false;
  this.autoRepeat = false;
  this.updateRate = options.updateRate || 0.04;
  this.currFrameTime = 0;

  this.play = function() 
  {
    this.currFrameTime = 0;
    this.isPlaying = true;
  }

  this.playLoop = function() 
  {
    this.autoRepeat = true;
    this.play();
  }

  this.pause = function()
  {
    this.isPlaying = false;
    this.autoRepeat = false;
  }

  this.rewind = function()
  {
    this.frameIndex = 0;
  }

  this.super_update = this.update;
  this.update = function(frameTime = 0)
  {
    if (this.isPlaying) {
      this.currFrameTime += frameTime;
      if (this.currFrameTime >= this.updateRate) {
        this.currFrameTime = 0;
        if (this.frameIndex < this.numberOfFrames - 1) {
          this.increaseCurrentFrameIdxBy(1);
        }
        else if (this.autoRepeat) {
          this.frameIndex = 0;
        }
        else {
          this.pause();
        }
      }
    }
    this.super_update();
  }
}

// --------------------------------------------------------------------------
// Movers implementing different strategies to move sprites automatically
// --------------------------------------------------------------------------
function AbstractLinearMover(sprite, timeForMove)
{
  this.sprite = sprite;
  this.timeForMove = timeForMove;
  this.startPosX = sprite.x;
  this.startPosY = sprite.y;
  this.moveVectorX = 0;
  this.moveVectorY = 0;
  this.currMoveTime = this.timeForMove;

  this.setNewTargetPos = function(x, y)
  {
    this.startPosX = this.sprite.x;
    this.startPosY = this.sprite.y;  
    this.moveVectorX = x - this.sprite.x;
    this.moveVectorY = y - this.sprite.y;
    if ((this.moveVectorX != 0) || (this.moveVectorY != 0)) {
      this.currMoveTime = 0.0;
    }
  }

  this.getMoveVectorRatio = function()
  { 
    throw {name : "NotImplementedError", message : "This is an abstract base class!"};
  }

  this.move = function(frameTime)
  {
    if (this.isMoving()) {
      if (this.currMoveTime < this.timeForMove - frameTime) {
        this.currMoveTime += frameTime;
        mvRatio = this.getMoveVectorRatio();
        this.sprite.x = this.startPosX + this.moveVectorX * mvRatio;
        this.sprite.y = this.startPosY + this.moveVectorY * mvRatio;
      }
      else {
        this.sprite.x = this.startPosX + this.moveVectorX;
        this.sprite.y = this.startPosY + this.moveVectorY;
        this.reset();
      }
    }
  }

  this.isMoving = function()
  {
    return (this.currMoveTime < this.timeForMove);
  }

  this.reset = function()
  {
    this.startPosX = this.sprite.x;
    this.startPosY = this.sprite.y;
    this.moveVectorX = 0;
    this.moveVectorY = 0;
    this.currMoveTime = this.timeForMove;  
  }

}

// --------------------------------------------------------------------------
function ConstantMover(sprite, timeForMove)
{
  AbstractLinearMover.call(this, sprite, timeForMove);

  this.getMoveVectorRatio = function()
  {
    return this.currMoveTime / this.timeForMove;
  }

}

// --------------------------------------------------------------------------
function SmoothMover(sprite, timeForMove)
{
  AbstractLinearMover.call(this, sprite, timeForMove);

  this.getMoveVectorRatio = function()
  {
    ratioRelToPI = (this.currMoveTime / this.timeForMove) * Math.PI;
    cosScaled = Math.cos(Math.PI + ratioRelToPI);
    normRatio = (1.0 + cosScaled) / 2.0;
    return normRatio;
  }
}

// --------------------------------------------------------------------------
function OrbitMover(sprite, timeForMove, moveVectorX, moveVectorY)
{
  this.sprite = sprite;
  this.timeForMove = timeForMove;
  this.startPosX = sprite.x;
  this.startPosY = sprite.y;
  this.origWidth = sprite.width;
  this.origHeight = sprite.height;
  this.moveVectorX = moveVectorX;
  this.moveVectorY = moveVectorY;
  this.currMoveTime = 0.0;

  this.move = function(frameTime)
  {
    this.currMoveTime += frameTime;
    if (this.currMoveTime > this.timeForMove) {
      this.currMoveTime -= this.timeForMove;
    }
    ratioRelTo2PI = (this.currMoveTime / this.timeForMove) * 2 * Math.PI;
    cosScaled = Math.cos(Math.PI + ratioRelTo2PI);
    moveRatio = (1.0 + cosScaled) / 2.0;
    scaleRatio = Math.sin(ratioRelTo2PI)/4;

    this.sprite.x = this.startPosX + this.moveVectorX * moveRatio;
    this.sprite.y = this.startPosY + this.moveVectorY * scaleRatio;
    this.sprite.width = this.origWidth * (1 + scaleRatio);
    this.sprite.height = this.origHeight * (1 + scaleRatio);
  }

}

// --------------------------------------------------------------------------
// GUI elements based on sprites so they can be used in a scene
// --------------------------------------------------------------------------
function Button(options, command)
{
  MultiFrameSprite.call(this, {
    x: options.x,
    y: options.y,
    width: options.width,
    height: options.height,
    image: options.image,
    numberOfFrames: 2
  });
  this.clickAreaX = options.clickAreaX || options.x
  this.clickAreaY = options.clickAreaY || options.y
  this.clickAreaWidth = options.clickAreaWidth || options.width
  this.clickAreaHeigth = options.clickAreaHeigth || options.height
  this.command = command;
  this.buttonReleaseTime = options.buttonReleaseTime || 0.1;
  this.buttonReleaseCountDown = 0.0;    

  this.super_update = this.update;
  this.update = function(frameTime)
  {
    if (this.buttonReleaseCountDown > 0) {
      this.setCurrentFrameIdx(1);
      this.buttonReleaseCountDown -= frameTime;
    }
    else {
      this.setCurrentFrameIdx(0);
    }
    this.super_update(frameTime);
  }

  this.isHit = function(x, y) 
  {
    if (x >= this.clickAreaX 
        && y >= this.clickAreaY 
        && x < this.clickAreaX + this.clickAreaWidth 
        && y < this.clickAreaY + this.clickAreaHeigth) {
      return true;
    }
    else {
      return false;
    }
  }

  this.handleMouseDown = function(e)
  { 
    if (this.isHit(e.canvasX, e.canvasY)) {
      this.buttonReleaseCountDown = this.buttonReleaseTime;
      this.command.execute();
    }
  }
}


