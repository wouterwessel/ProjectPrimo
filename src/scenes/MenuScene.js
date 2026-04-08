import Phaser from 'phaser';
import { SCENES, COLORS, GAME_WIDTH, GAME_HEIGHT } from '../utils/constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    // AFAS-style clean white background
    this.cameras.main.setBackgroundColor('#FFFFFF');

    // Top blue accent bar (AFAS header style)
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 6, 0x00529C).setOrigin(0.5, 0);

    // Subtle geometric decoration (AFAS uses clean geometric shapes)
    const deco = this.add.graphics();
    deco.fillStyle(0x00529C, 0.04);
    deco.fillCircle(680, 80, 200);
    deco.fillCircle(120, 500, 150);
    deco.fillStyle(0xF57C00, 0.03);
    deco.fillCircle(650, 480, 120);

    // Floating soft particles (subtle, AFAS-clean)
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(2, 5),
        Phaser.Math.Between(0, 1) ? 0x00529C : 0xF57C00,
        0.08
      );
      p.vx = Phaser.Math.FloatBetween(-0.2, 0.2);
      p.vy = Phaser.Math.FloatBetween(-0.3, -0.05);
      this.particles.push(p);
    }

    // Logo area
    const logoY = 130;

    // "Succes begint met" tagline above title
    this.add.text(GAME_WIDTH / 2, logoY - 55, 'Succes begint met', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '16px',
      color: '#78909C',
      letterSpacing: 3,
    }).setOrigin(0.5);

    // Title — AFAS Blue, clean and bold like afas.nl headings
    this.add.text(GAME_WIDTH / 2, logoY, 'AFAS', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '72px',
      color: '#00529C',
    }).setOrigin(0.5);

    // "mon" suffix in orange accent
    const afasText = this.add.text(GAME_WIDTH / 2, logoY, 'AFAS', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '72px',
      color: '#00529C',
    }).setOrigin(0.5);

    // Measure "AFAS" width to position "mon" right after it
    const monX = GAME_WIDTH / 2 + afasText.width / 2;
    afasText.destroy(); // remove the measuring text

    // Composite title: "AFAS" in blue + "mon" in orange
    this.add.text(GAME_WIDTH / 2, logoY, 'AFAS', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '72px',
      color: '#00529C',
    }).setOrigin(0.5);

    this.add.text(monX + 2, logoY + 8, 'mon', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '40px',
      color: '#F57C00',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, logoY + 48, 'Vang ze allemaal in het AFAS Clubhuis!', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '17px',
      color: '#455A64',
    }).setOrigin(0.5);

    // Thin orange accent line under subtitle
    this.add.rectangle(GAME_WIDTH / 2, logoY + 72, 280, 3, 0xF57C00).setOrigin(0.5);

    // Menu buttons — AFAS style: solid color, rounded feel, clean typography
    const buttonY = 270;
    const buttonSpacing = 60;

    const buttonData = [
      { text: 'Nieuw Spel', y: buttonY, action: () => this.startNewGame(), primary: true },
      { text: 'Verder Spelen', y: buttonY + buttonSpacing, action: () => this.continueGame(), primary: false },
    ];

    const hasSave = !!localStorage.getItem('afasmon_save');

    buttonData.forEach(({ text, y, action, primary }) => {
      const isDisabled = text === 'Verder Spelen' && !hasSave;
      const bgColor = isDisabled ? 0xCFD8DC : primary ? 0x00529C : 0xFFFFFF;
      const borderColor = isDisabled ? 0xB0BEC5 : 0x00529C;
      const textColor = isDisabled ? '#90A4AE' : primary ? '#ffffff' : '#00529C';

      const btnBg = this.add.rectangle(GAME_WIDTH / 2, y, 280, 48, bgColor)
        .setStrokeStyle(2, borderColor);

      const btnText = this.add.text(GAME_WIDTH / 2, y, text, {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        color: textColor,
        fontStyle: 'bold',
      }).setOrigin(0.5);

      if (!isDisabled) {
        btnBg.setInteractive({ useHandCursor: true });

        btnBg.on('pointerover', () => {
          if (primary) {
            btnBg.setFillStyle(0xF57C00);
          } else {
            btnBg.setFillStyle(0x00529C);
            btnText.setColor('#ffffff');
          }
        });
        btnBg.on('pointerout', () => {
          btnBg.setFillStyle(bgColor);
          btnText.setColor(textColor);
        });
        btnBg.on('pointerdown', action);
      }
    });

    // Show AFASmon sprites in a neat row
    const monsterKeys = ['profitron', 'salarion', 'relatiox', 'orderon', 'workflox', 'projecto', 'pocketon', 'innovaxx'];
    this.floatingMonsters = [];
    const rowY = 430;
    const startX = GAME_WIDTH / 2 - (monsterKeys.length - 1) * 45;

    monsterKeys.forEach((key, i) => {
      const x = startX + i * 90;
      const sprite = this.add.image(x, rowY, `${key}_battle`).setScale(0.55).setAlpha(0.6);
      this.tweens.add({
        targets: sprite,
        y: rowY - 8,
        duration: 1800 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.floatingMonsters.push(sprite);
    });

    // Stats line (AFAS-style "feiten & cijfers")
    const statsY = 495;
    this.add.text(GAME_WIDTH / 2, statsY, '8 AFASmon  •  13 zones  •  28 aanvallen  •  1 Clubhuis', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      color: '#90A4AE',
    }).setOrigin(0.5);

    // Footer
    this.add.text(GAME_WIDTH / 2, 540, '© 2026 AFAS Software — Leusden, Nederland', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11px',
      color: '#B0BEC5',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 560, 'Druk op ENTER of klik om te starten', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '13px',
      color: '#00529C',
    }).setOrigin(0.5);

    // Bottom orange accent bar
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 4, 0xF57C00).setOrigin(0.5, 1);

    // Keyboard
    this.input.keyboard.on('keydown-ENTER', () => {
      this.startNewGame();
    });
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -5) p.y = GAME_HEIGHT + 5;
      if (p.x < -5) p.x = GAME_WIDTH + 5;
      if (p.x > GAME_WIDTH + 5) p.x = -5;
    });
  }

  startNewGame() {
    // Clear any existing save
    localStorage.removeItem('afasmon_save');

    this.scene.start(SCENES.CHARACTER_CREATE);
  }

  continueGame() {
    const saveData = localStorage.getItem('afasmon_save');
    if (saveData) {
      const data = JSON.parse(saveData);
      this.scene.start(SCENES.WORLD, {
        newGame: false,
        saveData: data,
      });
    } else {
      this.startNewGame();
    }
  }
}
