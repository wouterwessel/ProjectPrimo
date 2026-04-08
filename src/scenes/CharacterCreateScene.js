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
    this.cameras.main.setBackgroundColor('#FFFFFF');

    // Top accent bar
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 6, 0x00529C).setOrigin(0.5, 0);

    // Title
    this.add.text(GAME_WIDTH / 2, 40, 'Maak je karakter', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '28px',
      color: '#00529C',
    }).setOrigin(0.5);

    this.add.rectangle(GAME_WIDTH / 2, 62, 200, 3, 0xF57C00).setOrigin(0.5);

    // State
    this.shirtIndex = 0;
    this.hairIndex = 0;
    this.playerName = '';

    // --- Name input ---
    this.add.text(GAME_WIDTH / 2, 95, 'Jouw naam:', {
      fontFamily: 'Arial, sans-serif', fontSize: '16px', color: '#455A64',
    }).setOrigin(0.5);

    // Name display box
    const nameBoxY = 125;
    this.nameBox = this.add.rectangle(GAME_WIDTH / 2, nameBoxY, 260, 36, 0xFFFFFF)
      .setStrokeStyle(2, 0x00529C);

    this.nameText = this.add.text(GAME_WIDTH / 2, nameBoxY, '|', {
      fontFamily: 'Arial, sans-serif', fontSize: '20px', color: '#212121',
    }).setOrigin(0.5);

    // Cursor blink
    this.cursorVisible = true;
    this.time.addEvent({
      delay: 500, loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateNameDisplay();
      },
    });

    // Keyboard input for name
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Enter') return;
      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key.length === 1 && this.playerName.length < 16) {
        this.playerName += event.key;
      }
      this.updateNameDisplay();
    });

    // --- Character preview ---
    const previewY = 210;
    this.previewGraphics = this.add.graphics();
    this.drawPreview(previewY);
    this.previewY = previewY;

    // --- Shirt color picker ---
    const shirtY = 330;
    this.add.text(GAME_WIDTH / 2, shirtY, 'Shirt kleur:', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#455A64',
    }).setOrigin(0.5);

    this.shirtLabel = this.add.text(GAME_WIDTH / 2, shirtY + 24, SHIRT_COLORS[0].label, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#78909C',
    }).setOrigin(0.5);

    this.createColorPicker(shirtY + 55, SHIRT_COLORS, 'shirt');

    // --- Hair color picker ---
    const hairY = 410;
    this.add.text(GAME_WIDTH / 2, hairY, 'Haar kleur:', {
      fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#455A64',
    }).setOrigin(0.5);

    this.hairLabel = this.add.text(GAME_WIDTH / 2, hairY + 24, HAIR_COLORS[0].label, {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#78909C',
    }).setOrigin(0.5);

    this.createColorPicker(hairY + 55, HAIR_COLORS, 'hair');

    // --- Start button ---
    const btnY = 520;
    const btnBg = this.add.rectangle(GAME_WIDTH / 2, btnY, 260, 48, 0x00529C)
      .setStrokeStyle(2, 0x00529C);
    const btnText = this.add.text(GAME_WIDTH / 2, btnY, 'Start avontuur →', {
      fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on('pointerover', () => btnBg.setFillStyle(0xF57C00));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x00529C));
    btnBg.on('pointerdown', () => this.startGame());

    this.input.keyboard.on('keydown-ENTER', () => this.startGame());

    // Bottom accent
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 4, 0xF57C00).setOrigin(0.5, 1);
  }

  updateNameDisplay() {
    const cursor = this.cursorVisible ? '|' : '';
    this.nameText.setText(this.playerName + cursor);
  }

  createColorPicker(y, colors, type) {
    const totalWidth = colors.length * 44 - 8;
    const startX = GAME_WIDTH / 2 - totalWidth / 2 + 18;

    colors.forEach((c, i) => {
      const x = startX + i * 44;
      const circle = this.add.circle(x, y, 16, c.value).setStrokeStyle(3, 0xCFD8DC);

      if (i === 0) circle.setStrokeStyle(3, 0xF57C00);

      circle.setInteractive({ useHandCursor: true });
      circle.on('pointerdown', () => {
        // Reset all strokes in this row
        circle.parentContainer; // no-op
        this[`${type}Circles`].forEach(cc => cc.setStrokeStyle(3, 0xCFD8DC));
        circle.setStrokeStyle(3, 0xF57C00);
        this[`${type}Index`] = i;
        this[`${type}Label`].setText(c.label);
        this.drawPreview(this.previewY);
      });

      if (!this[`${type}Circles`]) this[`${type}Circles`] = [];
      this[`${type}Circles`].push(circle);
    });
  }

  drawPreview(y) {
    const g = this.previewGraphics;
    g.clear();

    const shirtColor = SHIRT_COLORS[this.shirtIndex].value;
    const hairColor = HAIR_COLORS[this.hairIndex].value;
    const scale = 4;
    const cx = GAME_WIDTH / 2;
    const cy = y + 40;

    // Body (shirt)
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

    // Store in registry so BootScene-generated sprites can be regenerated
    this.registry.set('playerName', name);
    this.registry.set('shirtColor', shirtColor);
    this.registry.set('hairColor', hairColor);

    // Regenerate player sprites with chosen colors
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

        // Remove old texture
        if (this.textures.exists(key)) {
          this.textures.remove(key);
        }

        const g = this.make.graphics({ add: false });

        // Body
        g.fillStyle(shirtColor);
        g.fillRoundedRect(6, 10, 20, 18, 3);

        // Head
        g.fillStyle(0xFFDDB0);
        g.beginPath();
        g.arc(16, 8, 7, 0, Math.PI * 2);
        g.closePath();
        g.fillPath();

        // Hair
        g.fillStyle(hairColor);
        if (dir === 'down') {
          g.fillRect(9, 2, 14, 5);
        } else if (dir === 'up') {
          g.fillRect(9, 1, 14, 8);
        } else {
          g.fillRect(9, 2, 14, 5);
          g.fillRect(dir === 'left' ? 9 : 18, 2, 5, 7);
        }

        // Eyes
        if (dir !== 'up') {
          g.fillStyle(0x000000);
          if (dir === 'down') {
            g.fillRect(12, 7, 2, 2);
            g.fillRect(18, 7, 2, 2);
          } else if (dir === 'left') {
            g.fillRect(11, 7, 2, 2);
          } else {
            g.fillRect(19, 7, 2, 2);
          }
        }

        // Legs (animated)
        g.fillStyle(0x333333);
        if (frame === 0) {
          g.fillRect(10, 28, 5, 4);
          g.fillRect(18, 28, 5, 4);
        } else {
          g.fillRect(8, 28, 5, 4);
          g.fillRect(20, 28, 5, 4);
        }

        g.generateTexture(key, TILE_SIZE, TILE_SIZE);
        g.destroy();
      }
    });
  }
}
