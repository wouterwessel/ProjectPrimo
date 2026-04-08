import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../utils/constants.js';

const SHIRT_COLORS = [
  { label: 'AFAS Blauw', value: 0x00529C },
  { label: 'Oranje', value: 0xF57C00 },
  { label: 'Groen', value: 0x388E3C },
  { label: 'Rood', value: 0xD32F2F },
  { label: 'Paars', value: 0x7B1FA2 },
  { label: 'Zwart', value: 0x212121 },
];

const HAIR_COLORS = [
  { label: 'Bruin', value: 0x4A3728 },
  { label: 'Blond', value: 0xD4A843 },
  { label: 'Zwart', value: 0x1A1A1A },
  { label: 'Rood', value: 0x8B2500 },
  { label: 'Grijs', value: 0x9E9E9E },
  { label: 'Blauw', value: 0x1565C0 },
];

export class CharacterCreateScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.CHARACTER_CREATE });
  }

  create() {
    // Dark gradient background
    this.cameras.main.setBackgroundColor('#0a0a2e');
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x00396b, 0x00396b);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Clubhuis silhouette
    if (this.textures.exists('clubhuis_silhouette')) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT - 50, 'clubhuis_silhouette').setAlpha(0.5).setOrigin(0.5, 1);
    }

    // Bottom accent
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 4, 0xF57C00).setOrigin(0.5, 1);

    // Title
    this.add.text(GAME_WIDTH / 2, 30, 'Maak je karakter', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.rectangle(GAME_WIDTH / 2, 52, 200, 3, 0xF57C00).setOrigin(0.5);

    // State
    this.shirtIndex = 0;
    this.hairIndex = 0;
    this.playerName = '';

    // === LEFT PANEL — Preview ===
    const leftCx = 190;
    this.add.rectangle(leftCx, GAME_HEIGHT / 2 + 20, 320, 440, 0x000000, 0.2).setOrigin(0.5);
    this.add.text(leftCx, 85, 'Preview', {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#90CAF9',
    }).setOrigin(0.5);

    this.previewGraphics = this.add.graphics();
    this.previewCx = leftCx;
    this.previewCy = 280;
    this.drawPreview();

    // Breathing animation on preview
    this.previewScale = { v: 1 };
    this.tweens.add({
      targets: this.previewScale, v: 1.03,
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      onUpdate: () => { this.previewGraphics.setScale(this.previewScale.v); },
    });

    // === RIGHT PANEL — Options ===
    const rightCx = 570;

    // Name input
    this.add.text(rightCx, 90, 'Jouw naam', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#90CAF9',
    }).setOrigin(0.5);

    const nameBoxY = 120;
    this.nameBox = this.add.rectangle(rightCx, nameBoxY, 300, 40, 0x1a1a4e)
      .setStrokeStyle(2, 0x00529C);
    this.nameText = this.add.text(rightCx, nameBoxY, '', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    this.placeholderText = this.add.text(rightCx, nameBoxY, 'Typ je naam...', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#546E7A',
    }).setOrigin(0.5);

    // Cursor blink
    this.cursorVisible = true;
    this.time.addEvent({
      delay: 500, loop: true,
      callback: () => { this.cursorVisible = !this.cursorVisible; this.updateNameDisplay(); },
    });

    // Keyboard input
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Enter') return;
      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key.length === 1 && this.playerName.length < 16) {
        this.playerName += event.key;
      }
      this.updateNameDisplay();
    });

    // Shirt color picker
    const shirtY = 190;
    this.add.text(rightCx, shirtY, 'Shirtkleur', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#90CAF9',
    }).setOrigin(0.5);
    this.shirtLabel = this.add.text(rightCx, shirtY + 22, SHIRT_COLORS[0].label, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#78909C',
    }).setOrigin(0.5);
    this.createColorPicker(shirtY + 52, SHIRT_COLORS, 'shirt', rightCx);

    // Hair color picker
    const hairY = 290;
    this.add.text(rightCx, hairY, 'Haarkleur', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#90CAF9',
    }).setOrigin(0.5);
    this.hairLabel = this.add.text(rightCx, hairY + 22, HAIR_COLORS[0].label, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#78909C',
    }).setOrigin(0.5);
    this.createColorPicker(hairY + 52, HAIR_COLORS, 'hair', rightCx);

    // Start button
    const btnY = 410;
    const btnBg = this.add.rectangle(rightCx, btnY, 300, 52, 0xF57C00)
      .setStrokeStyle(2, 0xF57C00);
    this.add.text(rightCx, btnY, 'Start je stage \u2192', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerover', () => btnBg.setFillStyle(0xFF9800));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0xF57C00));
    btnBg.on('pointerdown', () => this.startGame());

    this.tweens.add({
      targets: btnBg, scaleX: 1.02, scaleY: 1.02,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.input.keyboard.on('keydown-ENTER', () => this.startGame());

    this.add.text(rightCx, btnY + 42, 'of druk op ENTER', {
      fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#546E7A',
    }).setOrigin(0.5);
  }

  updateNameDisplay() {
    const cursor = this.cursorVisible ? '|' : '';
    this.nameText.setText(this.playerName + cursor);
    this.placeholderText.setVisible(this.playerName.length === 0 && !this.cursorVisible);
  }

  createColorPicker(y, colors, type, centerX) {
    const totalWidth = colors.length * 48 - 8;
    const startX = centerX - totalWidth / 2 + 20;
    colors.forEach((c, i) => {
      const x = startX + i * 48;
      const circle = this.add.circle(x, y, 20, c.value).setStrokeStyle(3, 0x37474F);
      if (i === 0) circle.setStrokeStyle(3, 0xF57C00);
      circle.setInteractive({ useHandCursor: true });
      circle.on('pointerdown', () => {
        this[`${type}Circles`].forEach(cc => cc.setStrokeStyle(3, 0x37474F));
        circle.setStrokeStyle(3, 0xF57C00);
        this[`${type}Index`] = i;
        this[`${type}Label`].setText(c.label);
        this.drawPreview();
      });
      if (!this[`${type}Circles`]) this[`${type}Circles`] = [];
      this[`${type}Circles`].push(circle);
    });
  }

  drawPreview() {
    const g = this.previewGraphics;
    g.clear();
    const shirtColor = SHIRT_COLORS[this.shirtIndex].value;
    const hairColor = HAIR_COLORS[this.hairIndex].value;
    const scale = 6;
    const cx = this.previewCx;
    const cy = this.previewCy;

    // Shadow
    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(cx, cy + 23 * scale, 18 * scale, 4 * scale);
    // Body
    g.fillStyle(shirtColor);
    g.fillRoundedRect(cx - 10 * scale, cy, 20 * scale, 18 * scale, 3 * scale);
    // Head
    g.fillStyle(0xFFDDB0);
    g.beginPath();
    g.arc(cx, cy - 2 * scale, 7 * scale, 0, Math.PI * 2);
    g.closePath();
    g.fillPath();
    // Hair
    g.fillStyle(hairColor);
    g.fillRect(cx - 7 * scale, cy - 9 * scale, 14 * scale, 5 * scale);
    // Eyes
    g.fillStyle(0x000000);
    g.fillRect(cx - 4 * scale, cy - 1 * scale, 2 * scale, 2 * scale);
    g.fillRect(cx + 2 * scale, cy - 1 * scale, 2 * scale, 2 * scale);
    // Legs
    g.fillStyle(0x333333);
    g.fillRect(cx - 6 * scale, cy + 18 * scale, 5 * scale, 4 * scale);
    g.fillRect(cx + 2 * scale, cy + 18 * scale, 5 * scale, 4 * scale);
  }

  startGame() {
    const name = this.playerName.trim() || 'Speler';
    const shirtColor = SHIRT_COLORS[this.shirtIndex].value;
    const hairColor = HAIR_COLORS[this.hairIndex].value;
    this.registry.set('playerName', name);
    this.registry.set('shirtColor', shirtColor);
    this.registry.set('hairColor', hairColor);
    this.regeneratePlayerSprite(shirtColor, hairColor);
    this.scene.start(SCENES.WORLD, {
      newGame: true,
      currentZone: 'parkeerplaats',
      playerName: name,
      shirtColor,
      hairColor,
    });
  }

  regeneratePlayerSprite(shirtColor, hairColor) {
    const dirs = ['down', 'left', 'right', 'up'];
    dirs.forEach((dir) => {
      for (let frame = 0; frame < 2; frame++) {
        const key = `player_${dir}_${frame}`;
        if (this.textures.exists(key)) { this.textures.remove(key); }
        const g = this.make.graphics({ add: false });
        g.fillStyle(shirtColor);
        g.fillRoundedRect(6, 10, 20, 18, 3);
        g.fillStyle(0xFFDDB0);
        g.beginPath(); g.arc(16, 8, 7, 0, Math.PI * 2); g.closePath(); g.fillPath();
        g.fillStyle(hairColor);
        if (dir === 'down') { g.fillRect(9, 2, 14, 5); }
        else if (dir === 'up') { g.fillRect(9, 1, 14, 8); }
        else { g.fillRect(9, 2, 14, 5); g.fillRect(dir === 'left' ? 9 : 18, 2, 5, 7); }
        if (dir !== 'up') {
          g.fillStyle(0x000000);
          if (dir === 'down') { g.fillRect(12, 7, 2, 2); g.fillRect(18, 7, 2, 2); }
          else if (dir === 'left') { g.fillRect(11, 7, 2, 2); }
          else { g.fillRect(19, 7, 2, 2); }
        }
        g.fillStyle(0x333333);
        if (frame === 0) { g.fillRect(10, 28, 5, 4); g.fillRect(18, 28, 5, 4); }
        else { g.fillRect(8, 28, 5, 4); g.fillRect(20, 28, 5, 4); }
        g.generateTexture(key, TILE_SIZE, TILE_SIZE);
        g.destroy();
      }
    });
  }
}
