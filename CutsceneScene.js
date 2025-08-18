// --- Cutscene Constants ---
const FLOATING_ANIM_ASSET = {
    key: 'player_float',
    file: 'assets/player_floating.png', // <-- Ensure this path is correct
    frameWidth: 64, // <-- From your working code
    frameHeight: 64, // <-- From your working code
    endFrame: 8 // <-- From your working code (9 frames total, 0-8)
};

const POEM_TEXT = [
    "Mirach to Vindemiatrix allow for my descent",
    "", // Blank line for spacing
    "By land and lake I'll navigate the tides of cognizance",
    "", // Blank line for spacing
    "Please ignite your halo granted if I survive",
    "I'll find the beast pry open its mouth and in it I will dive",
    "", // Blank line for spacing
    "Once I make my way to the end a palace I will find",
    "Lost deep somewhere inside myself empire of the mind",
    "", // Blank line for spacing
    "Lost deep somewhere inside my own empire of the mind"
];

// *** Ensure this font name matches your CSS @font-face rule ***
const TEXT_STYLE = {
    fontFamily: 'EccoEpilogue',
    fontSize: '18px',
    fill: '#ffffff',
    stroke: '#111111',
    strokeThickness: 3,
    align: 'center',
    wordWrap: { width: 750, useAdvancedWrap: true }
};

// --- Text Scroll & Effect Constants ---
const SCROLL_SPEED_PIXELS_PER_SECOND = 13; 
const OSCILLATION_SPEED = 0.001;
const OSCILLATION_AMPLITUDE = 2;

// --- NEW: Fade Out Configuration ---
const FADE_OUT_DURATION = 1500; // Duration of the fade to white (milliseconds)
const FADE_OUT_COLOR_R = 255; // Red component for white
const FADE_OUT_COLOR_G = 255; // Green component for white
const FADE_OUT_COLOR_B = 255; // Blue component for white


// --- Cutscene Lighting ---
const CUTSCENE_LIGHT_CONFIG = {
    radius: 400,
    color: 0xffffff,
    intensity: 1.5
};

// Assuming AMBIENT_LIGHT_COLOR is defined globally or accessible
// If not, define it here: const AMBIENT_LIGHT_COLOR = 0x404050;



class CutsceneScene extends Phaser.Scene {
    constructor() {
        super('CutsceneScene');
        this.poemDisplay = null;
        this.characterSprite = null;
        this.characterLight = null;
        this.scrollTween = null;
        this.baseTextY = 0;
        this.isSkipping = false;
        this.uiManager = null;
        this.introMusic = null;
    }

    preload() {
        // This is now empty because BootScene handles all the loading.
        console.log("CutsceneScene: Preload (nothing to do).");
    }

