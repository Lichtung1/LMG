class Bird extends Phaser.Physics.Arcade.Sprite {

    /**
     * Creates a Bird instance.
     * @param {Phaser.Scene} scene The Scene to which this Game Object belongs.
     * @param {number} x The horizontal position of this Game Object in the world.
     * @param {number} y The vertical position of this Game Object in the world.
     * @param {string} type The type of bird ('sleeping' or 'figure8').
     */
    constructor(scene, x, y, type) {

        // Determine initial texture based on type
        const initialTexture = (type === 'sleeping') ? ASSETS.BIRD_SLEEP.key : ASSETS.BIRD_FLY.key;

        // Call the parent constructor
        super(scene, x, y, initialTexture);

        // Add to scene's display list and physics engine
        scene.add.existing(this);
        scene.physics.add.existing(this); // Add physics body

        this.birdType = type;
        this.setDepth(BIRD_CONFIG.DEPTH);
        this.setPipeline('Light2D');

        // Initialize animations for birds
        this.initAnimations();

        // Type-specific setup
        if (this.birdType === 'sleeping') {
            this.setOrigin(0, 0); // Top-left origin for placement matching Tiled object removal
            this.setData('isSleeping', true);
            this.body.setAllowGravity(false); // Don't fall initially
            this.body.setImmovable(true);    // Don't get pushed
            if (this.scene.anims.exists(BIRD_CONFIG.SLEEP_ANIM_KEY)) {
                this.anims.play(BIRD_CONFIG.SLEEP_ANIM_KEY, true);
            }
            console.log(`Created sleeping bird at [${this.x.toFixed(0)}, ${this.y.toFixed(0)}]`);

        } else if (this.birdType === 'figure8') {
            this.setOrigin(0.5, 0.5); // Center origin for path following
            // Set figure 8 path data directly from config (since Tiled loading was removed)
            this.setData({
                isFlyingFigure8: true,
                centerX: FIGURE8_PATH_CONFIG.CENTER_X,
                centerY: FIGURE8_PATH_CONFIG.CENTER_Y,
                widthRadius: FIGURE8_PATH_CONFIG.WIDTH_RADIUS,
                heightRadius: FIGURE8_PATH_CONFIG.HEIGHT_RADIUS,
                flySpeed: FIGURE8_PATH_CONFIG.SPEED,
                currentAngle: FIGURE8_PATH_CONFIG.START_ANGLE
            });
            // Disable physics body for path following
            this.body.setEnable(false);
            if (this.scene.anims.exists(BIRD_CONFIG.FLY_ANIM_KEY)) {
                this.anims.play(BIRD_CONFIG.FLY_ANIM_KEY, true);
            }
             console.log(`Created figure 8 bird around [${FIGURE8_PATH_CONFIG.CENTER_X}, ${FIGURE8_PATH_CONFIG.CENTER_Y}]`);
        }
    }

    initAnimations() {
        // Create sleep animation if it doesn't exist
        if (BIRD_CONFIG.SLEEP_FRAMES > 0 && !this.scene.anims.exists(BIRD_CONFIG.SLEEP_ANIM_KEY)) {
            this.scene.anims.create({
                key: BIRD_CONFIG.SLEEP_ANIM_KEY,
                frames: this.scene.anims.generateFrameNumbers(ASSETS.BIRD_SLEEP.key, { start: 0, end: BIRD_CONFIG.SLEEP_FRAMES - 1 }),
                frameRate: 3,
                repeat: -1
            });
            console.log(`Animation '${BIRD_CONFIG.SLEEP_ANIM_KEY}' created.`);
        }

        // Create fly animation if it doesn't exist
        if (BIRD_CONFIG.FLY_FRAMES > 0 && !this.scene.anims.exists(BIRD_CONFIG.FLY_ANIM_KEY)) {
            this.scene.anims.create({
                key: BIRD_CONFIG.FLY_ANIM_KEY,
                frames: this.scene.anims.generateFrameNumbers(ASSETS.BIRD_FLY.key, { start: 0, end: BIRD_CONFIG.FLY_FRAMES - 1 }),
                frameRate: 12,
                repeat: -1
            });
            console.log(`Animation '${BIRD_CONFIG.FLY_ANIM_KEY}' created.`);
        }
    }

    /**
     * Update loop for the bird.
     * @param {Player} player Reference to the player object.
     * @param {number} time The current timestamp.
     * @param {number} delta The delta time in ms since the last frame.
     * @param {Phaser.Geom.Rectangle} worldView The camera's world view rectangle.
     */
    update(player, time, delta, worldView) {
        if (!this.active) {
            return; // Don't update inactive birds
        }

        const isSleeping = this.getData('isSleeping');
        const isFlyingFigure8 = this.getData('isFlyingFigure8');
        const isFlyingAway = this.getData('isFlyingAway');

        // --- Sleeping Behavior ---
        if (isSleeping) {
            if (!player) return; // Need player to check distance
            const distance = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
            if (distance < BIRD_CONFIG.WAKE_DISTANCE) {
                this.wakeUpAndFlyAway();
            }
        // --- Figure 8 Behavior ---
        } else if (isFlyingFigure8) {
            this.flyFigure8(delta);
        // --- Flying Away Behavior ---
        } else if (isFlyingAway) {
            this.checkBoundsAndDestroy(worldView);
        }
    }

    wakeUpAndFlyAway() {
        console.log("!!! Waking up bird !!!");
        this.setData('isSleeping', false);
        this.setData('isFlyingAway', true); // Now flying away state

        if (this.body) {
            this.body.setEnable(true);      // Ensure body is enabled
            this.body.setImmovable(false);  // Can move now
            this.body.setAllowGravity(false); // Still ignore gravity for fly-away path
            this.setVelocity(BIRD_CONFIG.FLY_SPEED_X, BIRD_CONFIG.FLY_SPEED_Y); // Fly up and right
        }
        if (this.scene.anims.exists(BIRD_CONFIG.FLY_ANIM_KEY)) {
            this.anims.play(BIRD_CONFIG.FLY_ANIM_KEY, true);
        }
        this.setFlipX(false); // Assume fly sprite faces right
        this.setTexture(ASSETS.BIRD_FLY.key); // Change texture to flying bird
    }

    flyFigure8(delta) {
        let currentAngle = this.getData('currentAngle');
        const centerX = this.getData('centerX');
        const centerY = this.getData('centerY');
        const widthRadius = this.getData('widthRadius');
        const heightRadius = this.getData('heightRadius');
        const speed = this.getData('flySpeed');

        // Update angle based on delta time
        currentAngle += speed * (delta / 16.667); // Normalize speed

        // Calculate new position
        const newX = centerX + widthRadius * Math.sin(currentAngle);
        const newY = centerY + heightRadius * Math.sin(2 * currentAngle); // 2*angle makes the figure 8

        this.setPosition(newX, newY);
        this.setData('currentAngle', currentAngle);

        // Flip sprite based on horizontal direction of movement in the path
        this.setFlipX(Math.cos(currentAngle) < 0);
    }

    checkBoundsAndDestroy(worldView) {
        if (!this.body || !worldView) return;

        // Check if bird is way off screen
        const buffer = this.width * 2; // Use actual sprite width if available
        if (this.x > worldView.right + buffer ||
            this.x < worldView.left - buffer || // Added left check
            this.y < worldView.top - buffer ||
            this.y > worldView.bottom + buffer * 2) // Increased bottom buffer slightly
        {
            console.log("Destroying off-screen bird.");
            this.destroy(); // Remove the bird completely
        }
    }

}

// Note: Ensure constants.js is loaded before this file ('Bird.js') in your index.html
// Ensure this file is loaded before game.js