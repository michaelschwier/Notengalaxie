function LevelCreator(levelDefinitions, resources, audioCache)
{
  this.levelDefinitions = levelDefinitions;
  this.resources = resources;
  this.audioCache = audioCache;

  this.getScene = function(levelIdx)
  {
    if (levelIdx >= this.levelDefinitions.length) {
      levelIdx = 0
    }
    var scene = {};
    this.addDefaultObjectsToScene(scene, levelIdx);
    this.addButtonsToScene(scene, levelIdx);
    this.addPlanetSpawner(scene, levelIdx);
    return scene;
  }

  this.addDefaultObjectsToScene = function(scene, levelIdx)
  {
    scene.backgroundAudio = new AudioCrossfadeLooper({
      audioFileName: "audio/background.mp3",
      fadeStart: 8.5,
      fadeDuration: 0.5
    });
    scene.planet = null;
    scene.scoreBar = new ScoreBar({
      image: this.resources.getImage("hamster")
    });
    scene.ship = new Ship({
      image: this.resources.getImage("ship"),
      x: this.getObjectPositionX(levelIdx, 0)
    });
  }

  this.addButtonsToScene = function(scene, levelIdx)
  {
    levelDef = this.levelDefinitions[levelIdx];
    noButtons = levelDef.planets.length;
    for (var i = 0; i < noButtons; i++) {
      buttonKey = "button" + i;
      overlayImageKey = "b" + levelDef.planets[i].imageKey
      buttonWidth = 200;
      buttonHeight = 149;
      buttonX = this.getObjectPositionX(levelIdx, i);
      scene[buttonKey] = new NavigationButton({
        image: this.resources.getImage("button"),
        overlayImage: this.resources.getImage(overlayImageKey),
        overlayX: buttonX + 90,
        overlayY: 840 + this.getButtonOverlayOffsetY(overlayImageKey),
        x: buttonX,
        y: 840,
        width: buttonWidth,
        height: buttonHeight,
        clickAreaY: 650,
        clickAreaHeigth: 340
        }, 
        new MoveToCommand(scene.ship, this.getObjectPositionX(levelIdx, i), 650)
      );
    }
  }

  this.addPlanetSpawner = function(scene, levelIdx)
  {
    levelDef = levelDefinitions[levelIdx];
    minSpawnTime = levelDef.minSpawnTime;
    yPosition = -500 - (levelIdx * 100);
    images = [];
    audios = [];
    xPositions = [];
    for (var i = 0; i < levelDef.planets.length; i++) {
      images.push(this.resources.getImage(levelDef.planets[i].imageKey));
      audios.push(this.audioCache[levelDef.planets[i].audioKey]);
      xPositions.push(this.getObjectPositionX(levelIdx, i));
    }
    scene.planetSpawner = new PlanetSpawner(minSpawnTime, images, audios, xPositions, yPosition, scene);
  }

  this.getObjectPositionX = function(levelIdx, planetIdx)
  {
    levelDef = this.levelDefinitions[levelIdx];
    noPlanets = levelDef.planets.length;
    offset = Math.floor((800 - noPlanets * 200) / (noPlanets + 1));
    return offset + planetIdx * (offset + 200);
  }

  this.getButtonOverlayOffsetY = function(overlayImageKey)
  {
    switch(overlayImageKey) {
      case "bc1":
        return 95;
        break;
      case "bd":
        return 86;
        break;
      case "be":
        return 78;
        break;
      case "bf":
        return 67;
        break;
      case "bg":
        return 59;
        break;
      case "ba":
        return 50;
        break;
      case "bh":
        return 43;
        break;
      case "bc2":
        return 34;
        break;
      default:
        return 0;
    }
  }

}



