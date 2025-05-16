// MargotNPC.js
class MargotNPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.MARGOT_IDLE.key);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setAllowGravity(false);
        this.setScale(1);
        this.setDepth(1);
        this.setPipeline('Light2D');

        this.scene = scene;
        this.isInteracting = false;
        this.hasInteracted = false;
        this.walkSpeed = MARGOT_CONFIG.WALK_SPEED;

        // --- Create Margot's Personal Light ---
        if (this.scene.lights && this.scene.lights.active) { // Check if lighting system is enabled
            this.light = this.scene.lights.addLight(
                this.x,
                this.y,
                MARGOT_CONFIG.LIGHT_RADIUS,
                MARGOT_CONFIG.LIGHT_COLOR,
                MARGOT_CONFIG.LIGHT_INTENSITY
            );
        } else {
            this.light = null;
            console.warn("Lighting system not active. Margot's light not created.");
        }

        // -- ANIMATIONS (using MARGOT_CONFIG) --
        if (!scene.anims.exists(MARGOT_CONFIG.ANIM_IDLE)) {
            scene.anims.create({
                key: MARGOT_CONFIG.ANIM_IDLE,
                frames: scene.anims.generateFrameNumbers(ASSETS.MARGOT_IDLE.key, {
                    start: 0,
                    end: MARGOT_CONFIG.IDLE_FRAMES - 1
                }),
                frameRate: MARGOT_CONFIG.IDLE_FRAME_RATE,
                repeat: -1
            });
        }

        if (!scene.anims.exists(MARGOT_CONFIG.ANIM_WALK)) {
            scene.anims.create({
                key: MARGOT_CONFIG.ANIM_WALK,
                frames: scene.anims.generateFrameNumbers(ASSETS.MARGOT_WALK.key, {
                    start: 0,
                    end: MARGOT_CONFIG.WALK_FRAMES - 1
                }),
                frameRate: MARGOT_CONFIG.WALK_FRAME_RATE,
                repeat: -1
            });
        }

        this.play(MARGOT_CONFIG.ANIM_IDLE);
        this.dialogueState = 0;
    }

    update(time, delta) {
        // Margot's specific update logic

        // --- Update light position to follow Margot ---
        if (this.light && this.active) { // Check if light exists and Margot is active
            this.light.setPosition(this.x, this.y);
        }
    }

    startInteraction() {
        if (this.hasInteracted || this.isInteracting) {
            return;
        }
        this.isInteracting = true;
        this.hasInteracted = true;
        if (this.scene.player && typeof this.scene.player.setControllable === 'function') {
            this.scene.player.setControllable(false);
        }
        this.playDialogueAndActions();
    }

    playDialogueAndActions() {
        switch (this.dialogueState) {
            case 0:
                this.scene.uiManager.startDialogueSequence('margot_encounter_1', () => {
                    this.dialogueState = 1;
                    this.playDialogueAndActions();
                });
                break;
            case 1:
                console.log("Margot: (No response, starts walking away)");
                this.play(MARGOT_CONFIG.ANIM_WALK);
                this.setVelocityX(this.walkSpeed);
                this.scene.time.delayedCall(2000, () => {
                    this.dialogueState = 2;
                    this.playDialogueAndActions();
                }, [], this);
                break;
            case 2:
                this.scene.uiManager.startDialogueSequence('margot_encounter_2', () => {
                    this.dialogueState = 3;
                    this.playDialogueAndActions();
                });
                break;
            case 3:
                console.log("Margot: (Continues walking away)");
                this.scene.tweens.add({
                    targets: this,
                    x: this.x + 200,
                    duration: 3000,
                    ease: 'Linear',
                    onComplete: () => {
                        this.setVisible(false);
                        this.setActive(false);
                        if (this.scene.player && typeof this.scene.player.setControllable === 'function') {
                            this.scene.player.setControllable(true);
                        }
                        this.isInteracting = false;
                        this.dialogueState = 4;
                    }
                });
                break;
            case 4:
                console.log("Margot interaction sequence fully complete.");
                break;
        }
    }
}