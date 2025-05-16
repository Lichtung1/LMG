// FishFly.js
class FishFly extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, textureKey, playerTarget, initialSpawnX, initialSpawnY, config = FISHFLIES_CONFIG) {
        super(scene, x, y, textureKey);
        this.scene = scene;

        // Create a somewhat unique ID for this instance for logging
        this.flyId = `FishFly_${initialSpawnX.toFixed(0)}_${initialSpawnY.toFixed(0)}_${(Math.random() * 10000).toFixed(0)}`;

        // Essential properties
        this.playerTarget = playerTarget;
        this.initialSpawnX = initialSpawnX;
        this.initialSpawnY = initialSpawnY;
        this.config = config; // Store the passed config

        this.state = 'emerging'; // Initial state
        this.hasLoggedBuzzing = false; // For one-time debug logging inside the buzzing state

        // Individualized parameters from config
        this.offsetXFromPlayerHead = Phaser.Math.FloatBetween(this.config.PLAYER_OFFSET_X.min, this.config.PLAYER_OFFSET_X.max);
        this.offsetYFromPlayerHead = Phaser.Math.FloatBetween(this.config.PLAYER_OFFSET_Y.min, this.config.PLAYER_OFFSET_Y.max);

        this.currentFig8CenterX = x;
        this.currentFig8CenterY = y;

        this.baseRadiusX = Phaser.Math.FloatBetween(this.config.FIGURE8_RADIUS_X.min, this.config.FIGURE8_RADIUS_X.max);
        this.baseRadiusY = Phaser.Math.FloatBetween(this.config.FIGURE8_RADIUS_Y.min, this.config.FIGURE8_RADIUS_Y.max);
        this.figure8Speed = Phaser.Math.FloatBetween(this.config.FIGURE8_SPEED.min, this.config.FIGURE8_SPEED.max) * Phaser.Math.RND.pick([-1, 1]);
        this.currentAngle = Phaser.Math.FloatBetween(0, this.config.FIGURE8_PHASE_OFFSET_MAX);

        this.radiusAmplitude = Phaser.Math.FloatBetween(this.config.FIGURE8_RADIUS_OSCILLATION.amplitude * 0.5, this.config.FIGURE8_RADIUS_OSCILLATION.amplitude * 1.5);
        this.radiusOscSpeed = Phaser.Math.FloatBetween(this.config.FIGURE8_RADIUS_OSCILLATION.speed * 0.5, this.config.FIGURE8_RADIUS_OSCILLATION.speed * 1.5) * Phaser.Math.RND.pick([-1, 1]);

        this.yBobAmplitude = Phaser.Math.FloatBetween(this.config.Y_BOB_AMPLITUDE.min, this.config.Y_BOB_AMPLITUDE.max);
        this.yBobSpeed = Phaser.Math.FloatBetween(this.config.Y_BOB_SPEED.min, this.config.Y_BOB_SPEED.max) * Phaser.Math.RND.pick([-1, 1]);
        this.currentYBobAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        // Sprite appearance and pipeline
        let scaleFactor = 1; // Default scale
        if (this.config.SIZE && typeof this.config.SIZE.max === 'number' && this.config.SIZE.max > 0) {
            scaleFactor = (this.config.SIZE.min === this.config.SIZE.max) ?
                this.config.SIZE.min / this.config.SIZE.max :
                Phaser.Math.FloatBetween(this.config.SIZE.min, this.config.SIZE.max) / this.config.SIZE.max;
        } else if (this.config.SIZE && typeof this.config.SIZE.min === 'number' && this.config.SIZE.min > 0) {
            scaleFactor = 1; // Fallback if max is 0 or invalid but min is valid
        }
        
        this.setAlpha(Phaser.Math.FloatBetween(this.config.ALPHA.min, this.config.ALPHA.max))
            .setScale(Math.max(0.01, scaleFactor)) // Ensure scale is not zero or negative
            .setDepth(this.playerTarget.depth + this.config.DEPTH_OFFSET_FROM_PLAYER)
            .setPipeline('Light2D');

        this.scene.add.existing(this);

        // Initial Emerge Tween
        const emergeTargetX = this.playerTarget.x + this.offsetXFromPlayerHead;
        const emergeTargetY = this.playerTarget.y + this.offsetYFromPlayerHead;
        const emergeDuration = Phaser.Math.Between(this.config.EMERGE_DURATION.min, this.config.EMERGE_DURATION.max);

        this.scene.tweens.add({
            targets: this,
            x: emergeTargetX,
            y: emergeTargetY,
            duration: emergeDuration,
            ease: 'Quad.easeOut',
            onComplete: () => {
                if (this.active) {
                    this.state = 'buzzing';
                    this.currentFig8CenterX = this.x;
                    this.currentFig8CenterY = this.y;
                } else {
                }
            }
        });
    } // End of constructor

    update(time, delta) {
        // Log entry to update and current state for this fly instance. This will be spammy.

        if (!this.active) {
            return;
        }
        if (!this.playerTarget || !this.playerTarget.active) {
            // If player is gone, fishfly might decide to despawn or go idle.
            return;
        }

        if (this.state === 'buzzing') {    
            const desiredFig8CenterX = this.playerTarget.x + this.offsetXFromPlayerHead;
            const desiredFig8CenterY = this.playerTarget.y + this.offsetYFromPlayerHead;
    
            const lerpFactor = this.config.FOLLOW_LERP_FACTOR;
            this.currentFig8CenterX += (desiredFig8CenterX - this.currentFig8CenterX) * lerpFactor;
            this.currentFig8CenterY += (desiredFig8CenterY - this.currentFig8CenterY) * lerpFactor;
    
            const radiusMultiplier = 1 + Math.sin(time * this.radiusOscSpeed) * this.radiusAmplitude / Math.max(this.baseRadiusX, this.baseRadiusY, 1); // Divisor must be at least 1
            const currentRadiusX = this.baseRadiusX * radiusMultiplier;
            const currentRadiusY = this.baseRadiusY * radiusMultiplier;
    
            this.currentAngle += this.figure8Speed * (delta / 16.667); 
    
            const localFig8X = currentRadiusX * Math.cos(this.currentAngle);
            const localFig8Y = currentRadiusY * Math.sin(2 * this.currentAngle);
    
            this.currentYBobAngle += this.yBobSpeed * (delta / 16.667);
            const yBobOffset = Math.sin(this.currentYBobAngle) * this.yBobAmplitude;
    
            this.x = this.currentFig8CenterX + localFig8X;
            this.y = this.currentFig8CenterY + localFig8Y + yBobOffset;
        }
    } // End of update method

    returnHome() {
        if (this.active && this.state !== 'returning_home') {
            this.state = 'returning_home';
            this.scene.tweens.killTweensOf(this);

            const returnDuration = Phaser.Math.Between(this.config.RETURN_DURATION.min, this.config.RETURN_DURATION.max);

            this.scene.tweens.add({
                targets: this,
                x: this.initialSpawnX + 16 + Phaser.Math.FloatBetween(-this.config.SIZE.max * 2, this.config.SIZE.max * 2),
                y: this.initialSpawnY + 16 + Phaser.Math.FloatBetween(-this.config.SIZE.max * 2, this.config.SIZE.max * 2),
                duration: returnDuration,
                ease: 'Quad.easeIn',
                onComplete: () => {
                    console.log(` FLYS ReturnHome_Tween_COMPLETE. Destroying self.`);
                    if (this.active) {
                        this.destroy();
                    }
                }
            });
        }
    } // End of returnHome method

} // End of FishFly class