(function() {
  // ----- Global variables -------------------------------
  var lastTimeStamp = null;
  var resources;
  var canvas;
  var gamePhase;
  var levelCreator;

  
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
    x *= canvas.width / clientRect.width;
    y *= canvas.height / clientRect.height;
    e.canvasX = x;
    e.canvasY = y;
    gamePhase.handleMouseDown(e);
  }
  
  // --------------------------------------------------------------------------
  function IntroPhase(titleDelay = 120/*120*/) {
    var delayUntilTitle = titleDelay;
    var startGame = false;
    document.getElementById("gameContainer").style.backgroundColor="white";
    document.getElementById("gameContainer").style.backgroundImage="url(\"images/title-01.png\")"; 

    this.handleMouseMove = function(e)
    { }

    this.handleMouseDown = function(e)
    { 
      if (delayUntilTitle < 0) {
        document.getElementById("gameContainer").style.backgroundImage="none"; 
        startGame = true;
      }
    }

    this.update = function(frameTime = 0)
    {
      delayUntilTitle -= 1;
    }

    this.render = function()
    {
      if (delayUntilTitle == 0) {
        document.getElementById("gameContainer").style.backgroundImage="url(\"images/title-02.png\")";
      }
    }

    this.getNextGamePhase = function()
    {
      if (startGame) 
      {
        return new ExplainPhase();
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
            this.scene.scoreBar.updateScore(1);
          }
          else {
            //ship missed the planet
            this.scene.planet.setPassedState();
            this.scene.scoreBar.updateScore(-1);
          }
        }
      }
    }

    this.super_update = this.update;
    this.update = function(frameTime)
    {
      this.collisionDetection();

      this.super_update(frameTime);
    }

    this.getNextGamePhase = function()
    { 
      if (this.scene.scoreBar.isMax()) {
        if (this.level == 4) {
          this.scene.backgroundAudio.stop();
          return new MidgameMotivationPhase();
        }
        else if (this.level == 8) {
          this.scene.backgroundAudio.stop();
          return new LastLevelMotivationPhase();
        }
        else {
          return new GameStatusPhase(this.level, this.level + 1);
        }
      }
      else if (this.scene.scoreBar.isEmpty()) {
        return new GameStatusPhase(this.level, this.level);
      }
      else {
        return this;
      }
    }

  }
   
  // --------------------------------------------------------------------------
  function ExplainPhase()
  {
    document.getElementById("gameContainer").style.backgroundColor="white";
    var scene = {};
    portcrash = new PortrashTalks(
      ["explain01", "explain02", "explain03", "explain04", "explain05", "explain06"],
      resources);
    countdown = new Countdown(resources);
    scene.animationSequence = new AnimationSequence([portcrash, countdown])
    GamePhase.call(this, scene);

    this.getNextGamePhase = function()
    { 
      if (scene.animationSequence.isDone()) {
        return new GameStatusPhase(-1, 0);
      }
      else {
        return this;
      }
    }

  }

  // --------------------------------------------------------------------------
  function MidgameMotivationPhase()
  {
    document.getElementById("gameContainer").style.backgroundColor="white";
    var scene = {};
    scene.portcrash = new PortrashTalks(
      ["motivate01"],
      resources);
    GamePhase.call(this, scene);

    this.getNextGamePhase = function()
    { 
      if (scene.portcrash.isDone()) {
        return new GameStatusPhase(4, 5);
      }
      else {
        return this;
      }
    }

  }
  
  // --------------------------------------------------------------------------
  function LastLevelMotivationPhase()
  {
    document.getElementById("gameContainer").style.backgroundColor="white";
    var scene = {};
    scene.portcrash = new PortrashTalks(
      ["motivate02"],
      resources);
    GamePhase.call(this, scene);

    this.getNextGamePhase = function()
    { 
      if (scene.portcrash.isDone()) {
        return new GameStatusPhase(8, 9);
      }
      else {
        return this;
      }
    }

  }
  
  // --------------------------------------------------------------------------
  function FinishedMotivationPhase()
  {
    document.getElementById("gameContainer").style.backgroundColor="white";
    var scene = {};
    scene.portcrash = new PortrashTalks(
      ["motivate03", "motivate04"],
      resources);
    GamePhase.call(this, scene);

    this.getNextGamePhase = function()
    { 
      if (scene.portcrash.isDone()) {
        return new IntroPhase;
      }
      else {
        return this;
      }
    }

  }
  
  // --------------------------------------------------------------------------
  function GameStatusPhase(currLevel, nextLevel)
  {
    document.getElementById("gameContainer").style.backgroundColor="black";
    this.currLevel = currLevel;
    this.nextLevel = nextLevel;
    this.animationPhase = (nextLevel - currLevel) * 2;
    this.waitTime = 0;
    GamePhase.call(this, gameStatusCreator.getScene(this.currLevel, this.nextLevel));
    animationDone = false;
    startLevel = false;

    this.wait = function(waitTime, startCondition = true)
    {
      if (startCondition) {
        this.waitTime = waitTime;
        this.animationPhase += 1;
      }
    }

    this.waitedEnough = function(frameTime) {
      this.waitTime -= frameTime;
      return this.waitTime <= 0;
    }
    
    this.animate = function(frameTime)
    {
      switch(this.animationPhase) {
        case 0:
          if (nextLevel == 0) {
            this.wait(1.0, this.scene.ship.isWaiting());
          }
          else {
            this.wait(1.0, this.scene.ship.isWaiting() && this.scene["sun"+(this.nextLevel-1)].isActive());
          }
          break;
        case 1:
          if (this.waitedEnough(frameTime)) {
            nextLevelPos = gameStatusCreator.getShipPosition(this.nextLevel);
            prevLevelPos = gameStatusCreator.getShipPosition(this.nextLevel - 1);
            this.scene.ship.moveTo(prevLevelPos.x + Math.floor((nextLevelPos.x - prevLevelPos.x) / 3),
                                   prevLevelPos.y + Math.floor((nextLevelPos.y - prevLevelPos.y) / 3))
            this.animationPhase += 1;
          }
          break;
        case 2:
          if (nextLevel == 0) {
            this.wait(1.0, this.scene.ship.isWaiting());
          }
          else {
            this.wait(1.0, this.scene.ship.isWaiting() && this.scene["sun"+(this.nextLevel-1)].isActive());
          }
          break;
        case 3:
          if (this.waitedEnough(frameTime)) {
            if (nextLevel < levelDefinitions.length) {
              nextLevelPos = gameStatusCreator.getShipPosition(this.nextLevel);
              this.scene.ship.moveTo(nextLevelPos.x, nextLevelPos.y);
              this.animationPhase += 1;
            }
            else {
              this.animationPhase = 11;
            }
          }
          break;
        case 4:
          this.wait(0.2, this.scene.ship.isWaiting());
          break;
        case 5:
          if (this.waitedEnough(frameTime)) {
            this.scene["sun"+this.nextLevel].activate(true);
            this.animationPhase +=1;
          }
          break;
        case 6:
          if (this.scene["sun"+this.nextLevel].isActive()) {
            this.animationPhase +=1;
          }
          break;
        case 7:
          this.wait(1.0, this.scene.ship.isWaiting());
          break;
        case 8:
          if (this.waitedEnough(frameTime)) {
            animationDone = true;
            this.animationPhase +=1;
          }
          break;
        case 9:
          this.wait(6.0, true);
          break;
        case 10:
          if (this.waitedEnough(frameTime)) {
            startLevel = true;
          }
          break;
        // finished animation
        case 11:
          this.wait(0.2, this.scene.ship.isWaiting());
          break;
        case 12:
          if (this.waitedEnough(frameTime)) {
            this.scene.finish.setCurrentFrameIdx(1);
            this.scene.finishBlink.setCurrentFrameIdx(1);
            this.scene.finishBlink.playLoop();
            this.animationPhase +=1;
          }
          break;
        case 13:
          this.wait(1.0, this.scene.ship.isWaiting());
          break;
        case 14:
          if (this.waitedEnough(frameTime)) {
            nextLevelPos = gameStatusCreator.getShipPosition(levelDefinitions.length);
            this.scene.ship.moveTo(nextLevelPos.x, nextLevelPos.y);
            this.animationPhase += 1;
          }
          break;
        case 15:
          this.wait(1.0, this.scene.ship.isWaiting());
          break;
        case 16:
          if (this.waitedEnough(frameTime)) {
            animationDone = true;
            this.animationPhase +=1;
          }
          break;
        case 17:
          this.wait(6.0, true);
          break;
        case 18:
          if (this.waitedEnough(frameTime)) {
            startLevel = true;
          }
          break;
        default:
          break;
      }
      return;
    }

    this.handleMouseDown = function(e)
    {
      if (animationDone) {
        startLevel = true;
      }
    }

    this.super_update = this.update;
    this.update = function(frameTime)
    {
      this.animate(frameTime);
      this.super_update(frameTime);
    }


    this.getNextGamePhase = function()
    { 
      if (startLevel) {
        if (nextLevel < levelDefinitions.length) {
          return new MainGamePhase(this.nextLevel);
        }
        else {
          this.scene.backgroundAudio.stop();
          return new FinishedMotivationPhase();
        }
      }
      else {
        return this;
      }
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
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    gamePhase.update(timePassed);
    gamePhase.render();
    gamePhase = gamePhase.getNextGamePhase();
  }
  
  // --------------------------------------------------------------------------
  function initGame()
  {
    canvas = document.getElementById("gameCanvas");
    canvas.width = 800;
    canvas.height = 1000;

    gamePhase = new IntroPhase();

    canvas.addEventListener("touchmove", handleMouseMove);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchstart", handleMouseDown);
    canvas.addEventListener("mousedown", handleMouseDown);

    levelCreator = new LevelCreator(levelDefinitions, resources)
    gameStatusCreator = new GameStatusCreator(levelDefinitions, resources)
  
    gameLoop();
  }

  // --------------------------------------------------------------------------
  // START
  // --------------------------------------------------------------------------
  resources = new ResourcePreLoader();
  resources.addImage("hamster", "images/hamster_100x74x2.png")  
  resources.addImage("button", "images/button_200x149x2.png")
  resources.addImage("ship", "images/ship_200x169x2.png");
  resources.addImage("bc1", "images/c1_45x45x2.png");
  resources.addImage("bd", "images/d_45x45x2.png");
  resources.addImage("be", "images/e_45x45x2.png");
  resources.addImage("bf", "images/f_45x45x2.png");
  resources.addImage("bg", "images/g_45x45x2.png");
  resources.addImage("ba", "images/a_45x45x2.png");
  resources.addImage("bh", "images/h_45x45x2.png");
  resources.addImage("bc2", "images/c2_45x45x2.png");
  resources.addImage("c1", "images/planet-c1_200x200x1.png");
  resources.addImage("d", "images/planet-d_200x200x1.png");
  resources.addImage("e", "images/planet-e_200x200x1.png");
  resources.addImage("f", "images/planet-f_200x200x1.png");
  resources.addImage("g", "images/planet-g_200x200x1.png");
  resources.addImage("a", "images/planet-a_200x200x1.png");
  resources.addImage("h", "images/planet-h_200x200x1.png");
  resources.addImage("c2", "images/planet-c2_200x200x1.png");
  resources.addImage("statusPath", "images/status-path_800x1000x1.png");
  resources.addImage("sun", "images/sun_200x200x2.png");
  resources.addImage("start", "images/start-level_200x200x1.png");
  resources.addImage("finish", "images/pokal_200x200x2.png");
  resources.addImage("finishBlink", "images/pokal-blink_200x200x2.png");
  resources.addImage("portcrashExplain", "images/portcrash_400x650x2.png");
  resources.addImage("explain01", "images/Blase01_800x800x1.png");
  resources.addImage("explain02", "images/Blase02_800x800x1.png");
  resources.addImage("explain03", "images/Blase03_800x800x1.png");
  resources.addImage("explain04", "images/Blase04_800x800x1.png");
  resources.addImage("explain05", "images/Blase04a_500x500x1.png");
  resources.addImage("explain06", "images/Blase05_800x800x1.png");
  resources.addImage("motivate01", "images/Blase06_500x500x1.png");
  resources.addImage("motivate02", "images/Blase07_500x500x1.png");
  resources.addImage("motivate03", "images/Blase08_500x500x1.png");
  resources.addImage("motivate04", "images/Blase09_500x500x1.png");
  resources.addImage("countdown", "images/countdown_800x800x3.png");
  resources.loadAndCallWhenDone(initGame);
} ());