    create() {
        console.log("CutsceneScene: Creating...");
        this.isSkipping = false;
        const { width: screenWidth, height: screenHeight } = this.scale;

        // --- Initialize Music & UI ---
        this.introMusic = this.sound.add('intro_music', { loop: true, volume: 0.8 });
        this.introMusic.play();
        
        this.uiManager = new UIManager(this);

        // Wait 3 seconds before showing the prompt AND allowing the player to skip.
        this.time.delayedCall(3000, () => {
            // 1. Get the fully interactive container.
            const skipButton = this.uiManager.showSkipPrompt();
            
            // 2. The .setInteractive() line is no longer needed here!
            //    We just add the listeners for hover and click.
            skipButton.on('pointerover', () => {
                this.input.setDefaultCursor('pointer');
            });
            skipButton.on('pointerout', () => {
                this.input.setDefaultCursor('default');
            });
            skipButton.on('pointerdown', () => this.skipCutscene());
        });

        // --- Lighting Setup ---
        const ambientColor = (typeof AMBIENT_LIGHT_COLOR !== 'undefined') ? AMBIENT_LIGHT_COLOR : 0x404050;
        this.lights.enable().setAmbientColor(ambientColor);

        // --- Background Image (Aspect Ratio Maintained) ---
        if (typeof ASSETS !== 'undefined') {
            const bg = this.add.tileSprite(0, 0, screenWidth, screenHeight, ASSETS.BACKGROUND_ORIGINAL.key)
            .setOrigin(0, 0)
            .setDepth(-10)
            .setPipeline('Light2D')
            .setTileScale(0.1, 0.1);
            const screenRatio = screenWidth / screenHeight;
            const imageRatio = bg.width / bg.height;
            let scale = (screenRatio > imageRatio) ? (screenWidth / bg.width) : (screenHeight / bg.height);
            bg.setScale(scale);
        } else {
            console.error("CutsceneScene: ASSETS not available for background image.");
        }

        // --- Water Layer ---
        if (typeof ASSETS !== 'undefined' && typeof WATER_CONFIG !== 'undefined') {
            const waterFrameWidth = WATER_CONFIG.FRAME_WIDTH;
            const numWaterSprites = Math.ceil(screenWidth / waterFrameWidth) + 1;
            for (let i = 0; i < numWaterSprites; i++) {
                const waterX = i * waterFrameWidth;
                const waterY = screenHeight - WATER_CONFIG.FRAME_HEIGHT + 24;
                const waterSprite = this.add.sprite(waterX, waterY, ASSETS.WATER_SPRITESHEET.key)
                    .setOrigin(0, 0)
                    .setDepth(-5)
                    .setPipeline('Light2D');
                if (!this.anims.exists(WATER_CONFIG.ANIM_KEY)) {
                    this.anims.create({
                        key: WATER_CONFIG.ANIM_KEY,
                        frames: this.anims.generateFrameNumbers(ASSETS.WATER_SPRITESHEET.key, { start: 0, end: WATER_CONFIG.NUM_FRAMES - 1 }),
                        frameRate: WATER_CONFIG.FRAME_RATE,
                        repeat: -1
                    });
                }
                waterSprite.play(WATER_CONFIG.ANIM_KEY);
            }
        } else {
            console.error("CutsceneScene: Cannot create water background, ASSETS or WATER_CONFIG missing.");
        }

        this.cameras.main.setBackgroundColor('#0a0a1a');

        // --- Character ---
        try {
            this.characterSprite = this.add.sprite(screenWidth / 2, screenHeight * 0.4, FLOATING_ANIM_ASSET.key)
                .setScale(0.8)
                .setDepth(0)
                .setPipeline('Light2D');
            if (!this.anims.exists('float_anim')) {
                this.anims.create({
                    key: 'float_anim',
                    frames: this.anims.generateFrameNumbers(FLOATING_ANIM_ASSET.key, { start: 0, end: FLOATING_ANIM_ASSET.endFrame }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            this.characterSprite.play('float_anim');
        } catch (error) {
            this.handleError("Failed to create character sprite. Check console and asset details.");
            return;
        }

        // --- Add Character Light ---
        if (this.characterSprite) {
            this.characterLight = this.lights.addLight(this.characterSprite.x, this.characterSprite.y, CUTSCENE_LIGHT_CONFIG.radius)
            .setColor(CUTSCENE_LIGHT_CONFIG.color)
            .setIntensity(CUTSCENE_LIGHT_CONFIG.intensity);
        }

        // --- Text Display Setup (Scrolling Version) ---
        const fullPoem = POEM_TEXT.join('\n');
        const tempText = this.add.text(0, 0, fullPoem, TEXT_STYLE).setVisible(false);
        const textHeight = tempText.height;
        tempText.destroy();
        const startY = screenHeight + (textHeight / 2) + 20;
        const targetY = -(textHeight / 2) - 20;
        const scrollDistance = Math.abs(targetY - startY);
        const calculatedDuration = (scrollDistance / SCROLL_SPEED_PIXELS_PER_SECOND) * 1000;
        this.poemDisplay = this.add.text(screenWidth / 2, startY, fullPoem, TEXT_STYLE)
            .setOrigin(0.5, 0.5)
            .setDepth(10);
        this.baseTextY = this.poemDisplay.y;

        // --- Text Scroll Tween ---
        this.scrollTween = this.tweens.add({
            targets: this.poemDisplay,
            y: targetY,
            duration: calculatedDuration,
            ease: 'Linear',
            onUpdate: (tween, target) => {
                this.baseTextY = target.y;
            },
            onComplete: () => {
                this.startSceneTransition();
            }
        });

        // --- Listener for fade out completion ---
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.scene.start('GameScene');
        });

        // NOTE: The pointerdown listener is no longer here. It's now inside the delayedCall.

        console.log("CutsceneScene: Create complete.");
    }

    update(time, delta) {
        // Keep the character light following the sprite
        if (this.characterLight && this.characterSprite) {
            this.characterLight.x = this.characterSprite.x;
            this.characterLight.y = this.characterSprite.y;
        }

        // Apply oscillation effect to the text while scrolling
        if (this.poemDisplay && this.scrollTween && this.scrollTween.isPlaying()) {
            const oscillationOffset = Math.sin(time * OSCILLATION_SPEED) * OSCILLATION_AMPLITUDE;
            this.poemDisplay.y = this.baseTextY + oscillationOffset;
        }
    }
    
    skipCutscene() {
        // Check is handled in startSceneTransition, but good to have a guard here too
        this.input.setDefaultCursor('default');
        if (this.isSkipping) {
            return;
        }

        // Stop the main animation
        if (this.scrollTween) {
            this.scrollTween.stop();
        }
        
        // Hide the UI prompt
        this.uiManager.hideSkipPrompt();

        // Begin the fade-out sequence for music and camera
        this.startSceneTransition();
    }

    shutdown() {
        // This line can be removed, it doesn't do anything in the new setup.
        // this.input.off('pointerdown', this.skipCutscene, this);

        this.uiManager.hideSkipPrompt();

        if (this.scrollTween) {
            this.scrollTween.stop();
            this.scrollTween = null;
        }
        this.cameras.main.off(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE);
        this.cameras.main.resetFX();
        if (this.introMusic) {
            this.introMusic.stop();
        }
        console.log("CutsceneScene: Shutdown.");
    }

    startSceneTransition() {
        // Use the isSkipping flag to prevent this from running more than once
        if (this.isSkipping) {
            return;
        }
        this.isSkipping = true;

        console.log("CutsceneScene: Starting scene transition...");

        // 1. Fade out the music
        if (this.introMusic) {
            this.tweens.add({
                targets: this.introMusic,
                volume: 0,
                duration: FADE_OUT_DURATION,
                onComplete: () => {
                    this.introMusic.stop();
                }
            });
        }

        // 2. Fade out the camera
        this.cameras.main.fadeOut(FADE_OUT_DURATION, FADE_OUT_COLOR_R, FADE_OUT_COLOR_G, FADE_OUT_COLOR_B);
    }

    // Add error handler consistent with GameScene
    handleError(message) {
        console.error("CutsceneScene Error:", message);
        this.add.text(this.scale.width / 2, this.scale.height / 2, `Cutscene Error:\n${message}\nCheck console.`, {
            color: '#ff0000', fontSize: '16px', backgroundColor: '#000', align: 'center', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setDepth(200);
    }

} // End Scene Class