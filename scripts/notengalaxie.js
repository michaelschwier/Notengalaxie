(function() {
  // ----- Global variables -------------------------------
  var lastTimeStamp = null;
  var resources;
  var canvas;
  var gamePhase;
  var playerScore = 0;

  
  // --------------------------------------------------------------------------
  function Planet(options)
  {
    Sprite.call(this, {
      context: canvas.getContext("2d"),
      image: resources.getImage(options.image),
      x: options.x,
      y: -600
    })
    this.passedShip = false;
    this.mover = new ConstantMover(this, 2.5);
    this.mover.setNewTargetPos(this.x, 600);
    this.audio = new Audio("audio/test.mp3");
    this.audio.play();

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
      context: canvas.getContext("2d"),
      image: resources.getImage("ship"),
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
  function MoveToCommand(receiver, x, y) {
    this.receiver = receiver;
    this.x = x;
    this.y = y;

    this.execute = function()
    {
      this.receiver.moveTo(x, y);
    }
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
        var background = new Sprite({
          context: canvas.getContext("2d"),
          image: resources.getImage("background"),    
        });
        var ship = new Ship();
        var cButton = new Button({
          context: canvas.getContext("2d"),
          image: resources.getImage("bc"),
          x: 0,
          y: 450,
          width: 195,
          height: 150
          }, 
          new MoveToCommand(ship, 0, 250)
        );
        var eButton = new Button({
          context: canvas.getContext("2d"),
          image: resources.getImage("be"),
          x: 200,
          y: 450,
          width: 195,
          height: 150
          }, 
          new MoveToCommand(ship, 200, 250)
        );
        var gButton = new Button({
          context: canvas.getContext("2d"),
          image: resources.getImage("bg"),
          x: 400,
          y: 450,
          width: 195,
          height: 150
          }, 
          new MoveToCommand(ship, 400, 250)
        );
        
        return new MainGamePhase({
          background: background,
          ship: ship,
          cButton: cButton,
          eButton: eButton,
          gButton: gButton
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
    this.scene = scene;

    this.handleMouseMove = function(e)
    { }

    this.handleMouseDown = function(e)
    { 
      for (var key in this.scene) {
        if ("handleMouseDown" in this.scene[key]) {
          this.scene[key].handleMouseDown(e);
        }
      }
    }
    
    this.update = function(frameTime = 0)
    { 
      for (var key in this.scene) {
        this.scene[key].update(frameTime);
      }
    }

    this.render = function()
    { 
      for (var key in this.scene) {
        this.scene[key].render();
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
    this.audio = new Audio("audio/background.mp3");
    this.audio.volume = 0.6;
    this.audio.loop = true;
    this.audio.play();

    this.spawnPlanet = function()
    {
      if (!this.scene.planet || this.scene.planet.gone()) {
        var choice = Math.floor(Math.random() * 3);
        var img = (choice != 0) ? ((choice == 1) ? "e" : "g") : "c1";
        this.scene.planet = new Planet({image: img, x: 200 * choice});
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
            delete this.scene.planet;
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
  
    gameLoop();
  }

  // --------------------------------------------------------------------------
  // START
  // --------------------------------------------------------------------------
  resources = new ResourcePreLoader();
  resources.addImage("background", "images/background_600x600x1.png")
  resources.addImage("ship", "images/ship_200x169x1.png");
  resources.addImage("bc", "images/c_200x150x2.png");
  resources.addImage("be", "images/e_200x150x2.png");
  resources.addImage("bg", "images/g_200x150x2.png");
  resources.addImage("c1", "images/planet-c1_200x200x1.png");
  resources.addImage("e", "images/planet-e_200x200x1.png");
  resources.addImage("g", "images/planet-g_200x200x1.png");
  resources.loadAndCallWhenDone(initGame);
} ());

