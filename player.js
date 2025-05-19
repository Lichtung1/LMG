class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        // Call the sprite constructor
        super(scene, x, y, ASSETS.PLAYER_IDLE.key);

        // Add this player object to the scene's display list and physics system
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Setup player physics properties
        this.setBounce(PLAYER_CONFIG.BOUNCE)
            .setCollideWorldBounds(true)
            .setDepth(PLAYER_CONFIG.DEPTH);

        // Adjust physics body size and offset
        const offsetX = (PLAYER_CONFIG.SPRITE_WIDTH / 2) - (PLAYER_CONFIG.BODY_WIDTH / 2);
        const offsetY = (PLAYER_CONFIG.SPRITE_HEIGHT / 2) - (PLAYER_CONFIG.BODY_HEIGHT / 2);
        this.body.setSize(PLAYER_CONFIG.BODY_WIDTH, PLAYER_CONFIG.BODY_HEIGHT).setOffset(offsetX, offsetY);

        // Initialize animations specific to the player
        this.initAnimations();

        // Apply lighting pipeline
        this.setPipeline('Light2D');
        this.isControllable = true; 
        
        console.log("Player instance created.");
    }

    setControllable(canControl) {
        this.isControllable = canControl; // Assuming you have an isControllable flag
        if (!canControl) {
            this.body.setVelocityX(0); // Stop movement
            if (this.body.onFloor()) { // Or your grounded check
                this.anims.play(PLAYER_CONFIG.ANIM_IDLE, true);
            }
        }
        console.log(`Player controllable set to: ${canControl}`);
    }

    // Create animations needed by the player instance
    initAnimations() {
        if (!this.scene.anims.exists('idle')) { // You're using the string 'idle'
            this.scene.anims.create({
                key: 'idle', // Animation created with key 'idle'
                frames: this.scene.anims.generateFrameNumbers(ASSETS.PLAYER_IDLE.key, { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
            console.log("Created 'idle' animation.");
        }
        if (!this.scene.anims.exists('run')) {
            this.scene.anims.create({
                key: 'run',
                frames: this.scene.anims.generateFrameNumbers(ASSETS.PLAYER_RUN.key, { start: 0, end: 23 }),
                frameRate: 25,
                repeat: -1
            });
             console.log("Created 'run' animation.");
        }
        if (!this.scene.anims.exists('jump')) {
             this.scene.anims.create({
                 key: 'jump',
                 frames: this.scene.anims.generateFrameNumbers(ASSETS.PLAYER_JUMP.key, { start: 0, end: 16 }),
                 frameRate: 15,
                 repeat: 0 // Don't repeat jump animation
             });
             console.log("Created 'jump' animation.");
        }
         // Start idle animation by default
        this.anims.play('idle', true);
    }

    // Update method called by the scene's update loop
    update(cursors) {
        if (!this.active) return;

        if (!this.isControllable) { // Check this flag
            return; // Skip movement input
        }

        if (!cursors || !this.body) {
            return; // Exit if cursors or body aren't available
        }

        const onGround = this.body.blocked.down || this.body.touching.down;

        // Horizontal Movement
        if (cursors.left.isDown) {
            this.setVelocityX(-PLAYER_CONFIG.SPEED);
            this.setFlipX(false); // Flip sprite to face left
            if (onGround) {
                this.anims.play('run', true);
            }
        } else if (cursors.right.isDown) {
            this.setVelocityX(PLAYER_CONFIG.SPEED);
            this.setFlipX(true); // Default sprite facing right
            if (onGround) {
                this.anims.play('run', true);
            }
        } else {
            // No horizontal movement
            this.setVelocityX(0);
            if (onGround) {
                this.anims.play('idle', true);
            }
        }

        // Jumping
        if (cursors.up.isDown && onGround) {
            this.setVelocityY(PLAYER_CONFIG.JUMP_VELOCITY);
            this.anims.play('jump', true);
        }

        // Handle jump animation when in the air
        if (!onGround && this.body.velocity.y !== 0) {
            // Ensure jump animation plays if not already playing
            if (this.anims.currentAnim?.key !== 'jump' || !this.anims.isPlaying) {
                 this.anims.play('jump', true);
            }
        }
    }
}

// Note: Ensure constants.js is loaded before this file ('Player.js') in your index.html
// Ensure this file is loaded before game.js