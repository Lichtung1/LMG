class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log("BootScene: Preloading cutscene assets...");

        // Display a simple "Loading..." text
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2, 'Loading...', {
            fontFamily: 'EccoEpilogue',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // --- Load ALL assets the CutsceneScene will need ---
        
        // Music
        this.load.audio('intro_music', 'assets/sounds/INTRO&TRANSITION.mp3');

        // Spritesheets and Images
        this.load.spritesheet(FLOATING_ANIM_ASSET.key, FLOATING_ANIM_ASSET.file, {
            frameWidth: FLOATING_ANIM_ASSET.frameWidth,
            frameHeight: FLOATING_ANIM_ASSET.frameHeight,
            endFrame: FLOATING_ANIM_ASSET.endFrame
        });

        // Load other assets if they are used in the cutscene
        if (typeof ASSETS !== 'undefined' && typeof WATER_CONFIG !== 'undefined') {
            this.load.spritesheet(ASSETS.WATER_SPRITESHEET.key, ASSETS.WATER_SPRITESHEET.file, {
                frameWidth: WATER_CONFIG.FRAME_WIDTH,
                frameHeight: WATER_CONFIG.FRAME_HEIGHT
            });
            this.load.image(ASSETS.BACKGROUND_ORIGINAL.key, ASSETS.BACKGROUND_ORIGINAL.file);
        }
    }

    create() {
        console.log("BootScene: Preload complete. Transitioning to StartScene.");
        // When loading is done, transition to the "Press to Start" screen
        this.scene.start('StartScene');
    }
}