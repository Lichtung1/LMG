// LunaMothNPC.js - (Create this new file)

class LunaMothNPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, playerToFollow) {
        super(scene, x, y, ASSETS.LUNA_MOTH_SPRITESHEET.key); // Uses LUNA_MOTH_SPRITESHEET
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.sceneRef = scene;
        this.player = playerToFollow;

        this.setCollideWorldBounds(true);
        this.body.allowGravity = false;
        this.setImmovable(true);

        // Animations (ensure LUNA_MOTH_CONFIG is defined and used)
        this.createAnimations();
        this.anims.play(LUNA_MOTH_CONFIG.ANIM_FLY, true);

        this.light = null;
        if (scene.lights?.active) {
            this.setPipeline('Light2D');
            this.light = this.sceneRef.lights.addLight(
                this.x, this.y,
                LUNA_MOTH_CONFIG.LIGHT_RADIUS,
                LUNA_MOTH_CONFIG.LIGHT_COLOR,
                LUNA_MOTH_CONFIG.LIGHT_INTENSITY
            );
        }
        this.setDepth(0); // Adjust as needed
        console.log(`LunaMothNPC created at (${x}, ${y})`);

        this.state = 'IDLE_WAITING'; // Possible states: IDLE_WAITING, LEADING, ARRIVED_AT_VIKING
        this.waypoints = [];
        this.currentWaypointIndex = 0;
        this.leadSpeed = LUNA_MOTH_CONFIG.LEAD_SPEED || 70;
        this.arrivalThreshold = 10; // How close to a waypoint to consider it reached
        this.followDistanceMax = 250; // If player is further than this, moth might wait
        this.waitTimer = 0;
    }

    createAnimations() {
        // Ensure LUNA_MOTH_CONFIG and ASSETS.LUNA_MOTH_SPRITESHEET are defined
        if (!this.sceneRef.anims.exists(LUNA_MOTH_CONFIG.ANIM_FLY)) {
            this.sceneRef.anims.create({
                key: LUNA_MOTH_CONFIG.ANIM_FLY,
                frames: this.sceneRef.anims.generateFrameNumbers(ASSETS.LUNA_MOTH_SPRITESHEET.key, {
                    start: 0, end: LUNA_MOTH_CONFIG.FLY_FRAMES - 1
                }),
                frameRate: LUNA_MOTH_CONFIG.FLY_FRAME_RATE,
                repeat: -1
            });
            console.log(`Created animation: ${LUNA_MOTH_CONFIG.ANIM_FLY} for Luna Moth`);
        }
    }

    startLeadingSequence(waypoints) {
        if (!waypoints || waypoints.length === 0) {
            console.error("LunaMothNPC: No waypoints provided for leading!");
            this.state = 'IDLE_WAITING';
            return;
        }
        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
        this.state = 'LEADING';
        console.log("LunaMothNPC is now leading the player.");
    }

    update(time, delta) {
        this.light?.setPosition(this.x, this.y);

        if (this.state === 'LEADING') {
            if (this.currentWaypointIndex >= this.waypoints.length) {
                // This case should ideally be caught by the arrival at the last waypoint
                this.state = 'ARRIVED_AT_VIKING';
                this.body.setVelocity(0, 0);
                if (typeof this.sceneRef.lunaMothArrivedAtDestination === 'function') {
                    this.sceneRef.lunaMothArrivedAtDestination();
                }
                return;
            }

            const targetPos = this.waypoints[this.currentWaypointIndex];
            const distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, targetPos.x, targetPos.y);

            if (distanceToTarget < this.arrivalThreshold) {
                this.currentWaypointIndex++;
                if (this.currentWaypointIndex >= this.waypoints.length) { // Reached the end
                    this.state = 'ARRIVED_AT_VIKING';
                    this.body.setVelocity(0, 0);
                    console.log("LunaMothNPC has arrived at the final destination.");
                    if (typeof this.sceneRef.lunaMothArrivedAtDestination === 'function') {
                        this.sceneRef.lunaMothArrivedAtDestination();
                    }
                    return;
                }
                // Else, new waypoint target is set for the next iteration, continue moving immediately
            }

            // Check player distance only if actively leading to a waypoint
            if (this.player) {
                const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
                if (distanceToPlayer > this.followDistanceMax && time > this.waitTimer) {
                    console.log("LunaMothNPC: Player is too far, slowing down/waiting.");
                    this.body.setVelocity(this.body.velocity.x * 0.5, this.body.velocity.y * 0.5); // Slow down
                    this.waitTimer = time + 1500; // Check again after a bit
                } else {
                     this.sceneRef.physics.moveTo(this, targetPos.x, targetPos.y, this.leadSpeed);
                }
            } else { // No player reference, just move to waypoint
                this.sceneRef.physics.moveTo(this, targetPos.x, targetPos.y, this.leadSpeed);
            }


            // Flip sprite based on movement direction
            if (this.body.velocity.x > 0.1) this.setFlipX(false);
            else if (this.body.velocity.x < -0.1) this.setFlipX(true);

        } else if (this.state === 'IDLE_WAITING') {
            // Luna moth is initially still or has a gentle hover before interaction
            // For simplicity, let's make it stay still
            this.body.setVelocity(0,0);
        }


        if (this.state !== 'ARRIVED_AT_VIKING' && (!this.anims.isPlaying || this.anims.currentAnim?.key !== LUNA_MOTH_CONFIG.ANIM_FLY)) {
            if (this.anims.get(LUNA_MOTH_CONFIG.ANIM_FLY)) {
                 this.anims.play(LUNA_MOTH_CONFIG.ANIM_FLY, true);
            }
        }
    }

    onDialogueStart() {
        if (this.state === 'LEADING') {
            this.body.setVelocity(0,0); // Stop moving during dialogue
        }
        console.log("LunaMothNPC onDialogueStart.");
    }

    onDialogueEnd(startLeadingAfter = false, waypoints = []) {
        if (startLeadingAfter) {
            this.startLeadingSequence(waypoints);
        } else if (this.state === 'LEADING') { // Resuming leading after an interruption
            if (this.currentWaypointIndex < this.waypoints.length) {
                 const targetPos = this.waypoints[this.currentWaypointIndex];
                 this.sceneRef.physics.moveTo(this, targetPos.x, targetPos.y, this.leadSpeed);
            }
        }
        console.log("LunaMothNPC onDialogueEnd.");
    }

    destroy(fromScene) {
        console.log("Destroying LunaMothNPC and its light.");
        if (this.light) {
            this.sceneRef.lights.removeLight(this.light);
            this.light = null;
        }
        super.destroy(fromScene);
    }
}