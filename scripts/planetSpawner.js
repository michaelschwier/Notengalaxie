function PlanetSpawner(minSpawnTime, images, audios, xPositions, yPosition, scene)
{
  this.minSpawnTime = minSpawnTime;
  this.timeSinceLastSpawn = 0.0;
  this.images = images;
  this.audios = audios;
  this.xPositions = xPositions;
  this.scene = scene;
  this.shuffledIndexList = []

  this.update = function(frameTime)
  {
    this.timeSinceLastSpawn += frameTime;
    if (!this.scene.planet || this.scene.planet.gone()) {
      if (this.timeSinceLastSpawn > this.minSpawnTime) {
        var choice = this.getRandomIndex();
        var img = this.images[choice];
        var audio = new Audio(this.audios[choice]);
        this.scene.planet = new Planet({
          image: img, 
          x: xPositions[choice],
          y: yPosition,
          audio: audio
        });
        this.timeSinceLastSpawn = 0;
      }
    }  
  }

  this.getRandomIndex = function()
  {
    if (this.shuffledIndexList.length <= 0) {
      this.shuffledIndexList = this.createShuffledIndexList(this.images.length);
    }
    return this.shuffledIndexList.pop();
  }

  this.createShuffledIndexList = function(size)
  {
    indexList = [];
    for (var n = 0; n < size; n++) {
      indexList.push(n);
    }
    var j, x, i;
    for (i = indexList.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = indexList[i];
      indexList[i] = indexList[j];
      indexList[j] = x;
    }
    return indexList;
  }
}