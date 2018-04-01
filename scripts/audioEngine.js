  // --------------------------------------------------------------------------
  function AudioCrossfadeLooper(options)
  {
    this.audio = [];
    this.audio[0] = new Audio(options.audioFileName);
    this.audio[1] = new Audio(options.audioFileName);
    this.fadeStart = options.fadeStart;
    this.fadeDuration = options.fadeDuration;
    this.currAudioIdx = 0;
    this.audio[this.currAudioIdx].play();

    this.update = function(frameTime)
    {
      currAudio = this.audio[this.currAudioIdx]
      otherAudio = this.audio[1 - this.currAudioIdx]
      if (currAudio.currentTime > this.fadeStart) {
        fadeVolume = (currAudio.currentTime - this.fadeStart) / this.fadeDuration;
        if(fadeVolume < 1.0) {
          currAudio.volume = 1 - fadeVolume;
          otherAudio.volume = fadeVolume;
          if (otherAudio.paused) {
            otherAudio.play();
          }
        }
        else {
          currAudio.pause();
          currAudio.currentTime = 0.0;
          this.currAudioIdx = 1 - this.currAudioIdx;
        }
      }
    }
  }

