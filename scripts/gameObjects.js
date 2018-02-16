// --------------------------------------------------------------------------
function Planet(options)
{
  Sprite.call(this, {
    image: options.image,
    x: options.x,
    y: -600
  })
  this.passedShip = false;
  this.mover = new ConstantMover(this, 2.5);
  this.mover.setNewTargetPos(this.x, 600);
  this.audio = new Audio("audio/test.mp3");
  //this.audio.play();

  this.update = function(frameTime)
  {
    this.mover.move(frameTime);      
  }

  this.gone = function()
  {
    return this.y >= 600;
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
  Sprite.call(this, {
    image: options.image,
    y: 250
  });
  this.mover = new SmoothMover(this, 0.5)
  
  this.update = function(frameTime = 0) 
  {
    this.mover.move(frameTime);
  }

  this.moveTo = function(x, y)
  {
    this.mover.setNewTargetPos(x, y);
  }

  this.isWaiting = function()
  {
    return !this.mover.isMoving();
  }
}

