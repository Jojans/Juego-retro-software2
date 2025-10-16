import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private enemies?: Phaser.Physics.Arcade.Group;
  private bullets?: Phaser.Physics.Arcade.Group;
  private enemyBullets?: Phaser.Physics.Arcade.Group;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private cKey?: Phaser.Input.Keyboard.Key;
  private pKey?: Phaser.Input.Keyboard.Key;
  
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private lives: number = 3;
  private livesText?: Phaser.GameObjects.Text;
  private waveText?: Phaser.GameObjects.Text;
  
  private wave: number = 1;
  private enemiesInWave: number = 3;
  private enemiesKilled: number = 0;
  private lastEnemySpawn: number = 0;
  private enemySpawnDelay: number = 2000;
  
  private powerUpActive: boolean = false;
  private powerUpTimer: number = 0;
  private powerUpCooldown: number = 0;
  private powerUpText?: Phaser.GameObjects.Text;
  
  private gamePaused: boolean = false;
  private pauseText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Fondo
    this.add.rectangle(width / 2, height / 2, width, height, 0x000011);

    // Crear grupos
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    // Crear jugador
    this.player = this.physics.add.sprite(width / 2, height - 50, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.8);

    // Crear enemigos de la primera oleada
    this.spawnEnemies();

    // Controles
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.spaceKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.pKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    // UI
    this.scoreText = this.add.text(16, 16, 'Puntuación: 0', {
      fontSize: '20px',
      color: '#00ff88',
      fontFamily: 'Arial, sans-serif'
    });

    this.livesText = this.add.text(16, 40, 'Vidas: 3', {
      fontSize: '20px',
      color: '#ff6b6b',
      fontFamily: 'Arial, sans-serif'
    });

    this.waveText = this.add.text(width - 16, 16, 'Oleada: 1', {
      fontSize: '20px',
      color: '#4ecdc4',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(1, 0);

    this.powerUpText = this.add.text(width / 2, height - 80, '', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Arial, sans-serif'
    }).setOrigin(0.5);

    this.pauseText = this.add.text(width / 2, height / 2, 'PAUSA', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // Colisiones
    this.physics.add.collider(this.bullets, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.collider(this.enemyBullets, this.player, this.hitPlayer, undefined, this);
    this.physics.add.collider(this.enemies, this.player, this.hitPlayer, undefined, this);

    // Crear sprites básicos si no existen
    this.createBasicSprites();
  }

  update(time: number, delta: number) {
    if (this.gamePaused) return;

    this.handleInput();
    this.updatePowerUp(delta);
    this.updateEnemySpawning(time);
    this.updateUI();
  }

  private handleInput() {
    if (!this.player || !this.cursors) return;

    // Movimiento del jugador
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // Disparo
    if (this.spaceKey?.isDown) {
      this.shoot();
    }

    // Poder especial
    if (this.cKey?.isDown && this.powerUpCooldown <= 0) {
      this.activatePowerUp();
    }

    // Pausa
    if (this.pKey?.isDown) {
      this.togglePause();
    }
  }

  private shoot() {
    if (!this.player || !this.bullets) return;

    const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
    bullet.setVelocityY(-300);
    bullet.setScale(this.powerUpActive ? 1.5 : 1);
    bullet.setTint(this.powerUpActive ? 0x00ff00 : 0xffffff);
  }

  private activatePowerUp() {
    this.powerUpActive = true;
    this.powerUpTimer = 5000; // 5 segundos
    this.powerUpCooldown = 15000; // 15 segundos cooldown
  }

  private updatePowerUp(delta: number) {
    if (this.powerUpActive) {
      this.powerUpTimer -= delta;
      if (this.powerUpTimer <= 0) {
        this.powerUpActive = false;
      }
    }

    if (this.powerUpCooldown > 0) {
      this.powerUpCooldown -= delta;
    }

    if (this.powerUpText) {
      if (this.powerUpActive) {
        this.powerUpText.setText(`PODER ACTIVO: ${Math.ceil(this.powerUpTimer / 1000)}s`);
        this.powerUpText.setVisible(true);
      } else if (this.powerUpCooldown > 0) {
        this.powerUpText.setText(`PODER: ${Math.ceil(this.powerUpCooldown / 1000)}s`);
        this.powerUpText.setVisible(true);
      } else {
        this.powerUpText.setText('PODER LISTO (C)');
        this.powerUpText.setVisible(true);
      }
    }
  }

  private spawnEnemies() {
    if (!this.enemies) return;

    for (let i = 0; i < this.enemiesInWave; i++) {
      const x = Phaser.Math.Between(50, 550);
      const y = Phaser.Math.Between(50, 200);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(50, 150));
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      enemy.setScale(0.8);
    }
  }

  private updateEnemySpawning(time: number) {
    if (time - this.lastEnemySpawn > this.enemySpawnDelay && this.enemies && this.enemies.countActive() < this.enemiesInWave) {
      const x = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, 0, 'enemy');
      enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(50, 150));
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      enemy.setScale(0.8);
      this.lastEnemySpawn = time;
    }
  }

  private hitEnemy(bullet: any, enemy: any) {
    bullet.destroy();
    enemy.destroy();
    
    this.score += this.powerUpActive ? 20 : 10;
    this.enemiesKilled++;

    if (this.enemiesKilled >= this.enemiesInWave) {
      this.nextWave();
    }
  }

  private hitPlayer(player: any, enemy: any) {
    this.lives--;
    enemy.destroy();

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private nextWave() {
    this.wave++;
    this.enemiesInWave = 3 + this.wave;
    this.enemiesKilled = 0;
    this.enemySpawnDelay = Math.max(1000, 2000 - (this.wave * 100));
    this.spawnEnemies();
  }

  private gameOver() {
    this.scene.start('GameOverScene', { score: this.score, wave: this.wave });
  }

  private togglePause() {
    this.gamePaused = !this.gamePaused;
    if (this.pauseText) {
      this.pauseText.setVisible(this.gamePaused);
    }
    this.physics.pause();
    if (!this.gamePaused) {
      this.physics.resume();
    }
  }

  private updateUI() {
    if (this.scoreText) {
      this.scoreText.setText(`Puntuación: ${this.score}`);
    }
    if (this.livesText) {
      this.livesText.setText(`Vidas: ${this.lives}`);
    }
    if (this.waveText) {
      this.waveText.setText(`Oleada: ${this.wave}`);
    }
  }

  private createBasicSprites() {
    // Crear sprites básicos si no existen
    if (!this.textures.exists('player')) {
      this.add.graphics()
        .fillStyle(0x00ff88)
        .fillRect(0, 0, 32, 32)
        .generateTexture('player', 32, 32);
    }

    if (!this.textures.exists('enemy')) {
      this.add.graphics()
        .fillStyle(0xff6b6b)
        .fillRect(0, 0, 24, 24)
        .generateTexture('enemy', 24, 24);
    }

    if (!this.textures.exists('bullet')) {
      this.add.graphics()
        .fillStyle(0xffffff)
        .fillRect(0, 0, 4, 8)
        .generateTexture('bullet', 4, 8);
    }
  }
}
