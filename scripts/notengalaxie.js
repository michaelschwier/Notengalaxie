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
    playerScore = 0;

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
        
        return new MainGamePhase(
          levelCreator.getScene(0)
        );
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
          this.scene[key].update(frameTime);
        }
      }
    }

    this.render = function()
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          this.scene[key].render(canvas.getContext("2d"));
        }
      }
    }

    this.getNextGamePhase = function()
    { 
      return this;
    }
  }
  
  // --------------------------------------------------------------------------
  function MainGamePhase(scene)
  {
    GamePhase.call(this, scene);
    this.minSpawnTime = 4.0;
    this.timeSinceLastSpawn = 0.0;
    this.audio = new Audio("audio/background.mp3");
    this.audio.volume = 1.0;
    this.audio.loop = true;
    this.audio.play();

    this.spawnPlanet = function()
    {
      if (!this.scene.planet || this.scene.planet.gone()) {
        if (this.timeSinceLastSpawn > this.minSpawnTime) {
          var choice = Math.floor(Math.random() * 3);
          var img = (choice != 0) ? ((choice == 1) ? "e" : "g") : "c1";
          var note = (choice != 0) ? ((choice == 1) ? "e" : "g") : "c";
          var audio = new Audio("audio/" + note + ".mp3");
          this.scene.planet = new Planet({
            image: resources.getImage(img), 
            x: 200 * choice,
            audio: audio
          });
          this.timeSinceLastSpawn = 0;
        }
      }
    }

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
          }
          else {
            //ship missed the planet
            this.scene.planet.setPassedState();
          }
        }
      }
    }

    this.super_update = this.update;
    this.update = function(frameTime)
    {
      this.timeSinceLastSpawn += frameTime;
      this.spawnPlanet();
      this.collisionDetection();

      this.super_update(frameTime);
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
  resources.addImage("ship", "images/ship_200x169x2.png");
  resources.addImage("bc", "images/c_200x160x2.png");
  resources.addImage("be", "images/e_200x160x2.png");
  resources.addImage("bg", "images/g_200x160x2.png");
  resources.addImage("c1", "images/planet-c1_200x200x1.png");
  resources.addImage("e", "images/planet-e_200x200x1.png");
  resources.addImage("g", "images/planet-g_200x200x1.png");
  resources.loadAndCallWhenDone(initGame);
} ());

