import Phaser from 'phaser';

export class SoundManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private backgroundMusic?: Phaser.Sound.BaseSound;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
  }

  public playSound(soundKey: string, config?: Phaser.Types.Sound.SoundConfig): void {
    // Audio disabled - no action
  }

  public playMusic(musicKey: string = 'background_music'): void {
    // Audio disabled - no action
  }


  public stopMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = undefined;
    }
  }

  public pauseMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  public resumeMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.resume();
    }
  }

  // Arcade sound effects using Web Audio API
  public playArcadeSound(soundType: 'shoot' | 'hit' | 'explosion' | 'powerup' | 'gameover' | 'victory' | 'boss_hit'): void {
    // Audio disabled - no action
  }


  public setMusicVolume(volume: number): void {
    if (this.backgroundMusic && 'setVolume' in this.backgroundMusic) {
      (this.backgroundMusic as any).setVolume(volume);
    }
  }

  public setSFXVolume(volume: number): void {
    // SFX volume is handled per sound in playArcadeSound
  }

  public setMuted(muted: boolean): void {
    if (muted) {
      this.stopMusic();
    }
  }

  public toggleMute(): void {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.pauseMusic();
    } else {
      this.resumeMusic();
    }
  }

  public getMusicVolume(): number {
    return this.backgroundMusic && 'volume' in this.backgroundMusic ? (this.backgroundMusic as any).volume : 0;
  }

  public getSFXVolume(): number {
    return 0.1; // Default SFX volume
  }

  public isMusicMuted(): boolean {
    return this.backgroundMusic ? !this.backgroundMusic.isPlaying : true;
  }

  public destroy(): void {
    this.removeAllListeners();
  }
}