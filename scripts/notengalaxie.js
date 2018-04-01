(function() {
  // ----- Global variables -------------------------------
  var lastTimeStamp = null;
  var resources;
  var canvas;
  var gamePhase;
  var levelCreator;
  var playerScore = 0;

  
  // --------------------------------------------------------------------------
  function handleMouseMove(e)
  {
    gamePhase.handleMouseMove(e);
  }

  function handleMouseDown(e)
  {
    var clientRect = canvas.getBoundingClientRect();
    x = e.clientX - clientRect.left;
    y = e.clientY - clientRect.top;
    x *= 600 / canvas.width;
    y *= 600 / canvas.height;
    e.canvasX = x;
    e.canvasY = y;
    gamePhase.handleMouseDown(e);
  }
  
  // --------------------------------------------------------------------------
  function IntroPhase(titleDelay = 10) {
    var delayUntilTitle = titleDelay;
    var delayUntilGame = 10 + delayUntilTitle;

    this.handleMouseMove = function(e)
    { }

    this.update = function(frameTime = 0)
    {
      delayUntilTitle -= 1;
      delayUntilGame -= 1;
    }

    this.render = function()
    {
      if (delayUntilTitle == 0) {
        document.getElementById("gameContainer").style.backgroundImage="url(\"images/title-02.png\")";
      }
      if (delayUntilGame == 0) {
        document.getElementById("gameContainer").style.backgroundImage="none"; 
        document.getElementById("gameContainer").style.background="white";
      }
    }

    this.getNextGamePhase = function()
    {
      if (delayUntilGame < 0) 
      {
        return new MainGamePhase(0);
      }
      else {
        return this;
      }
    }
  }
  
  // --------------------------------------------------------------------------
  function GamePhase(scene) 
  {
    this.scene = scene;

    this.handleMouseMove = function(e)
    { }

    this.handleMouseDown = function(e)
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          if ("handleMouseDown" in this.scene[key]) {
            this.scene[key].handleMouseDown(e);
          }
        }
      }
    }
    
    this.update = function(frameTime = 0)
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          if ("update" in this.scene[key]) {
            this.scene[key].update(frameTime);
          }
        }
      }
    }

    this.render = function()
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          if ("render" in this.scene[key]) {
            this.scene[key].render(canvas.getContext("2d"));
          }
        }
      }
    }

    this.getNextGamePhase = function()
    { 
      return this;
    }
  }
  
  // --------------------------------------------------------------------------
  function MainGamePhase(level)
  {
    this.level = level;
    GamePhase.call(this, levelCreator.getScene(this.level));
    playerScore = 0;

    this.collisionDetection = function()
    {
      if(this.scene.planet) {
        xDistToShip = Math.abs(this.scene.ship.x - this.scene.planet.x);
        yDistToShip = this.scene.ship.y - this.scene.planet.y;
        if (!this.scene.planet.hasPassed() && (yDistToShip < 50)) {
          if (this.scene.ship.isWaiting() && (xDistToShip == 0)) {
            //catch the planet
            this.scene.planet = null;
            this.scene.ship.blink();
            this.updatePlayerScore(1);
          }
          else {
            //ship missed the planet
            this.scene.planet.setPassedState();
            this.updatePlayerScore(-1);
          }
        }
      }
    }

    this.updatePlayerScore = function(increment) 
    {
      playerScore += increment;
      playerScore = playerScore < 0 ? 0 : playerScore;
      console.log(playerScore);
    }

    this.super_update = this.update;
    this.update = function(frameTime)
    {
      this.collisionDetection();

      this.super_update(frameTime);
    }

    this.getNextGamePhase = function()
    { 
      if (playerScore < 4) {
        return this;
      }
      else {
        return new MainGamePhase(this.level + 1);
      }
    }

  }

    
  // --------------------------------------------------------------------------
  function adjustCanvasSize()
  {
    var gameContainer = document.getElementById("gameContainer");
    var newSize = Math.min(gameContainer.offsetWidth, gameContainer.offsetHeight);
    var currSize = Math.min(canvas.width, canvas.height);

    if (newSize != currSize) {
      //console.log(gameContainer.offsetWidth, gameContainer.offsetHeight, canvas.width, canvas.height);
      canvas.width = newSize;
      canvas.height = newSize;
      newRelSize = newSize / 600.0;
      canvas.getContext("2d").setTransform(newRelSize, 0, 0, newRelSize, 0, 0);
      //console.log(gameContainer.offsetWidth, gameContainer.offsetHeight, canvas.width, canvas.height);
      //console.log("-------------------")
      }
  }
  
  // --------------------------------------------------------------------------
  function getPassedFrameTimeInSeconds(timeStamp)
  {
    if (!lastTimeStamp) {
      lastTimeStamp = timeStamp;
    }
    var timePassed = (timeStamp - lastTimeStamp) / 1000.0;
    lastTimeStamp = timeStamp;
    return timePassed;
  }
  
  // --------------------------------------------------------------------------
  function gameLoop(timeStamp) 
  {
    var timePassed = getPassedFrameTimeInSeconds(timeStamp);

    window.requestAnimationFrame(gameLoop);
    adjustCanvasSize();
    canvas.getContext("2d").clearRect(0, 0, 600, 600);

    gamePhase.update(timePassed);
    gamePhase.render();
    gamePhase = gamePhase.getNextGamePhase();
  }
  
  // --------------------------------------------------------------------------
  function initGame()
  {
    canvas = document.getElementById("gameCanvas");
    adjustCanvasSize();
    gamePhase = new IntroPhase();

    canvas.addEventListener("touchmove", handleMouseMove);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchstart", handleMouseDown);
    canvas.addEventListener("mousedown", handleMouseDown);

    levelCreator = new LevelCreator(levelDefinitions, resources)
  
    gameLoop();
  }

  // --------------------------------------------------------------------------
  // START
  // --------------------------------------------------------------------------
  resources = new ResourcePreLoader();
  resources.addImage("background", "images/background_600x1200x1.png")
  resources.addImage("notensystem", "images/notensystem_600x160x2.png")
  resources.addImage("ship", "images/ship_200x169x2.png");
  resources.addImage("bc1", "images/c1_45x45x2.png");
  resources.addImage("be", "images/e_45x45x2.png");
  resources.addImage("bg", "images/g_45x45x2.png");
  resources.addImage("c1", "images/planet-c1_200x200x1.png");
  resources.addImage("e", "images/planet-e_200x200x1.png");
  resources.addImage("g", "images/planet-g_200x200x1.png");
  resources.loadAndCallWhenDone(initGame);
} ());

