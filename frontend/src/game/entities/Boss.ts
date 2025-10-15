import Phaser from 'phaser';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  private health: number = 200;
  private maxHealth: number = 200;
  private wave: number = 1;
  private points: number = 100;
  private attackTimer: Phaser.Time.TimerEvent | null = null;
  private moveTimer: Phaser.Time.TimerEvent | null = null;
  private isAttacking: boolean = false;
  private attackPattern: number = 0;
  private lastAttackTime: number = 0;
  private attackCooldown: number = 1500; // 1.5 seconds
  private moveSpeed: number = 60;
  private direction: number = 1; // 1 for right, -1 for left
  private minionsSpawned: boolean = false;
  private currentBossFrame: number = 1; // 1-8 for boss1.png to boss8.png
  private isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, wave: number) {
    super(scene, x, y, 'boss1'); // Start with boss1.png
    
    this.wave = wave;
    this.maxHealth = 50 + (wave - 7) * 25; // 50 shots for first boss, more for higher waves
    this.health = this.maxHealth;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Larger size for boss
    this.setScale(3);
    this.setCollideWorldBounds(true);
    this.setBounce(0.1);
    this.setDrag(80);
    
    this.setupAnimations();
    this.startBehavior();
    
    console.log(`Boss created for wave ${wave}, health: ${this.health}`);
  }

  private setupAnimations(): void {
    // Create animation using individual boss images (boss1.png to boss8.png)
    const bossFrames = [];
    for (let i = 1; i <= 8; i++) {
      if (this.scene.textures.exists(`boss${i}`)) {
        bossFrames.push({ key: `boss${i}`, frame: 0 });
      }
    }

    if (bossFrames.length === 0) {
      console.warn('Boss textures not loaded yet, retrying...');
      this.scene.time.delayedCall(100, () => this.setupAnimations());
      return;
    }

    try {
      // Boss cycling animation through all 8 boss images
      this.anims.create({
        key: 'boss_cycle',
        frames: bossFrames,
        frameRate: 4, // Slow cycling through boss forms
        repeat: -1
      });

      // Start with cycling animation
      this.play('boss_cycle');
      console.log(`Boss animation created with ${bossFrames.length} frames`);
    } catch (error) {
      console.error('Error creating boss animations:', error);
      // Set a default frame if animation creation fails
      this.setFrame(0);
    }
  }

  private startBehavior(): void {
    // Start moving pattern
    this.startMovement();
    
    // Start attack pattern
    this.startAttacks();
  }

  private startMovement(): void {
    if (!this.scene || !this.scene.time) return;
    
    this.moveTimer = this.scene.time.addEvent({
      delay: 3000,
      callback: this.changeDirection,
      callbackScope: this,
      loop: true
    });
  }

  private changeDirection(): void {
    // Check if boss is still alive and scene exists before changing direction
    if (this.health <= 0 || !this.scene || !this.scene.sys) {
      return;
    }
    
    this.direction *= -1;
    this.setVelocityX(this.moveSpeed * this.direction);
  }

  private startAttacks(): void {
    if (!this.scene || !this.scene.time) return;
    
    this.attackTimer = this.scene.time.addEvent({
      delay: this.attackCooldown,
      callback: this.performAttack,
      callbackScope: this,
      loop: true
    });
  }

  private performAttack(): void {
    if (this.isAttacking || this.health <= 0 || this.isDead || !this.scene || !this.scene.time) return;

    this.isAttacking = true;
    
    // Boss always uses triple shot: center + diagonal
    this.tripleShot();

    this.scene.time.delayedCall(1000, () => {
      // Check if boss is still alive before playing animation
      if (this.health > 0 && !this.isDead && this.scene && this.scene.sys) {
        this.isAttacking = false;
        this.play('boss_cycle');
      }
    });
  }

  private tripleShot(): void {
    // Check if boss is still alive
    if (this.isDead || this.health <= 0) return;

    // Center shot (straight down)
    this.createBossBullet(Math.PI / 2);
    
    // Left diagonal shot
    this.createBossBullet(Math.PI / 2 + Math.PI / 6); // 30 degrees from center
    
    // Right diagonal shot
    this.createBossBullet(Math.PI / 2 - Math.PI / 6); // 30 degrees from center
    
    console.log('Boss triple shot fired');
  }

  private homingShot(): void {
    // Check if boss is still alive
    if (this.isDead || this.health <= 0) return;

    const player = this.scene.data.get('player');
    if (!player) return;

    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      player.x, player.y
    );

    this.createBossBullet(angle);
  }

  private laserBeam(): void {
    // Check if boss is still alive
    if (this.isDead || this.health <= 0) return;

    // Create a powerful laser beam
    const laser = this.scene.add.rectangle(
      this.x, this.y - 50,
      20, 200,
      0xff0000
    );
    
    this.scene.physics.add.existing(laser);
    if (laser.body) {
      (laser.body as Phaser.Physics.Arcade.Body).setVelocityY(-300);
    }
    
    // Destroy laser after 2 seconds
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(2000, () => {
        laser.destroy();
      });
    }
  }

  private createBossBullet(angle: number): void {
    // Check if boss is still alive and scene is available
    if (this.isDead || this.health <= 0 || !this.scene || !this.scene.physics) {
      console.log('Boss cannot shoot: dead or scene unavailable');
      return;
    }

    // Create boss bullet using original texture
    const bullet = this.scene.physics.add.image(
      this.x, this.y - 30,
      'enemy-bullet' // Use enemy bullet texture
    );
    bullet.setDisplaySize(12, 20); // Slightly larger for boss
    bullet.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );
    bullet.body!.setSize(12, 20); // Boss bullet collision box
    bullet.setDepth(5); // Make sure it's visible above other objects
    
    // Add to boss bullets group
    const bossBullets = this.scene.data.get('bossBullets');
    if (bossBullets) {
      bossBullets.add(bullet);
    }
    
    // Destroy bullet after 5 seconds
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(5000, () => {
        bullet.destroy();
      });
    }
  }

  public takeDamage(damage: number): void {
    // Don't take damage if already dead
    if (this.isDead || this.health <= 0) {
      console.log('Boss is already dead, ignoring damage');
      return;
    }

    this.health -= damage;
    
    // Play boss hit sound
    const soundManager = this.scene.data.get('soundManager');
    if (soundManager) {
      soundManager.playArcadeSound('boss_hit');
    }
    
    // Flash effect
    this.setTint(0xff0000);
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(200, () => {
        this.clearTint();
      });
    }

    // Boss no longer spawns minions - boss fights only
    console.log(`Boss health: ${this.health}/${this.maxHealth}, half health: ${this.maxHealth / 2}`);

    if (this.health <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.health = 0;
    this.isDead = true; // Mark as dead to prevent further damage
    
    // Stop all timers immediately
    if (this.attackTimer) {
      this.attackTimer.destroy();
      this.attackTimer = null;
    }
    if (this.moveTimer) {
      this.moveTimer.destroy();
      this.moveTimer = null;
    }
    
    // Stop movement
    this.setVelocity(0, 0);
    
    // Change texture to dead boss
    if (this.scene && this.scene.sys) {
      this.setTexture('boss_dead');
      console.log('Boss texture changed to jefe_muerto.png');
    }
    
    // Emit death event
    if (this.scene && this.scene.events) {
      this.scene.events.emit('bossDefeated');
    }
    
    // Also emit the event that EnemyManager is listening for
    this.emit('boss-defeated');
    
    // Emit enemy-died event to count as killed enemy and award points
    this.emit('enemy-died', this.points);
    
    // Emit boss-defeated event with 100 bonus points
    this.emit('boss-defeated', 100);
    
    // Destroy boss immediately when it dies
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(500, () => {
        if (this.scene && this.scene.sys) {
          this.destroy();
        }
      });
    } else {
      this.destroy();
    }
  }

  public getHealth(): number {
    return this.health;
  }

  public getPoints(): number {
    return this.points;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  public update(): void {
    if (this.health <= 0 || !this.scene || !this.scene.sys) return;

    // Keep moving
    if (!this.isAttacking) {
      this.setVelocityX(this.moveSpeed * this.direction);
    }

    // Keep boss on screen
    if (this.x <= 50) {
      this.direction = 1;
    } else if (this.x >= this.scene.cameras.main.width - 50) {
      this.direction = -1;
    }
  }
}
