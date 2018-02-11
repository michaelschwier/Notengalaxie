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
  this.width = options.width;
  this.height = options.height;
  this.clipX = options.clipX || 0;
  this.clipY = options.clipY || 0;
  this.clipWidth = options.clipWidth || this.image.naturalWidth;
  this.clipHeight = options.clipHeight || this.image.naturalHeight;
  this.context = options.context;

  this.update = function(frameTime = 0)
  { }
  
  this.render = function()
  {
    this.context.drawImage(
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
function SinusAnimationSprite(options)
{
  Sprite.call(this, options)

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
  Sprite.call(this, options)
  this.clipWidth = options.clipWidth || this.image.naturalWidth / options.numberOfFrames;
  this.clipHeight = options.clipHeight || this.image.naturalHeight;

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
  this.updateRate = options.updateRate || 1;
  this.currTickCount = 0;

  this.play = function() 
  {
    this.isPlaying = true;
  }

  this.playLoop = function() 
  {
    this.isPlaying = true;
    this.autoRepeat = true;
  }

  this.stop = function()
  {
    this.isPlaying = false;
    this.autoRepeat = false;
  }

  this.super_update = this.update;
  this.update = function(frameTime = 0)
  {
    this.currTickCount += 1;
    if (this.currTickCount >= this.updateRate) {
      this.currTickCount = 0;
      if (this.frameIndex < this.numberOfFrames - 1) {
        this.increaseCurrentFrameIdxBy(1);
      }
      else if (this.autoRepeat) {
        this.frameIndex = 0;
      }
      else {
        this.stop();
      }
    }
    this.super_update();
  }
}

// --------------------------------------------------------------------------
// Movers implementing different strategies to move sprites automatically
// --------------------------------------------------------------------------
function LinearMover(sprite, timeForMove)
{
  this.sprite = sprite;
  this.startPosX = sprite.x;
  this.startPosY = sprite.y;
  this.moveVectorX = 0;
  this.moveVectorY = 0;
  this.timeForMove = timeForMove;
  this.currMoveTime = this.timeForMove;

  this.setNewTargetPos = function(x, y)
  {
    this.startPosX = this.sprite.x;
    this.startPosY = this.sprite.y;  
    this.moveVectorX = x - this.sprite.x;
    this.moveVectorY = y - this.sprite.y;
    this.currMoveTime = 0.0;
  }

  this.getMoveVectorRatio = function()
  { 
    throw {name : "NotImplementedError", message : "This is an abstract base class!"};
  }

  this.move = function(frameTime)
  {
    if (this.currMoveTime < this.timeForMove - frameTime) {
      this.currMoveTime += frameTime;
      mvRatio = this.getMoveVectorRatio();
      this.sprite.x = this.startPosX + this.moveVectorX * mvRatio;
      this.sprite.y = this.startPosY + this.moveVectorY * mvRatio;
    }
    else {
      this.sprite.x = this.startPosX + this.moveVectorX;
      this.sprite.y = this.startPosY + this.moveVectorY;
    }
  }

}

// --------------------------------------------------------------------------
function ConstantMover(sprite, timeForMove)
{
  LinearMover.call(this, sprite, timeForMove);

  this.getMoveVectorRatio = function()
  {
    return this.currMoveTime / this.timeForMove;
  }

}

// --------------------------------------------------------------------------
function SmoothMover(sprite, timeForMove)
{
  LinearMover.call(this, sprite, timeForMove);

  this.getMoveVectorRatio = function()
  {
    ratioRelToPI = (this.currMoveTime / this.timeForMove) * Math.PI;
    cosScaled = Math.cos(Math.PI + ratioRelToPI);
    normRatio = (1.0 + cosScaled) / 2.0;
    return normRatio;
  }
}

