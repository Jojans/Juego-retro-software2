import Phaser from 'phaser';

export class ParticleManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
  private explosionParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private trailParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private sparkleParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private isPaused: boolean = false;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.setupParticleSystems();
  }

  private setupParticleSystems(): void {
    // Explosion particles
    this.explosionParticles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 1000,
      quantity: 20,
      tint: [0xff0000, 0xff8800, 0xffff00],
      emitting: false
    });

    // Trail particles
    this.trailParticles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 20, max: 50 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 5,
      tint: 0x00ffff,
      emitting: false
    });

    // Sparkle particles
    this.sparkleParticles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 30, max: 80 },
      scale: { start: 0.3, end: 0 },
      lifespan: 800,
      quantity: 10,
      tint: [0xffffff, 0x00ffff, 0xff00ff],
      emitting: false
    });
  }

  public createExplosion(x: number, y: number, size: number = 1): void {
    this.explosionParticles.setPosition(x, y);
    this.explosionParticles.setScale(size);
    this.explosionParticles.explode(20);

    // Play explosion sound (disabled to prevent errors with missing audio files)
    // this.scene.sound.play('explosion', { volume: 0.2 });
  }

  public createTrail(x: number, y: number, targetX: number, targetY: number): void {
    // Create a new particle emitter for the trail effect
    const trail = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 40 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 5,
      tint: 0x00ffff,
      angle: { min: 0, max: 0 }
    });
    
    trail.explode(5);
    
    // Destroy the trail after a short time
    this.scene.time.delayedCall(500, () => {
      trail.destroy();
    });
  }

  public createSparkles(x: number, y: number): void {
    this.sparkleParticles.setPosition(x, y);
    this.sparkleParticles.explode(10);
  }

  public createBulletTrail(x: number, y: number, angle: number): void {
    const trail = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 30, max: 60 },
      scale: { start: 0.2, end: 0 },
      lifespan: 300,
      quantity: 3,
      tint: 0x00ff00,
      angle: { min: angle - 10, max: angle + 10 }
    });

    this.scene.time.delayedCall(300, () => {
      trail.destroy();
    });
  }

  public createPowerUpEffect(x: number, y: number, color: number): void {
    const effect = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 40, max: 100 },
      scale: { start: 0.8, end: 0 },
      lifespan: 1500,
      quantity: 15,
      tint: color,
      angle: { min: 0, max: 360 }
    });

    this.scene.time.delayedCall(1500, () => {
      effect.destroy();
    });
  }

  public createDamageNumber(x: number, y: number, damage: number, color: number = 0xff0000): void {
    const text = this.scene.add.text(x, y, damage.toString(), {
      fontSize: '16px',
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    });

    text.setOrigin(0.5, 0.5);

    // Animate damage number
    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  public createScreenShake(intensity: number = 0.1, duration: number = 200): void {
    this.scene.cameras.main.shake(duration, intensity);
  }

  public createScreenFlash(color: number = 0xffffff, duration: number = 100): void {
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      color
    );
    flash.setDepth(1000);
    flash.setAlpha(0.5);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration,
      onComplete: () => {
        flash.destroy();
      }
    });
  }

  public createStarField(): void {
    const stars = this.scene.add.particles(0, 0, 'particle', {
      x: { min: 0, max: this.scene.cameras.main.width },
      y: { min: 0, max: this.scene.cameras.main.height },
      speedY: { min: 20, max: 50 },
      scale: { start: 0.1, end: 0.1 },
      lifespan: 10000,
      quantity: 100,
      tint: 0xffffff,
      emitting: true
    });

    // Move stars down
    this.scene.tweens.add({
      targets: stars,
      y: stars.y + this.scene.cameras.main.height,
      duration: 10000,
      repeat: -1,
      yoyo: false
    });
  }

  public createBossSpawnEffect(x: number, y: number): void {
    const effect = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      lifespan: 2000,
      quantity: 50,
      tint: [0xff0000, 0x8000ff, 0x0000ff],
      angle: { min: 0, max: 360 }
    });

    this.scene.time.delayedCall(2000, () => {
      effect.destroy();
    });
  }

  public update(): void {
    // Don't update if paused
    if (this.isPaused) return;
    
    // Update particle systems if needed
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public destroy(): void {
    this.explosionParticles.destroy();
    this.trailParticles.destroy();
    this.sparkleParticles.destroy();
    this.removeAllListeners();
  }
}