// --------------------------------------------------------------------------
function PlanetBase(options)
{
  Sprite.call(this, {
    image: options.image,
    x: options.x,
    y: options.y
  })
  this.audio = options.audio;

  this.update = function(frameTime)
  {
    this.mover.move(frameTime);
  }
}

// --------------------------------------------------------------------------
function Planet(options)
{
  PlanetBase.call(this, {
    image: options.image,
    x: options.x,
    y: options.y || -400,
    audio: options.audio
  })
  this.maxY = 1000;
  this.passedShip = false;
  this.mover = new ConstantMover(this, 6.0 / getUrlParamAsInt("speed", 1.0));
  this.mover.setNewTargetPos(this.x, this.maxY);
  this.audio.play();

  this.gone = function()
  {
    if (this.y >= this.maxY) {
      this.audio.stop();
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
    y: options.y || 650,
    numberOfFrames: 2,
    updateRate: 0.07
  });
  this.mover = new SmoothMover(this, options.moveTime || 0.5)
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
    if (!this.mover.currentTargetPosEquals(x,y)) {
      this.mover.setNewTargetPos(x, y);
    }
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
  this.offsetX = this.clipWidth;
  this.clipWidth = options.width;

  this.overlay = new MultiFrameSprite({
    image: options.overlayImage,
    x: options.overlayX,
    y: options.overlayY,
    numberOfFrames: 2
  });

  this.super_update2 = this.update
  this.update = function(frameTime)
  {
    this.overlay.setCurrentFrameIdx(this.frameIndex);
    this.overlay.update(frameTime);
    this.super_update2(frameTime);
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
      x: 20 + i * 78,
      y: 20,
      width: 70,
      height: 52,
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

// --------------------------------------------------------------------------
function OrbitPlanet(options)
{
  PlanetBase.call(this, {
    image: options.image,
    x: options.x,
    y: options.y,
    audio: options.audio || null,
  })
  this.width = 45;
  this.height = 45;
  this.play = options.play;
  this.mover = new OrbitMover(this, options.orbitTime, -180, 50, this.play);
  if (options.play && options.audio) {
    this.audio.play()
  }

  this.repeatCallback = function()
  {
    if (this.play && options.audio) {
      this.audio.play();
      this.play = false;
    }
  }
}

// --------------------------------------------------------------------------
function SunSystem(options)
{
  this.resources = options.resources
  this.audioCache = options.audioCache
  this.levelDef = options.levelDef
  this.x = options.x;
  this.y = options.y;
  this.width = 160;
  this.height = 160;
  this.scene = {};
  this.planetsOrbitTime = 5.0 + Math.random();
  this.activePlanets = 0;
  this.timeToSpawnPlanet = 0.5 + Math.random()/2.0;
  this.addPlanetWithSound = false;
  this.activationPhase = 0;

  this.scene.sun = new MultiFrameAnimatedSprite({
    image: this.resources.getImage("sun"),
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    numberOfFrames: 2,
    updateRate: 0.18
  });
  this.scene.sun.setCurrentFrameIdx(1);


  this.isActive = function()
  {
    return this.activationPhase == 2;
  }

  this.instantActivate = function()
  {
    if (!this.isActive()) {
      this.scene.sun.setCurrentFrameIdx(0);
      for (var i = this.levelDef.planets.length; i > 0; i--) {
        planet = this.addNextPlanet();
        planet.mover.currMoveTime = this.timeToSpawnPlanet + i;
      }
    }
  }

  this.activate = function(withSound = false)
  {
    if (this.activationPhase == 0) {
      this.addPlanetWithSound = withSound;
      this.scene.sun.playLoop(3, true);
      this.activationPhase = 1;
    }
  }

  this.addNextPlanet = function()
  {
    addedObj = null;
    if (this.activePlanets < this.levelDef.planets.length) {
      imageKey = this.levelDef.planets[this.activePlanets].imageKey;
      this.scene[imageKey] = new OrbitPlanet({
        image: this.resources.getImage(imageKey),
        x: this.x + 148,
        y: this.y + 60,
        orbitTime : this.planetsOrbitTime,
        audio: this.audioCache[this.levelDef.planets[this.activePlanets].audioKey],
        play: this.addPlanetWithSound
      });
      addedObj = this.scene[imageKey];
      this.activePlanets += 1;
    }
    if (this.activePlanets == this.levelDef.planets.length) {
      this.activationPhase = 2;
    }
    return addedObj;
  }
  
  this.update = function(frameTime = 0) 
  {
    if (this.activationPhase == 1) {
      if (this.timeToSpawnPlanet < 0) {
        this.addNextPlanet();
        this.timeToSpawnPlanet = 1.0;
      }
      this.timeToSpawnPlanet -= frameTime;
    }
    for (var key in this.scene) {
      if (this.scene[key]) {
        if ("update" in this.scene[key]) {
          this.scene[key].update(frameTime);
        }
      }
    }
  }


  this.render = function(renderContext)
  {
    pScene = this.scene;
    var sortedScene = Object.keys(pScene).map(function(key) {
      if (key == "sun") {
        return [key, 1.0];
      }
      else {
        return [key, pScene[key].width / 45.0];
      }
    });
    sortedScene.sort(function(first, second) {
      return first[1] - second[1];
    });

    for (var i = 0; i < sortedScene.length; i++) {
      key = sortedScene[i][0];
      if ("render" in this.scene[key]) {
        this.scene[key].render(renderContext);
      }
    }
  }

}


