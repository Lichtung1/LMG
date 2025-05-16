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
    const SCROLL_SPEED_PIXELS_PER_SECOND = 25; // Tune this value for scroll speed (Higher = faster)
    const OSCILLATION_SPEED = 0.001;
    const OSCILLATION_AMPLITUDE = 2;
    // const STALL_DURATION = 1500; // No longer needed, fade duration handles the pause

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


    // --- Phaser Scene ---
    class CutsceneScene extends Phaser.Scene {
        constructor() {
            super('CutsceneScene');
            this.poemDisplay = null;
            this.characterSprite = null;
            this.characterLight = null;
            this.scrollTween = null;
            this.baseTextY = 0;
        }

        preload() {
            console.log("CutsceneScene: Preloading...");
            // Load water (Ensure ASSETS and WATER_CONFIG are available)
            if (typeof ASSETS !== 'undefined' && typeof WATER_CONFIG !== 'undefined') {
                this.load.spritesheet(ASSETS.WATER_SPRITESHEET.key, ASSETS.WATER_SPRITESHEET.file, {
                    frameWidth: WATER_CONFIG.FRAME_WIDTH,
                    frameHeight: WATER_CONFIG.FRAME_HEIGHT
                });
                // Load the main background image
                this.load.image(ASSETS.BACKGROUND_ORIGINAL.key, ASSETS.BACKGROUND_ORIGINAL.file);
            } else {
                console.error("CutsceneScene: ASSETS or WATER_CONFIG not available for loading.");
            }

            // Load floating animation
            console.log(`CutsceneScene: Loading spritesheet key '${FLOATING_ANIM_ASSET.key}' from '${FLOATING_ANIM_ASSET.file}' (Frame: ${FLOATING_ANIM_ASSET.frameWidth}x${FLOATING_ANIM_ASSET.frameHeight}, EndFrame: ${FLOATING_ANIM_ASSET.endFrame})`);
            this.load.spritesheet(FLOATING_ANIM_ASSET.key, FLOATING_ANIM_ASSET.file, {
                frameWidth: FLOATING_ANIM_ASSET.frameWidth,
                frameHeight: FLOATING_ANIM_ASSET.frameHeight,
                endFrame: FLOATING_ANIM_ASSET.endFrame
            });

            console.log("CutsceneScene: Preload complete.");
        }

        create() {
            console.log("CutsceneScene: Creating...");
            const { width: screenWidth, height: screenHeight } = this.scale; // Use more descriptive names

            // --- Lighting Setup ---
            const ambientColor = (typeof AMBIENT_LIGHT_COLOR !== 'undefined') ? AMBIENT_LIGHT_COLOR : 0x404050;
            this.lights.enable().setAmbientColor(ambientColor);
            console.log(`CutsceneScene: Lighting enabled with ambient color ${ambientColor.toString(16)}`);

            // --- Background Image (Aspect Ratio Maintained) ---
            if (typeof ASSETS !== 'undefined') {
                const bg = this.add.tileSprite(0, 0, screenWidth, screenHeight, ASSETS.BACKGROUND_ORIGINAL.key) // Changed here
                .setOrigin(0, 0)       // Usually 0,0 for TileSprite covering screen
                .setDepth(-10)
                .setPipeline('Light2D')
                // Optional: Add scaling for the tile pattern density
                .setTileScale(0.1, 0.1);

                // Calculate aspect ratios
                const screenRatio = screenWidth / screenHeight;
                const imageRatio = bg.width / bg.height;

                let scale = 1;
                if (screenRatio > imageRatio) {
                    // Screen is wider than image aspect ratio -> scale based on width
                    scale = screenWidth / bg.width;
                } else {
                    // Screen is taller than image aspect ratio (or same) -> scale based on height
                    scale = screenHeight / bg.height;
                }

                bg.setScale(scale); // Apply the calculated scale
                console.log(`Background scaled by ${scale.toFixed(2)} to maintain aspect ratio.`);

            } else {
                console.error("CutsceneScene: ASSETS not available for background image.");
            }


            // --- Water Layer ---
            if (typeof ASSETS !== 'undefined' && typeof WATER_CONFIG !== 'undefined') {
                const waterFrameWidth = WATER_CONFIG.FRAME_WIDTH;
                const numWaterSprites = Math.ceil(screenWidth / waterFrameWidth) + 1; // Use screenWidth

                for (let i = 0; i < numWaterSprites; i++) {
                    const waterX = i * waterFrameWidth;
                    const waterY = screenHeight - WATER_CONFIG.FRAME_HEIGHT + 24; // Use screenHeight
                    const waterSprite = this.add.sprite(waterX, waterY, ASSETS.WATER_SPRITESHEET.key)
                        .setOrigin(0, 0)
                        .setDepth(-5)
                        .setPipeline('Light2D');

                    // Ensure water animation exists or create it
                    if (this.anims.exists(WATER_CONFIG.ANIM_KEY)) {
                        waterSprite.play(WATER_CONFIG.ANIM_KEY);
                    } else {
                        try {
                            this.anims.create({
                                key: WATER_CONFIG.ANIM_KEY,
                                frames: this.anims.generateFrameNumbers(ASSETS.WATER_SPRITESHEET.key, { start: 0, end: WATER_CONFIG.NUM_FRAMES - 1 }),
                                frameRate: WATER_CONFIG.FRAME_RATE,
                                repeat: -1
                            });
                            waterSprite.play(WATER_CONFIG.ANIM_KEY);
                            console.log(`CutsceneScene: Created and playing water animation '${WATER_CONFIG.ANIM_KEY}'.`);
                        } catch (e) {
                            console.warn(`CutsceneScene: Water animation key "${WATER_CONFIG.ANIM_KEY}" not found and could not be created. Error:`, e);
                        }
                    }
                }
            } else {
                console.error("CutsceneScene: Cannot create water background, ASSETS or WATER_CONFIG missing.");
            }

            this.cameras.main.setBackgroundColor('#0a0a1a');

            // --- Character ---
            console.log(`CutsceneScene: Creating character sprite with key '${FLOATING_ANIM_ASSET.key}'...`);
            try {
                this.characterSprite = this.add.sprite(screenWidth / 2, screenHeight * 0.4, FLOATING_ANIM_ASSET.key) // Use screenWidth/Height
                    .setScale(0.8)
                    .setDepth(0)
                    .setPipeline('Light2D');

                // Create floating animation
                if (!this.anims.exists('float_anim')) {
                    console.log(`CutsceneScene: Creating animation 'float_anim' using key '${FLOATING_ANIM_ASSET.key}'...`);
                    this.anims.create({
                        key: 'float_anim',
                        frames: this.anims.generateFrameNumbers(FLOATING_ANIM_ASSET.key, { start: 0, end: FLOATING_ANIM_ASSET.endFrame }),
                        frameRate: 10,
                        repeat: -1
                    });
                }
                this.characterSprite.play('float_anim');
                console.log("CutsceneScene: Character sprite created and animation started.");

            } catch (error) {
                console.error("CutsceneScene: Error creating character sprite or animation:", error);
                this.handleError("Failed to create character sprite. Check console and asset details.");
                return;
            }

            // --- Add Character Light ---
            if (this.characterSprite) {
                this.characterLight = this.lights.addLight(
                    this.characterSprite.x, this.characterSprite.y,
                    CUTSCENE_LIGHT_CONFIG.radius
                )
                .setColor(CUTSCENE_LIGHT_CONFIG.color)
                .setIntensity(CUTSCENE_LIGHT_CONFIG.intensity);
                console.log("CutsceneScene: Added character light.");
            }

            // --- Text Display Setup (Scrolling Version) ---
            const fullPoem = POEM_TEXT.join('\n');
            const tempText = this.add.text(0, 0, fullPoem, TEXT_STYLE).setVisible(false);
            const textHeight = tempText.height;
            tempText.destroy();

            const startY = screenHeight + (textHeight / 2) + 20; // Use screenHeight
            const targetY = -(textHeight / 2) - 20;
            const scrollDistance = Math.abs(targetY - startY);

            const calculatedDuration = (scrollDistance / SCROLL_SPEED_PIXELS_PER_SECOND) * 1000;

            this.poemDisplay = this.add.text(screenWidth / 2, startY, fullPoem, TEXT_STYLE) // Use screenWidth
                .setOrigin(0.5, 0.5)
                .setDepth(10);

            this.baseTextY = this.poemDisplay.y;

            // --- Text Scroll Tween ---
            console.log(`CutsceneScene: Starting text scroll. Distance: ${scrollDistance.toFixed(0)}px, Speed: ${SCROLL_SPEED_PIXELS_PER_SECOND}px/s, Duration: ${(calculatedDuration / 1000).toFixed(1)}s`);
            this.scrollTween = this.tweens.add({
                targets: this.poemDisplay,
                y: targetY,
                duration: calculatedDuration,
                ease: 'Linear',
                onUpdate: (tween, target) => {
                    this.baseTextY = target.y;
                },
                onComplete: () => {
                    console.log("CutsceneScene: Scroll tween finished. Starting fade out...");
                    this.cameras.main.fadeOut(FADE_OUT_DURATION, FADE_OUT_COLOR_R, FADE_OUT_COLOR_G, FADE_OUT_COLOR_B);
                }
            });

            // --- Listener for fade out completion ---
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                console.log("CutsceneScene: Fade out complete. Transitioning to GameScene...");
                this.scene.start('GameScene');
            });


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

        shutdown() {
            if (this.scrollTween) {
                this.scrollTween.stop();
                this.scrollTween = null;
            }
            // Clean up camera effects and listeners on shutdown
            this.cameras.main.off(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE);
            this.cameras.main.resetFX(); // Reset any ongoing fades
            console.log("CutsceneScene: Shutdown.");
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
