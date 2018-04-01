function LevelCreator(levelDefinitions, resources)
{
  this.levelDefinitions = levelDefinitions
  this.resources = resources

  this.getScene = function(levelIdx)
  {
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
    scene.background = new Sprite({
      image: this.resources.getImage("background"),
    });
    scene.scoreBar = new ScoreBar({
      image: this.resources.getImage("hamster")
    });
    scene.planet = null;
    scene.ship = new Ship({
      image: this.resources.getImage("ship"),
      x: this.getObjectOffsetX(levelIdx)
    });
  }

  this.addButtonsToScene = function(scene, levelIdx)
  {
    levelDef = this.levelDefinitions[levelIdx];
    noButtons = levelDef.planets.length;
    for (var i = 0; i < noButtons; i++) {
      buttonKey = "button" + i;
      overlayImageKey = "b" + levelDef.planets[i].imageKey
      buttonWidth = this.getButtonWidth(levelIdx);
      buttonX = 2 + i * buttonWidth;
      scene[buttonKey] = new NavigationButton({
        image: this.resources.getImage("notensystem"),
        overlayImage: this.resources.getImage(overlayImageKey),
        overlayX: buttonX + this.getButtonOverlayOffsetX(buttonWidth, i),
        overlayY: 440 + this.getButtonOverlayOffsetY(overlayImageKey),
        x: buttonX,
        y: 440,
        width: buttonWidth -4,
        height: 160
        }, 
        new MoveToCommand(scene.ship, this.getObjectPositionX(levelIdx, i), 250)
      );
    }
  }

  this.addPlanetSpawner = function(scene, levelIdx)
  {
    levelDef = levelDefinitions[levelIdx];
    minSpawnTime = levelDef.minSpawnTime;
    images = [];
    audios = [];
    xPositions = [];
    for (var i = 0; i < levelDef.planets.length; i++) {
      images.push(this.resources.getImage(levelDef.planets[i].imageKey));
      audios.push("audio/" + levelDef.planets[i].audioKey + ".mp3");
      xPositions.push(this.getObjectPositionX(levelIdx, i));
    }
    scene.planetSpawner = new PlanetSpawner(minSpawnTime, images, audios, xPositions, scene);
  }

  this.getObjectPositionX = function(levelIdx, planetIdx)
  {
    return planetIdx * this.getButtonWidth(levelIdx) + this.getObjectOffsetX(levelIdx)
  }

  this.getObjectOffsetX = function(levelIdx)
  {
    return (this.getButtonWidth(levelIdx) - 200) / 2;
  }

  this.getButtonWidth = function(levelIdx)
  {
    levelDef = this.levelDefinitions[levelIdx];
    noButtons = levelDef.planets.length;
    return 600 / noButtons;
  }

  this.getButtonOverlayOffsetY = function(overlayImageKey)
  {
    switch(overlayImageKey) {
      case "bc1":
        return 105;
        break;
      case "be":
        return 85;
        break;
      case "bg":
        return 63;
        break;
      default:
        return 0;
    }
  }

  this.getButtonOverlayOffsetX = function(buttonWidth, posIdx)
  {
    if (posIdx > 0) {
      return ((buttonWidth - 4) / 2) - 23;
    }
    else {
      return 60 + ((buttonWidth - (60 + 4)) / 2) - 23;
    }
  }

}



