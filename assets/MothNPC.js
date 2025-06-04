// MothNPC.js - 
// Atlas Moth's behavior

class MothNPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.MOTH_SPRITESHEET.key); // Uses original MOTH_SPRITESHEET
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics Setup
        this.setCollideWorldBounds(true);
        this.body.allowGravity = false;

        // Movement Setup (as per your original)
        this.startX = x;
        this.startY = y;
        this.moveTimer = Math.random() * 1000;

        // Animations (ensure MOTH_CONFIG is for Atlas Moth)
        this.createAnimations();
        this.anims.play(MOTH_CONFIG.ANIM_FLY, true);

        this.light = null;
        if (scene.lights?.active) {
            this.setPipeline('Light2D');
            this.light = this.scene.lights.addLight(
                this.x, this.y,
                MOTH_CONFIG.LIGHT_RADIUS,
                MOTH_CONFIG.LIGHT_COLOR,
                MOTH_CONFIG.LIGHT_INTENSITY
            );
            console.log("Added light source to MothNPC (Atlas).");
        }
        this.setDepth(0);
        console.log(`MothNPC (Atlas) created at (${x}, ${y})`);
    }

    createAnimations() {
        if (!this.scene.anims.exists(MOTH_CONFIG.ANIM_FLY)) {
            this.scene.anims.create({
                key: MOTH_CONFIG.ANIM_FLY,
                frames: this.scene.anims.generateFrameNumbers(ASSETS.MOTH_SPRITESHEET.key, {
                    start: 0, end: MOTH_CONFIG.FLY_FRAMES - 1
                }),
                frameRate: MOTH_CONFIG.FLY_FRAME_RATE,
                repeat: -1
            });
            console.log(`Created animation: ${MOTH_CONFIG.ANIM_FLY} for Atlas Moth`);
        }
    }

    update(time, delta) {
        // Original Atlas Moth Movement
        this.moveTimer += delta;
        const horizontalOffset = Math.sin(this.moveTimer / (100000 / MOTH_CONFIG.HOVER_SPEED)) * (MOTH_CONFIG.HOVER_RANGE / 2);
        this.x = this.startX + horizontalOffset;
        const verticalOffset = Math.cos(this.moveTimer / (80000 / MOTH_CONFIG.HOVER_SPEED)) * (MOTH_CONFIG.VERTICAL_DRIFT / 2);
        this.y = this.startY + verticalOffset;
        this.body.updateFromGameObject(); // Important if not using setVelocity for hover

        this.light?.setPosition(this.x, this.y);

        if (!this.anims.isPlaying || this.anims.currentAnim.key !== MOTH_CONFIG.ANIM_FLY) {
            this.anims.play(MOTH_CONFIG.ANIM_FLY, true);
        }
    }

    // Optional: if Atlas moth needs to react to dialogue
    onDialogueStart() {
        console.log("MothNPC (Atlas) onDialogueStart: Pausing hover or changing state.");
        // Example: this.body.setVelocity(0,0); or change animation
    }

    onDialogueEnd() {
         console.log("MothNPC (Atlas) onDialogueEnd: Resuming hover.");
        // Example: Resume movement
    }

    destroy(fromScene) {
        console.log("Destroying MothNPC (Atlas) and its light.");
        if (this.light) {
            this.scene.lights.removeLight(this.light);
            this.light = null;
        }
        super.destroy(fromScene);
    }
}