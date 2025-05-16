class MothNPC extends Phaser.Physics.Arcade.Sprite {


    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.MOTH_SPRITESHEET.key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // --- Physics Setup ---
        this.setCollideWorldBounds(true);
        this.body.allowGravity = false;

        // --- Movement Setup ---
        this.startX = x;
        this.startY = y;
        this.moveTimer = Math.random() * 1000;

        // --- Animations ---
        this.createAnimations();
        this.anims.play(MOTH_CONFIG.ANIM_FLY, true);

        // Apply 2D lighting pipeline
        this.light = null; // Initialize light property
        if (scene.lights?.active) {
             this.setPipeline('Light2D');
             // --- >>> Add Moth's Own Light Source <<< ---
             this.light = this.scene.lights.addLight(
                 this.x, // Initial position X
                 this.y, // Initial position Y
                 MOTH_CONFIG.LIGHT_RADIUS, // Radius from constant
                 MOTH_CONFIG.LIGHT_COLOR,  // Color from constant
                 MOTH_CONFIG.LIGHT_INTENSITY // Intensity from constant
             );
             console.log("Added light source to MothNPC.");
             // --- End Add Light ---
        } else {
             console.warn("Scene lighting not active when MothNPC created, pipeline/light not set.");
        }

        this.setDepth(0);
        console.log(`MothNPC created at (${x}, ${y})`);
    }

    createAnimations() {
        // Avoid creating the same animation multiple times if you spawn more moths
        if (!this.scene.anims.exists(MOTH_CONFIG.ANIM_FLY)) {
            this.scene.anims.create({
                key: MOTH_CONFIG.ANIM_FLY,
                // Generate frame numbers: 0, 1, 2, ... up to FLY_FRAMES - 1
                frames: this.scene.anims.generateFrameNumbers(ASSETS.MOTH_SPRITESHEET.key, {
                    start: 0,
                    end: MOTH_CONFIG.FLY_FRAMES - 1 // Uses the constant we defined
                }),
                frameRate: MOTH_CONFIG.FLY_FRAME_RATE,
                repeat: -1 // Loop the animation forever
            });
            console.log(`Created animation: ${MOTH_CONFIG.ANIM_FLY}`);
        }
    }

    update(time, delta) {
        // --- Movement ---
        this.moveTimer += delta;
        const horizontalOffset = Math.sin(this.moveTimer / (100000 / MOTH_CONFIG.HOVER_SPEED)) * (MOTH_CONFIG.HOVER_RANGE / 2);
        this.x = this.startX + horizontalOffset;
        const verticalOffset = Math.cos(this.moveTimer / (80000 / MOTH_CONFIG.HOVER_SPEED)) * (MOTH_CONFIG.VERTICAL_DRIFT / 2);
        this.y = this.startY + verticalOffset;

        // --- >>> Update Light Position <<< ---
        // Make the light follow the moth's current position
        this.light?.setPosition(this.x, this.y);
        // --- End Update Light ---

        // --- Animation Check ---
        if (!this.anims.isPlaying || this.anims.currentAnim.key !== MOTH_CONFIG.ANIM_FLY) {
             this.anims.play(MOTH_CONFIG.ANIM_FLY, true);
        }
    } // end update

    // --- Add a destroy method to clean up the light ---
    destroy(fromScene) {
        console.log("Destroying MothNPC and its light.");
        // Remove the light source if it exists
        if (this.light) {
            this.scene.lights.removeLight(this.light);
            this.light = null;
        }
        // Call the parent sprite's destroy method
        super.destroy(fromScene);
    }
    // --- End destroy method ---

} // end class


