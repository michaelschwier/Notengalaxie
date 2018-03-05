function LevelCreator(levelDefinitions, resources)
{
  this.levelDefinitions = levelDefinitions
  this.resources = resources

  this.getScene = function (levelIdx)
  {
    var scene = {};
    this.addDefaultObjectsToScene(scene);
    this.addButtonsToScene(scene, levelIdx);
    return scene;
  }

  this.addDefaultObjectsToScene = function(scene)
  {
    scene.background = new ScrollSprite({
      image: this.resources.getImage("background"),
      height: 600,
      clipHeight: 600,
      loop: true,
      yScrollPerSec: -30
    });
    scene.planet = null;
    scene.ship = new Ship({
      image: this.resources.getImage("ship")
    });
  }

  this.addButtonsToScene = function(scene, levelIdx)
  {
    levelDef = levelDefinitions[levelIdx]
    for (var i = 0; i < levelDef.planets.length; i++) {
      buttonKey = "button" + i;
      scene[buttonKey] = new Button({
        image: this.resources.getImage(levelDef.planets[i].buttonKey),
        x: i * 200,
        y: 440,
        width: 195,
        height: 160
        }, 
        new MoveToCommand(scene.ship, i * 200, 250)
      );
    }
  }
}



