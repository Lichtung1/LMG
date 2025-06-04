// In Player.js
class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.PLAYER_IDLE.key);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(PLAYER_CONFIG.BOUNCE)
            .setCollideWorldBounds(true)
            .setDepth(PLAYER_CONFIG.DEPTH);

        const offsetX = (PLAYER_CONFIG.SPRITE_WIDTH / 2) - (PLAYER_CONFIG.BODY_WIDTH / 2);
        const offsetY = (PLAYER_CONFIG.SPRITE_HEIGHT / 2) - (PLAYER_CONFIG.BODY_HEIGHT / 2);
        this.body.setSize(PLAYER_CONFIG.BODY_WIDTH, PLAYER_CONFIG.BODY_HEIGHT).setOffset(offsetX, offsetY);

        this.initAnimations();
        this.setPipeline('Light2D');
        this.isControllable = true;

        // --- NEW: Properties for mobile controls ---
        this.isMobileMovingLeft = false;
        this.isMobileMovingRight = false;

        // --- NEW: Property to store current keyboard-driven horizontal speed ---
        // This helps if GameScene needs to manage when keyboard input is processed vs. mobile
        this.keyboardSpeedX = 0; 

        console.log("Player instance created.");
    }

    setControllable(canControl) {
        this.isControllable = canControl;
        if (!canControl) {
            this.body.setVelocityX(0);
            // Reset mobile flags as well if becoming uncontrollable
            this.isMobileMovingLeft = false;
            this.isMobileMovingRight = false;
            if (this.body.onFloor() || this.body.touching.down) {
                this.anims.play(PLAYER_CONFIG.ANIM_IDLE, true);
            }
        }
        console.log(`Player controllable set to: ${canControl}`);
    }

    initAnimations() {
        // Your existing initAnimations() method is good.
        // Make sure PLAYER_CONFIG.ANIM_IDLE, ANIM_RUN, ANIM_JUMP match these keys: 'idle', 'run', 'jump'
        if (!this.scene.anims.exists(PLAYER_CONFIG.ANIM_IDLE)) {
            this.scene.anims.create({
                key: PLAYER_CONFIG.ANIM_IDLE,
                frames: this.scene.anims.generateFrameNumbers(ASSETS.PLAYER_IDLE.key, { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
            console.log(`Created '${PLAYER_CONFIG.ANIM_IDLE}' animation.`);
        }
        if (!this.scene.anims.exists(PLAYER_CONFIG.ANIM_RUN)) {
            this.scene.anims.create({
                key: PLAYER_CONFIG.ANIM_RUN,
                frames: this.scene.anims.generateFrameNumbers(ASSETS.PLAYER_RUN.key, { start: 0, end: 23 }),
                frameRate: 25,
                repeat: -1
            });
            console.log(`Created '${PLAYER_CONFIG.ANIM_RUN}' animation.`);
        }
        if (!this.scene.anims.exists(PLAYER_CONFIG.ANIM_JUMP)) {
            this.scene.anims.create({
                key: PLAYER_CONFIG.ANIM_JUMP,
                frames: this.scene.anims.generateFrameNumbers(ASSETS.PLAYER_JUMP.key, { start: 0, end: 16 }),
                frameRate: 15,
                repeat: 0
            });
            console.log(`Created '${PLAYER_CONFIG.ANIM_JUMP}' animation.`);
        }
        this.anims.play(PLAYER_CONFIG.ANIM_IDLE, true);
    }

    // --- NEW: Methods to be called by GameScene for mobile input ---
    setMobileMoveLeft(isDown) {
        this.isMobileMovingLeft = isDown;
    }

    setMobileMoveRight(isDown) {
        this.isMobileMovingRight = isDown;
    }

    doJump() {
        // Called by GameScene when a jump is triggered by mobile input
        if (!this.active || !this.body || !this.isControllable) return;

        const onGround = this.body.blocked.down || this.body.touching.down;
        if (onGround) {
            this.setVelocityY(PLAYER_CONFIG.JUMP_VELOCITY);
            this.anims.play(PLAYER_CONFIG.ANIM_JUMP, true); // Ensure 'jump' key is correct
            console.log("Player jumped (mobile input)");
        }
    }

    // --- NEW: Method specifically for keyboard input, called by GameScene ---
    handleKeyboardInput(cursors) {
        if (!this.active || !this.isControllable || !cursors || !this.body) {
            this.keyboardSpeedX = 0; // No keyboard input, so no speed from keyboard
            return;
        }

        const onGround = this.body.blocked.down || this.body.touching.down;

        if (cursors.left.isDown) {
            this.keyboardSpeedX = -PLAYER_CONFIG.SPEED;
        } else if (cursors.right.isDown) {
            this.keyboardSpeedX = PLAYER_CONFIG.SPEED;
        } else {
            this.keyboardSpeedX = 0;
        }

        if ((cursors.up.isDown || (cursors.space && cursors.space.isDown)) && onGround) {
            // Jump velocity is applied directly here for keyboard,
            // animation will be handled in the main update based on state.
            this.setVelocityY(PLAYER_CONFIG.JUMP_VELOCITY);
            // We'll let the main update handle playing 'jump' animation
        }
    }

    // --- MODIFIED: Main update method, called by GameScene's update loop ---
    update(time, delta) { // Cursors object is no longer passed directly here
        if (!this.active || !this.body) {
            return;
        }

        let targetVelocityX = 0;
        const onGround = this.body.blocked.down || this.body.touching.down;

        if (this.isControllable) {
            if (this.scene.sys.game.device.os.desktop) {
                // On desktop, keyboardSpeedX would have been set by handleKeyboardInput() in GameScene's update
                targetVelocityX = this.keyboardSpeedX;
            } else {
                // On mobile, use mobile flags
                if (this.isMobileMovingLeft) {
                    targetVelocityX = -PLAYER_CONFIG.SPEED;
                } else if (this.isMobileMovingRight) {
                    targetVelocityX = PLAYER_CONFIG.SPEED;
                }
                // Mobile jump is handled by doJump() called from GameScene
            }
        } // If not controllable, targetVelocityX remains 0

        this.setVelocityX(targetVelocityX);

        // Animation and FlipX logic (consistent for both inputs)
        if (targetVelocityX < 0) { // Moving Left
            this.setFlipX(false); // Your original: false for left
            if (onGround) this.anims.play(PLAYER_CONFIG.ANIM_RUN, true);
        } else if (targetVelocityX > 0) { // Moving Right
            this.setFlipX(true);  // Your original: true for right
            if (onGround) this.anims.play(PLAYER_CONFIG.ANIM_RUN, true);
        } else { // Not moving horizontally
            if (onGround) {
                this.anims.play(PLAYER_CONFIG.ANIM_IDLE, true);
            }
        }

        // Handle jump/fall animation
        if (!onGround) {
            // If the jump animation is set to not repeat (repeat: 0),
            // it will play once. You might need a specific "falling" frame or loop.
            // For now, just playing 'jump' will show the start of the jump.
            // If it's not already playing 'jump' or if 'jump' finished and we're still airborne.
            if (this.anims.currentAnim?.key !== PLAYER_CONFIG.ANIM_JUMP || 
               (this.anims.currentAnim?.key === PLAYER_CONFIG.ANIM_JUMP && !this.anims.isPlaying && this.anims.currentFrame.isLast)) {
                this.anims.play(PLAYER_CONFIG.ANIM_JUMP, true);
            }
        }
    }
}