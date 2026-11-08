const gameAudio = {
  audioContext: null,
  mainVolume: null,
  loadedSounds: {},
  soundsLoaded: null,
  musicPlayer: null,
  musicRequestNumber: 0,
  muted: false,

  unlockAudio() {
    // Create and resume audio directly inside the first user interaction.
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.mainVolume = this.audioContext.createGain();
      this.setMuted(this.muted);
      this.mainVolume.connect(this.audioContext.destination);
      this.soundsLoaded = Promise.all(Object.entries(CONFIG.audio.files).map(async ([name, path]) => {
        // One missing file must not interrupt loading the other sounds.
        try {
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`Unable to load audio: ${path}`);
          }
          this.loadedSounds[name] = await this.audioContext.decodeAudioData(await response.arrayBuffer());
        } catch (error) {
          console.warn(`Unable to load audio: ${path}`, error);
        }
      }));
    }
    return this.resume();
  },

  async playMusic() {
    this.stopMusic();
    const currentRequestNumber = this.musicRequestNumber;
    await this.soundsLoaded;
    // A finished run must not start music when loading completes later.
    if (currentRequestNumber !== this.musicRequestNumber || !this.loadedSounds.music) {
      return;
    }
    this.musicPlayer = this.audioContext.createBufferSource();
    this.musicPlayer.buffer = this.loadedSounds.music;
    this.musicPlayer.loop = true;
    this.musicPlayer.connect(this.mainVolume);
    this.musicPlayer.start();
  },

  stopMusic() {
    this.musicRequestNumber += 1;
    if (this.musicPlayer) {
      this.musicPlayer.stop();
      this.musicPlayer.disconnect();
      this.musicPlayer = null;
    }
  },

  async playSound(name) {
    await this.soundsLoaded;
    if (!this.loadedSounds[name]) {
      return;
    }
    const soundPlayer = this.audioContext.createBufferSource();
    soundPlayer.buffer = this.loadedSounds[name];
    soundPlayer.connect(this.mainVolume);
    soundPlayer.onended = () => soundPlayer.disconnect();
    soundPlayer.start();
  },

  setMuted(muted) {
    this.muted = muted;
    if (this.mainVolume) {
      this.mainVolume.gain.value = muted ? CONFIG.audio.mutedVolume : CONFIG.audio.volume;
    }
  },

  suspend() {
    if (this.audioContext) {
      return this.audioContext.suspend().catch((error) => console.warn('Unable to pause audio.', error));
    }
  },

  resume() {
    if (this.audioContext) {
      return this.audioContext.resume().catch((error) => console.warn('Unable to resume audio.', error));
    }
  }
};
