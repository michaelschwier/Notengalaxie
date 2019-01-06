function GameStatusCreator(levelDefinitions, resources)
{
  this.getGridPositions = function(rows, columns, cellWidth, cellHeight)
  {
    offsetX = Math.floor((800 - columns * cellWidth) / (columns + 1));
    offsetY = Math.floor((1000 - rows * cellHeight) / (rows + 1));
    positions = []
    xInc = offsetX + cellWidth;
    yInc = offsetY + cellHeight;
    xPos = offsetX;
    yPos = 1000 - yInc;
    for (var i = 0; i < rows * columns; i++) {
      pos = {}
      pos.x = xPos;
      pos.y = yPos;
      positions.push(pos)
      if (xPos + xInc > 800 - xInc || xPos + xInc < 0) {
        yPos -= yInc
        xInc = -xInc
      }
      else {
        xPos += xInc;
      }
    }
    return positions
  }

  this.levelDefinitions = levelDefinitions;
  this.resources = resources;
  this.gridPositions = this.getGridPositions(4, 3, 160, 160)

  this.getScene = function(curLevelIdx, nextLevelIdx)
  {
    if (curLevelIdx >= this.levelDefinitions.length) {
      curLevelIdx = this.levelDefinitions.length;
    }
    var scene = {};
    this.addBackgroundObjectsToScene(scene);
    this.addStartToScene(scene);
    this.addSunSystemsToScene(scene, nextLevelIdx);
    this.addShipToScene(scene, curLevelIdx);
    this.addFinishToScene(scene)
    return scene;
  }

  this.addBackgroundObjectsToScene = function(scene)
  {
    scene.background = new Sprite({
      image: this.resources.getImage("statusPath")
    });
    scene.backgroundAudio = new AudioCrossfadeLooper({
      audioFileName: "audio/background.mp3",
      fadeStart: 8.5,
      fadeDuration: 0.5
    });
  }

  this.addStartToScene = function(scene)
  {
    pos = this.gridPositions[0];
    scene.startFlag = new Sprite({
      image: this.resources.getImage("start"),
      x: pos.x,
      y: pos.y,
      width: 160,
      height: 160
    });
  }

  this.addFinishToScene = function(scene)
  {
    pos = this.getLevelPosition(this.levelDefinitions.length);
    scene.finish = new MultiFrameSprite({
      image: this.resources.getImage("finish"),
      x: pos.x,
      y: pos.y,
      width: 160,
      height: 160,
      numberOfFrames: 2
    });
    scene.finishBlink = new MultiFrameAnimatedSprite({
      image: this.resources.getImage("finishBlink"),
      x: pos.x,
      y: pos.y,
      width: 160,
      height: 160,
      numberOfFrames: 2,
      updateRate: 0.18  
    });
  }


  this.addShipToScene = function(scene, levelIdx)
  {
    shipPos = this.getShipPosition(levelIdx);
    scene.ship = new Ship({
      image: this.resources.getImage("ship"),
      x: shipPos.x,
      y: shipPos.y,
      moveTime: 1.0
    });
    scene.ship.width = 133;
    scene.ship.height = 113;
  }

  this.addSunSystemsToScene = function(scene, nextLevelIdx)
  {
    for(var i = 0; i < this.levelDefinitions.length; i++) {
      levelPosition = this.getLevelPosition(i);
      objKey = "sun" + i
      scene[objKey] = new SunSystem({
        resources: this.resources,
        levelDef: this.levelDefinitions[i],
        x: levelPosition.x,
        y: levelPosition.y
      });
      if (i < nextLevelIdx) {
        scene[objKey].instantActivate();
      }
    }
  }

  this.getLevelPosition = function(levelIdx) 
  {
    return this.gridPositions[levelIdx + 1];
  }

  this.getShipPosition = function(levelIdx) 
  {
    pos = this.getLevelPosition(levelIdx);
    shipPos = {}
    shipPos.x = pos.x + 13;
    shipPos.y = pos.y - 40;
    return shipPos;
  }

  this.getOffset = function() {
    noPlanetsPerRow = 3;
    return Math.floor((800 - noPlanetsPerRow * 160) / (noPlanetsPerRow + 1));
  }

}
