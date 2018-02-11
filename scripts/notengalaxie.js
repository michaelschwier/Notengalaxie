(function() {
  // ----- Global variables -------------------------------
  var lastTimeStamp = null;
  var resources;
  var canvas;
  var gamePhase;
  var playerScore = 0;

  
  // --------------------------------------------------------------------------
  function Ship(options)
  {
    Sprite.call(this, {
      context: canvas.getContext("2d"),
      width: 200,
      height: 200,
      image: resources.getImage("ship"),
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
  }
  
  
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
        document.getElementById("gameContainer").style.background="black";
      }
    }

    this.getNextGamePhase = function()
    {
      if (delayUntilGame < 0) 
      {
        var ship = new Ship({
        });
        
        return new MainGamePhase({
          ship: ship
        });
      }
      else {
        return this;
      }
    }
  }
  
  // --------------------------------------------------------------------------
  function GamePhase(scene) 
  {
    this.ship = scene.ship;

    this.handleMouseMove = function(e)
    { }

    this.handleMouseDown = function(e)
    { }
    
    this.update = function(frameTime = 0)
    { 
      this.ship.update(frameTime);
    }

    this.render = function()
    { 
      this.ship.render();
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

    this.handleMouseDown = function(e)
    { 
      this.ship.moveTo(e.canvasX - 100, e.canvasY - 100);
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
  
    gameLoop();
  }

  // --------------------------------------------------------------------------
  // START
  // --------------------------------------------------------------------------
  resources = new ResourcePreLoader();
  resources.addImage("ship", "images/ship_600x600x1.png");
  resources.loadAndCallWhenDone(initGame);
} ());

