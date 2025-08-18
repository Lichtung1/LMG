class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        const { width, height } = this.scale;

        // Add "Press to Start" text
        const startText = this.add.text(width / 2, height / 2, 'Press to Start', {
            fontFamily: 'EccoEpilogue', // Use your game's font
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#111111',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Optional: Make the text pulse to catch the player's eye
        this.tweens.add({
            targets: startText,
            alpha: 0.5,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Wait for a single click or tap to start the cutscene
        this.input.once('pointerdown', () => {
            console.log("StartScene: Click detected. Starting CutsceneScene.");
            this.scene.start('CutsceneScene');
        });
    }
}