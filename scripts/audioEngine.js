  // --------------------------------------------------------------------------
  function AudioCrossfadeLooper(options)
  {
    this.audio = [];
    this.audio[0] = new Howl({src: [options.audioFileName]});
    this.audio[1] = new Howl({src: [options.audioFileName]});
    this.fadeStart = options.fadeStart;
    this.fadeDuration = options.fadeDuration * 1000;
    this.currAudioIdx = 0;
    this.mainAudioId = this.audio[this.currAudioIdx].play();

    this.update = function(frameTime)
    {
      currAudio = this.audio[this.currAudioIdx];
      otherAudio = this.audio[1 - this.currAudioIdx];
      if (currAudio.seek(this.mainAudioId) > this.fadeStart) {
        currAudio.fade(1.0, 0.0, this.fadeDuration, this.mainAudioId);
        otherAudio.volume(0.0);
        this.mainAudioId = otherAudio.play();
        otherAudio.fade(0.0, 1.0, this.fadeDuration, this.mainAudioId);
        this.currAudioIdx = 1 - this.currAudioIdx;
      }
    }

    this.stop = function()
    {
      this.audio[0].stop();
      this.audio[1].stop();
    }
  }

