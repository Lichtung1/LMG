// GatekeeperNPC.js
class GatekeeperNPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.GATEKEEPER_SPRITESHEET.key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.sceneRef = scene; // Store scene reference
        this.setImmovable(true);
        this.body.setAllowGravity(false);
        this.setDepth(1); // Adjust as needed, same as other NPCs
        this.setPipeline('Light2D');

        // Create and play idle animation
        if (GATEKEEPER_CONFIG && ASSETS.GATEKEEPER_SPRITESHEET) {
            if (!scene.anims.exists(GATEKEEPER_CONFIG.ANIM_IDLE)) {
                scene.anims.create({
                    key: GATEKEEPER_CONFIG.ANIM_IDLE,
                    frames: scene.anims.generateFrameNumbers(ASSETS.GATEKEEPER_SPRITESHEET.key, {
                        start: 0,
                        end: GATEKEEPER_CONFIG.IDLE_FRAMES - 1 // Assumes 0-indexed frames
                    }),
                    frameRate: GATEKEEPER_CONFIG.IDLE_FRAME_RATE,
                    repeat: -1
                });
            }
            this.play(GATEKEEPER_CONFIG.ANIM_IDLE);
        } else {
            console.error("GatekeeperNPC: GATEKEEPER_CONFIG or ASSETS.GATEKEEPER_SPRITESHEET not defined. Cannot create animation.");
        }

        // Optional: Add a light source for the Gatekeeper
        if (scene.lights && scene.lights.active && GATEKEEPER_CONFIG.LIGHT_RADIUS > 0) {
            this.light = scene.lights.addLight(
                this.x, this.y,
                GATEKEEPER_CONFIG.LIGHT_RADIUS,
                GATEKEEPER_CONFIG.LIGHT_COLOR,
                GATEKEEPER_CONFIG.LIGHT_INTENSITY
            );
        }
        console.log(`GatekeeperNPC created at (${x.toFixed(0)}, ${y.toFixed(0)})`);
    }

    update(time, delta) {
        // Update light position if it exists
        if (this.light && this.active) {
            this.light.setPosition(this.x, this.y);
        }
        // Add any other idle behavior here if needed (e.g., slight bobbing)
    }

    onDialogueStart() {
        console.log("GatekeeperNPC: Dialogue started.");
        // e.g., this.anims.play('gatekeeper_talking_anim'); if you have one
    }

    onDialogueEnd() {
        console.log("GatekeeperNPC: Dialogue ended.");
        // e.g., this.anims.play(GATEKEEPER_CONFIG.ANIM_IDLE);
    }

    destroy(fromScene) {
        if (this.light) {
            this.sceneRef.lights.removeLight(this.light);
            this.light = null;
        }
        super.destroy(fromScene);
    }
}
// Add this at the very end of the file to confirm parsing:
// console.log("GatekeeperNPC.js file parsed and GatekeeperNPC class defined.");