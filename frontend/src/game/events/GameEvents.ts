import Phaser from 'phaser';

export class GameEvents extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private eventQueue: Array<{ event: string; data: any; timestamp: number }> = [];

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Player events
    this.scene.events.on('playerHit', (data: any) => {
      this.emit('playerHit', data);
      this.addToQueue('playerHit', data);
    });

    this.scene.events.on('playerDeath', (data: any) => {
      this.emit('playerDeath', data);
      this.addToQueue('playerDeath', data);
    });

    this.scene.events.on('playerShoot', (data: any) => {
      this.emit('playerShoot', data);
      this.addToQueue('playerShoot', data);
    });

    // Enemy events
    this.scene.events.on('enemyKilled', (data: any) => {
      this.emit('enemyKilled', data);
      this.addToQueue('enemyKilled', data);
    });

    this.scene.events.on('enemySpawned', (data: any) => {
      this.emit('enemySpawned', data);
      this.addToQueue('enemySpawned', data);
    });

    // Boss events
    this.scene.events.on('bossSpawned', (data: any) => {
      this.emit('bossSpawned', data);
      this.addToQueue('bossSpawned', data);
    });

    this.scene.events.on('bossHit', (data: any) => {
      this.emit('bossHit', data);
      this.addToQueue('bossHit', data);
    });

    this.scene.events.on('bossDefeated', (data: any) => {
      this.emit('bossDefeated', data);
      this.addToQueue('bossDefeated', data);
    });

    // Power-up events
    this.scene.events.on('powerUpCollected', (data: any) => {
      this.emit('powerUpCollected', data);
      this.addToQueue('powerUpCollected', data);
    });

    this.scene.events.on('powerUpExpired', (data: any) => {
      this.emit('powerUpExpired', data);
      this.addToQueue('powerUpExpired', data);
    });

    // Game state events
    this.scene.events.on('levelComplete', (data: any) => {
      this.emit('levelComplete', data);
      this.addToQueue('levelComplete', data);
    });

    this.scene.events.on('gameOver', (data: any) => {
      this.emit('gameOver', data);
      this.addToQueue('gameOver', data);
    });

    this.scene.events.on('gamePause', (data: any) => {
      this.emit('gamePause', data);
      this.addToQueue('gamePause', data);
    });

    this.scene.events.on('gameResume', (data: any) => {
      this.emit('gameResume', data);
      this.addToQueue('gameResume', data);
    });

    // Score events
    this.scene.events.on('scoreUpdate', (data: any) => {
      this.emit('scoreUpdate', data);
      this.addToQueue('scoreUpdate', data);
    });

    this.scene.events.on('comboUpdate', (data: any) => {
      this.emit('comboUpdate', data);
      this.addToQueue('comboUpdate', data);
    });

    // UI events
    this.scene.events.on('uiUpdate', (data: any) => {
      this.emit('uiUpdate', data);
      this.addToQueue('uiUpdate', data);
    });

    // Audio events
    this.scene.events.on('playSound', (data: any) => {
      this.emit('playSound', data);
      this.addToQueue('playSound', data);
    });

    this.scene.events.on('playMusic', (data: any) => {
      this.emit('playMusic', data);
      this.addToQueue('playMusic', data);
    });
  }

  private addToQueue(event: string, data: any): void {
    this.eventQueue.push({
      event,
      data,
      timestamp: Date.now()
    });

    // Keep only last 100 events
    if (this.eventQueue.length > 100) {
      this.eventQueue.shift();
    }
  }

  public getEventQueue(): Array<{ event: string; data: any; timestamp: number }> {
    return this.eventQueue;
  }

  public getEventsByType(eventType: string): Array<{ event: string; data: any; timestamp: number }> {
    return this.eventQueue.filter(item => item.event === eventType);
  }

  public getRecentEvents(count: number = 10): Array<{ event: string; data: any; timestamp: number }> {
    return this.eventQueue.slice(-count);
  }

  public clearEventQueue(): void {
    this.eventQueue = [];
  }

  public emitPlayerHit(damage: number, playerHealth: number): void {
    this.scene.events.emit('playerHit', { damage, playerHealth });
  }

  public emitPlayerDeath(score: number, level: number): void {
    this.scene.events.emit('playerDeath', { score, level });
  }

  public emitPlayerShoot(bulletType: string, position: { x: number; y: number }): void {
    this.scene.events.emit('playerShoot', { bulletType, position });
  }

  public emitEnemyKilled(enemyType: string, score: number, position: { x: number; y: number }): void {
    this.scene.events.emit('enemyKilled', { enemyType, score, position });
  }

  public emitEnemySpawned(enemyType: string, position: { x: number; y: number }): void {
    this.scene.events.emit('enemySpawned', { enemyType, position });
  }

  public emitBossSpawned(bossType: string, position: { x: number; y: number }): void {
    this.scene.events.emit('bossSpawned', { bossType, position });
  }

  public emitBossHit(damage: number, bossHealth: number): void {
    this.scene.events.emit('bossHit', { damage, bossHealth });
  }

  public emitBossDefeated(score: number, level: number): void {
    this.scene.events.emit('bossDefeated', { score, level });
  }

  public emitPowerUpCollected(powerUpType: string, position: { x: number; y: number }): void {
    this.scene.events.emit('powerUpCollected', { powerUpType, position });
  }

  public emitPowerUpExpired(powerUpType: string): void {
    this.scene.events.emit('powerUpExpired', { powerUpType });
  }

  public emitLevelComplete(score: number, level: number): void {
    this.scene.events.emit('levelComplete', { score, level });
  }

  public emitGameOver(score: number, level: number, reason: string): void {
    this.scene.events.emit('gameOver', { score, level, reason });
  }

  public emitGamePause(): void {
    this.scene.events.emit('gamePause', {});
  }

  public emitGameResume(): void {
    this.scene.events.emit('gameResume', {});
  }

  public emitScoreUpdate(score: number, points: number): void {
    this.scene.events.emit('scoreUpdate', { score, points });
  }

  public emitComboUpdate(combo: number, multiplier: number): void {
    this.scene.events.emit('comboUpdate', { combo, multiplier });
  }

  public emitUIUpdate(uiElement: string, data: any): void {
    this.scene.events.emit('uiUpdate', { uiElement, data });
  }

  public emitPlaySound(soundKey: string, volume: number = 1): void {
    this.scene.events.emit('playSound', { soundKey, volume });
  }

  public emitPlayMusic(musicKey: string, volume: number = 1): void {
    this.scene.events.emit('playMusic', { musicKey, volume });
  }

  public destroy(): void {
    this.scene.events.removeAllListeners();
    this.eventQueue = [];
    this.removeAllListeners();
  }
}
