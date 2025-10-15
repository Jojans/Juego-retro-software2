import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';
import { LoadingScene } from './scenes/LoadingScene';
import { SoundManager } from './managers/SoundManager';

export class GameEngine extends Phaser.Events.EventEmitter {
  private game: Phaser.Game | null = null;
  private config: Phaser.Types.Core.GameConfig;
  private soundManager: SoundManager | null = null;

  constructor() {
    super();
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      backgroundColor: '#0a0e27',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      audio: {
        disableWebAudio: false,
        noAudio: false,
      },
      scene: [
        LoadingScene,
        GameScene,
        GameOverScene,
        VictoryScene,
      ],
      scale: {
        mode: Phaser.Scale.NONE,
        width: 800,
        height: 600,
      },
      render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
      },
    };
  }

  public init(): void {
    console.log('GameEngine: init() called');
    
    if (this.game) {
      console.log('GameEngine: Destroying existing game');
      this.destroy();
    }

    console.log('GameEngine: Creating new Phaser game');
    this.game = new Phaser.Game(this.config);
    
    // Create global sound manager
    console.log('GameEngine: Creating sound manager');
    this.soundManager = new SoundManager(this.game.scene.getScene('GameScene'));
    
    // Make sound manager available to all scenes
    console.log('GameEngine: Setting up sound manager for all scenes');
    this.game.scene.scenes.forEach(scene => {
      if (scene && scene.data) {
        scene.data.set('soundManager', this.soundManager);
      }
    });
    
    // Set up event forwarding from game to GameEngine
    console.log('GameEngine: Setting up event forwarding');
    this.setupEventForwarding();
    
    // Auto-start the game
    console.log('GameEngine: Auto-starting game');
    this.startGame();
  }

  private setupEventForwarding(): void {
    if (this.game) {
      // Forward game events to GameEngine
      this.game.events.on('player-hit', (lives: number) => {
        console.log('GameEngine: Received player-hit event from game, lives:', lives);
        this.emit('player-hit', lives);
        console.log('GameEngine: Emitted player-hit event to GamePage');
      });
      
      this.game.events.on('game-over', () => {
        console.log('GameEngine: Received game-over event from game');
        this.emit('game-over');
      });
      
      this.game.events.on('victory', () => {
        console.log('GameEngine: Received victory event from game');
        this.emit('victory');
      });
    }
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  public restartGame(): void {
    console.log('GameEngine: Restarting game...');
    this.destroy();
    this.init();
  }

  public getGame(): Phaser.Game | null {
    return this.game;
  }

  public startGame(): void {
    console.log('GameEngine: startGame() called');
    if (this.game) {
      console.log('GameEngine: Starting LoadingScene');
      this.game.scene.start('LoadingScene');
    } else {
      console.error('GameEngine: No game instance available');
    }
  }

  public isGameStarted(): boolean {
    if (this.game) {
      const gameScene = this.game.scene.getScene('GameScene');
      return gameScene !== null && gameScene.scene.isActive();
    }
    return false;
  }


  public showGameOver(score: number, level: number): void {
    if (this.game) {
      this.game.scene.start('GameOverScene', { score, level });
    }
  }

  public showVictory(score: number, level: number): void {
    if (this.game) {
      this.game.scene.start('VictoryScene', { score, level });
    }
  }

  public pauseGame(): void {
    if (this.game) {
      this.game.scene.pause('GameScene');
    }
  }

  public resumeGame(): void {
    if (this.game) {
      this.game.scene.resume('GameScene');
    }
  }

  public isPaused(): boolean {
    if (this.game) {
      const gameScene = this.game.scene.getScene('GameScene');
      return gameScene ? gameScene.scene.isPaused() : false;
    }
    return false;
  }
}
