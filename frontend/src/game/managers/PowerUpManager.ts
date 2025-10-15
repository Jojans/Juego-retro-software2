import Phaser from 'phaser';

export interface PowerUp {
  type: 'health' | 'speed' | 'damage' | 'multiShot' | 'shield';
  duration: number;
  value: number;
}

export class PowerUpManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private powerUps: Phaser.Physics.Arcade.Group;
  private activePowerUps: Map<string, PowerUp> = new Map();
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private spawnChance: number = 0.1; // 10% chance per enemy kill
  private isPaused: boolean = false;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.powerUps = this.scene.physics.add.group();
    this.setupPowerUps();
  }

  private setupPowerUps(): void {
    // Create power-up types
    const powerUpTypes = [
      { type: 'health', color: 0x00ff00, value: 25 },
      { type: 'speed', color: 0x00ffff, value: 1.5 },
      { type: 'damage', color: 0xff0000, value: 2 },
      { type: 'multiShot', color: 0xffff00, value: 3 },
      { type: 'shield', color: 0x8000ff, value: 100 }
    ];

    // Store power-up configurations
    this.scene.data.set('powerUpTypes', powerUpTypes);
  }

  public spawnPowerUp(x: number, y: number): void {
    if (Math.random() > this.spawnChance) return;

    const powerUpTypes = this.scene.data.get('powerUpTypes');
    const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    const powerUp = this.scene.physics.add.sprite(x, y, 'powerup');
    powerUp.setScale(0.8);
    powerUp.setTint(randomType.color);
    powerUp.setData('type', randomType.type);
    powerUp.setData('value', randomType.value);

    // Add to group
    this.powerUps.add(powerUp);

    // Add floating animation
    this.scene.tweens.add({
      targets: powerUp,
      y: powerUp.y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Add rotation animation
    this.scene.tweens.add({
      targets: powerUp,
      angle: 360,
      duration: 2000,
      repeat: -1
    });

    // Destroy after 10 seconds
    this.scene.time.delayedCall(10000, () => {
      if (powerUp.active) {
        powerUp.destroy();
      }
    });
  }

  public collectPowerUp(powerUp: Phaser.Physics.Arcade.Sprite, player: any): void {
    const type = powerUp.getData('type');
    const value = powerUp.getData('value');

    // Apply power-up effect
    this.applyPowerUp(type, value, player);

    // Create collection effect
    this.createCollectionEffect(powerUp.x, powerUp.y);

    // Play sound
    // Play powerup sound (if available)
    if (this.scene.sound.get('powerup')) {
      this.scene.sound.play('powerup', { volume: 0.3 });
    }

    // Remove power-up
    powerUp.destroy();

    // Emit event
    this.emit('powerUpCollected', { type, value });
  }

  public applyPowerUp(type: string, value: number, player: any): void {
    switch (type) {
      case 'health':
        player.heal(value);
        break;
      case 'speed':
        this.activateTemporaryPowerUp('speed', value, 10000);
        break;
      case 'damage':
        this.activateTemporaryPowerUp('damage', value, 15000);
        break;
      case 'multiShot':
        this.activateTemporaryPowerUp('multiShot', value, 20000);
        break;
      case 'shield':
        this.activateTemporaryPowerUp('shield', value, 25000);
        break;
    }
  }

  private activateTemporaryPowerUp(type: string, value: number, duration: number): void {
    const powerUp: PowerUp = {
      type: type as any,
      duration,
      value
    };

    this.activePowerUps.set(type, powerUp);

    // Start countdown
    this.scene.time.delayedCall(duration, () => {
      this.activePowerUps.delete(type);
      this.emit('powerUpExpired', { type });
    });
  }

  private createCollectionEffect(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 10,
      tint: 0xffff00
    });

    this.scene.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  public getActivePowerUps(): Map<string, PowerUp> {
    return this.activePowerUps;
  }

  public hasPowerUp(type: string): boolean {
    return this.activePowerUps.has(type);
  }

  public getPowerUpValue(type: string): number {
    const powerUp = this.activePowerUps.get(type);
    return powerUp ? powerUp.value : 1;
  }

  public update(): void {
    // Don't update if paused
    if (this.isPaused) return;

    // Update active power-ups
    for (const [type, powerUp] of this.activePowerUps) {
      powerUp.duration -= this.scene.game.loop.delta;
      if (powerUp.duration <= 0) {
        this.activePowerUps.delete(type);
        this.emit('powerUpExpired', { type });
      }
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public destroy(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
    }
    this.powerUps.clear(true, true);
    this.activePowerUps.clear();
    this.removeAllListeners();
  }
}
