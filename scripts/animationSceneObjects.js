// --------------------------------------------------------------------------
function AnimationSequence(animationList, playBackgroundAudio = false)
{
  this.animationList = animationList;
  this.currAnimationIdx = 0;
  this.lastAnimationIdx = this.animationList.length - 1;
  if (playBackgroundAudio) {
    this.backgroundAudio = new AudioCrossfadeLooper({
      audioFileName: "audio/background.mp3",
      fadeStart: 8.5,
      fadeDuration: 0.5
    });
  }

  this.append = function(animation)
  {
    this.animationList.push(animation);
    this.lastAnimationIdx += 1;
  }

  this.handleMouseDown = function(e)
  {
    this.animationList[this.currAnimationIdx].handleMouseDown(e)
  }
  
  this.update = function(frameTime = 0)
  {
    if (this.animationList[this.currAnimationIdx].isDone() &&
        (this.currAnimationIdx < this.lastAnimationIdx)) {
      this.currAnimationIdx += 1;
    }
    this.animationList[this.currAnimationIdx].update(frameTime);
    if (this.backgroundAudio) {
      this.backgroundAudio.update(frameTime)
    }
  }

  this.render = function(renderContext)
  {
    this.animationList[this.currAnimationIdx].render(renderContext);
  }

  this.isDone = function()
  {
    if (this.currAnimationIdx >= this.lastAnimationIdx) {
      return this.animationList[this.currAnimationIdx].isDone();
    }
    else {
      return false;
    }
  }
}

// --------------------------------------------------------------------------
function PortrashTalks(speechBubbleIds, resources)
{
  this.speechBubbles = [];
  for (var i = 0; i < speechBubbleIds.length; i++)  {
    speechBubble = new Sprite({
      image: resources.getImage(speechBubbleIds[i]),
      x: 280,
      y: 0
    });
    this.speechBubbles.push(speechBubble)
  }
  this.lastSpeechBubbleIdx = this.speechBubbles.length - 1
  this.currSpeechBubbleIdx = 0;
  this.timePerSpeechBubble = 20;
  this.timePassed = 0;
  this.blinkDelay = 0;

  this.portcrash = new MultiFrameAnimatedSprite({
    image: resources.getImage("portcrashExplain"),
    x: 0,
    y: 350,
    numberOfFrames: 2,
    updateRate: 0.1  
  });

  this.blink = function(frameTime)
  {
    if (this.blinkDelay < 0) {
      this.portcrash.play(true);
      this.blinkDelay = 1.0 + Math.random() * 2;
    }
    else {
      this.blinkDelay -= frameTime;
    } 
  }

  this.advanceSpeechBubble = function()
  {
    if ((this.timePassed >= this.timePerSpeechBubble) && 
        (this.currSpeechBubbleIdx < this.lastSpeechBubbleIdx)) {
      this.timePassed = 0;
      this.currSpeechBubbleIdx += 1;
    }
  }

  this.handleMouseDown = function(e)
  {
    this.timePassed = this.timePerSpeechBubble;
  }
  
  this.update = function(frameTime = 0)
  {
    this.timePassed += frameTime;
    this.blink(frameTime);
    this.portcrash.update(frameTime);
    this.advanceSpeechBubble();
    this.speechBubbles[this.currSpeechBubbleIdx].update(frameTime);
  }

  this.render = function(renderContext)
  {
    this.portcrash.render(renderContext);
    this.speechBubbles[this.currSpeechBubbleIdx].render(renderContext);
  }

  this.isDone = function()
  {
    if ((this.timePassed >= this.timePerSpeechBubble) && 
        (this.currSpeechBubbleIdx >= this.lastSpeechBubbleIdx)) {
      return true;
    }
    else {
      return false;
    }
  }
}

// --------------------------------------------------------------------------
function Countdown(resources)
{
  this.timePassed = 0;
  this.countdown = new MultiFrameAnimatedSprite({
    image: resources.getImage("countdown"),
    x: 0,
    y: 100,
    numberOfFrames: 3,
    updateRate: 1.0
  });
  this.countdown.play();

  this.handleMouseDown = function(e)
  {
  }
  
  this.update = function(frameTime = 0)
  {
    this.timePassed += frameTime;
    this.countdown.update(frameTime);
  }

  this.render = function(renderContext)
  {
    this.countdown.render(renderContext);
  }

  this.isDone = function()
  {
    if (this.timePassed >= 3) {
      return true;
    }
    else {
      return false;
    }
  }
}

// --------------------------------------------------------------------------
function HamsterToken(resources)
{
  this.timePassed = 0;
  this.hamster = new MultiFrameAnimatedSprite({
    image: resources.getImage("hamsterToken"),
    x: 0,
    y: 100,
    numberOfFrames: 2,
    updateRate: 0.25
  });
  this.hamster.playLoop(4, true);

  this.handleMouseDown = function(e)
  {
  }
  
  this.update = function(frameTime = 0)
  {
    this.timePassed += frameTime;
    this.hamster.update(frameTime);
  }

  this.render = function(renderContext)
  {
    this.hamster.render(renderContext);
  }

  this.isDone = function()
  {
    if (this.timePassed >= 4) {
      return true;
    }
    else {
      return false;
    }
  }
}

// --------------------------------------------------------------------------
function HamsterDriveStatus(finishedLevel, resources)
{
  this.timePassed = 0;
  this.title = new Sprite({
    image: resources.getImage("hamsterdriveTitle"),
    x: 230,
    y: 50,
  });
  this.units = [];
  for (i = 0; i < 10; i++) {
    this.units[i] = new MultiFrameAnimatedSprite({
      image: resources.getImage("hamsterDriveUnit"),
      x: 350,
      y: 850 - i * 83,
      numberOfFrames: 2,
      updateRate: 0.25
    });
    if (i < finishedLevel) {
      this.units[i].setCurrentFrameIdx(1);
    }
  }
  this.units[finishedLevel].playLoop(6);

  this.handleMouseDown = function(e)
  {
  }
  
  this.update = function(frameTime = 0)
  {
    this.timePassed += frameTime;
    this.title.update(frameTime);
    for (i = 0; i < 10; i++) {
      this.units[i].update(frameTime);
    }
  }

  this.render = function(renderContext)
  {
    this.title.render(renderContext);
    for (i = 0; i < 10; i++) {
      this.units[i].render(renderContext);
    }
  }

  this.isDone = function()
  {
    if (this.timePassed >= 6) {
      return true;
    }
    else {
      return false;
    }
  }
}

