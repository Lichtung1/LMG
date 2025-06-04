// --- Glitch Configuration (Ethereal & Glow) ---
const GLITCH_CONFIG = {
    // U Key: Swirling Shake + Wave (Keep as is for now)
    SWIRL_DURATION: 600,
    SWIRL_SHAKE_INTENSITY: 0.007,
    SWIRL_WAVE_X_AMPLITUDE: 3, SWIRL_WAVE_Y_AMPLITUDE: 5,
    SWIRL_WAVE_X_FREQUENCY: 0.08, SWIRL_WAVE_Y_FREQUENCY: 0.12,

    // I Key: Ethereal Ambient/Background Storm
    STORM_DURATION: 900, // ms (Even longer)
    STORM_INTERVAL: 70, // ms between color changes (slightly slower cycle for ethereal feel)
    // New Ethereal Palette (Light Blues, Cyans, Pale Greens, Beige/White)
    STORM_COLORS: [0xADD8E6, 0xAFEEEE, 0x98FB98, 0xE0FFFF, 0xF5F5DC, 0xB0E0E6], // LightBlue, PaleTurquoise, PaleGreen, LightCyan, Beige, PowderBlue
    STORM_TINTS_BACKGROUND: true, // Explicitly control background tinting

    // O Key: Glowing Ghost
    GLOW_GHOST_DURATION: 600, // ms (Longer duration)
    GLOW_GHOST_JITTER: 4, // Max pixels to jitter (slightly less extreme jitter)
    GLOW_GHOST_COLOR: 0xFFFFFF, // Tint player white
    GLOW_GHOST_ALPHA: 1.0, // Keep player fully opaque white
    GLOW_SPRITE_COUNT: 2, // How many glow sprites to spawn per jitter frame
    GLOW_SPRITE_ALPHA: 0.5, // Starting alpha for glow sprites
    GLOW_SPRITE_SCALE: 1.1, // Make glow sprites slightly larger
    GLOW_SPRITE_FADE_DURATION: 150, // How fast glow sprites fade (short lived)
    GLOW_JITTER_INTERVAL: 40, // How often to jitter and spawn glow sprites

    // P Key: Layered Psychedelic Static (Keep as is for now)
    LAYERED_STATIC_DURATION: 700,
    LAYERED_STATIC_ALPHA_1: 0.35, LAYERED_STATIC_ALPHA_2: 0.25,
    LAYERED_STATIC_TEXTURE_KEY: 'static_glitch_texture',
    LAYERED_STATIC_TEXTURE_SIZE: 64,
    LAYERED_STATIC_SCROLL_SPEED_1: 5, LAYERED_STATIC_SCROLL_SPEED_2: -4,
    LAYERED_STATIC_TINT_COLORS_1: [0x00FF00, 0xFF00FF, 0x00FFFF],
    LAYERED_STATIC_TINT_COLORS_2: [0x9400D3, 0xFF7F00, 0x4B0082],
    LAYERED_STATIC_TINT_INTERVAL: 70
};

class GlitchManager {
    /**
     * Manages visual glitch effects.
     * @param {Phaser.Scene} scene The scene this manager belongs to.
     */
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.background = null;

        // Internal state timers/references
        this.playerGlowGhostTimer = null; // Renamed from playerGhostTimer
        // Removed playerAfterimageTimer
        this.ambientStormTimer = null;
        this.staticOverlay1 = null;
        this.staticOverlay2 = null;
        this.staticTintTimer1 = null;
        this.staticTintTimer2 = null;
        this.swirlWaveUpdate = null;

        this.staticTextureCreated = false;
        this.originalAmbientColor = null;
        this.originalBackgroundTint = null; // Store original background tint
    }

    /** Sets the player game object */
    setPlayer(player) { this.player = player; }
    /** Sets the background tile sprite */
    setBackground(background) { this.background = background; }

    /** Creates the reusable static noise texture */
    createStaticTexture() {
        if (this.staticTextureCreated || !this.scene) return;
        const size = GLITCH_CONFIG.LAYERED_STATIC_TEXTURE_SIZE;
        const gfx = this.scene.make.graphics({ x: 0, y: 0 }, false);
        for (let y = 0; y < size; y++) { for (let x = 0; x < size; x++) {
                const gray = Phaser.Math.Between(50, 200); const alpha = Phaser.Math.Between(0, 100);
                gfx.fillStyle(Phaser.Display.Color.GetColor(gray, gray, gray), alpha / 100); gfx.fillRect(x, y, 1, 1); } }
        gfx.generateTexture(GLITCH_CONFIG.LAYERED_STATIC_TEXTURE_KEY, size, size);
        gfx.destroy(); this.staticTextureCreated = true;
        console.log("GlitchManager: Generated static glitch texture.");
    }

    /** Triggers a glitch effect based on a keyboard key code */
    triggerGlitchByKey(keyCode) {
        switch (keyCode) {
            case Phaser.Input.Keyboard.KeyCodes.U: this.triggerBackgroundSwirl(); break;
            case Phaser.Input.Keyboard.KeyCodes.I: this.triggerEtherealStorm(); break; // Renamed
            case Phaser.Input.Keyboard.KeyCodes.O: this.triggerPlayerGlowGhost(); break; // Renamed
            case Phaser.Input.Keyboard.KeyCodes.P: this.triggerLayeredStatic(); break;
        }
    }

    // --- Individual Glitch Trigger Methods (Enhanced/Updated) ---

    /** U Key: Screen Shake + Background Swirl Wave */
    triggerBackgroundSwirl() {
        // (Keep existing triggerBackgroundSwirl logic - no changes needed here based on request)
        if (!this.scene || this.swirlWaveUpdate) return; console.log("Glitch: Background Swirl!");
        const camera = this.scene.cameras.main; const duration = GLITCH_CONFIG.SWIRL_DURATION;
        const intensity = GLITCH_CONFIG.SWIRL_SHAKE_INTENSITY; const waveXAmp = GLITCH_CONFIG.SWIRL_WAVE_X_AMPLITUDE;
        const waveYAmp = GLITCH_CONFIG.SWIRL_WAVE_Y_AMPLITUDE; const waveXFreq = GLITCH_CONFIG.SWIRL_WAVE_X_FREQUENCY;
        const waveYFreq = GLITCH_CONFIG.SWIRL_WAVE_Y_FREQUENCY; const startTime = this.scene.time.now;
        camera.shake(duration, intensity);
        if (this.background && (waveXAmp > 0 || waveYAmp > 0)) {
            const originalTileX = this.background.tilePositionX; const originalTileY = this.background.tilePositionY;
            this.swirlWaveUpdate = (time, delta) => {
                const elapsed = time - startTime;
                if (elapsed >= duration) {
                    this.background.tilePositionX = originalTileX; this.background.tilePositionY = originalTileY;
                    this.scene.events.off('update', this.swirlWaveUpdate); this.swirlWaveUpdate = null; return; }
                const waveOffsetX = Math.sin(elapsed * waveXFreq) * waveXAmp; const waveOffsetY = Math.sin(elapsed * waveYFreq) * waveYAmp;
                this.background.tilePositionX = originalTileX + waveOffsetX; this.background.tilePositionY = originalTileY + waveOffsetY; };
            this.scene.events.on('update', this.swirlWaveUpdate); }
    }

    /** I Key: Ethereal Ambient Light & Background Storm */
    triggerEtherealStorm() { // Renamed from triggerAmbientStorm
        if (!this.scene || !this.scene.lights || this.ambientStormTimer) return; // Check for light system & overlap
        console.log("Glitch: Ethereal Storm!");
        const duration = GLITCH_CONFIG.STORM_DURATION;
        const interval = GLITCH_CONFIG.STORM_INTERVAL;
        const colors = GLITCH_CONFIG.STORM_COLORS;
        let colorIndex = 0;
        let elapsed = 0;

        // Store original ambient color
        if (this.originalAmbientColor === null) {
             const currentAmbient = this.scene.lights.ambientColor;
             this.originalAmbientColor = Phaser.Display.Color.GetColor(currentAmbient.r * 255, currentAmbient.g * 255, currentAmbient.b * 255);
        }
        // Store original background tint if tinting is enabled
        if (GLITCH_CONFIG.STORM_TINTS_BACKGROUND && this.background && this.originalBackgroundTint === null) {
             this.originalBackgroundTint = this.background.tint;
             // Ensure it's treated as 'no tint' if it was default 0xffffff top-left tint
             if (this.originalBackgroundTint === 0xffffff && this.background.tintFill === false) {
                 this.originalBackgroundTint = null; // Treat default white as no tint for restoration logic
             }
        }


        this.ambientStormTimer = this.scene.time.addEvent({
            delay: interval,
            callback: () => {
                elapsed += interval;
                const currentColor = colors[colorIndex % colors.length];

                // Set ambient color
                this.scene.lights.setAmbientColor(currentColor);

                // Set background tint if enabled
                if (GLITCH_CONFIG.STORM_TINTS_BACKGROUND && this.background && this.background.active) {
                    this.background.setTintFill(currentColor); // Use tint fill for solid color wash
                }

                colorIndex++;

                if (elapsed >= duration) {
                    // End of storm, restore originals
                    if (this.originalAmbientColor !== null) {
                         this.scene.lights.setAmbientColor(this.originalAmbientColor);
                         this.originalAmbientColor = null;
                    }
                    if (GLITCH_CONFIG.STORM_TINTS_BACKGROUND && this.background && this.background.active) {
                        this.background.clearTint(); // Clear the fill tint
                        // Restore original tint if it wasn't null (i.e., it had a non-default tint)
                        if (this.originalBackgroundTint !== null) {
                            this.background.setTint(this.originalBackgroundTint);
                        }
                         this.originalBackgroundTint = null; // Clear stored value
                    }
                    this.ambientStormTimer.remove();
                    this.ambientStormTimer = null;
                }
            },
            loop: true
        });
    }

     /** O Key: Player Glow Ghost Effect */
    triggerPlayerGlowGhost() { // Renamed from triggerPlayerGhostAfterimage
        if (!this.player || !this.player.active || this.playerGlowGhostTimer || !this.scene) return; // Prevent overlap
        console.log("Glitch: Player Glow Ghost!");

        const duration = GLITCH_CONFIG.GLOW_GHOST_DURATION;
        const jitterAmount = GLITCH_CONFIG.GLOW_GHOST_JITTER;
        const ghostColor = GLITCH_CONFIG.GLOW_GHOST_COLOR;
        const ghostAlpha = GLITCH_CONFIG.GLOW_GHOST_ALPHA; // Player alpha
        const glowSpriteCount = GLITCH_CONFIG.GLOW_SPRITE_COUNT;
        const glowAlpha = GLITCH_CONFIG.GLOW_SPRITE_ALPHA;
        const glowScale = GLITCH_CONFIG.GLOW_SPRITE_SCALE;
        const glowFade = GLITCH_CONFIG.GLOW_SPRITE_FADE_DURATION;
        const jitterInterval = GLITCH_CONFIG.GLOW_JITTER_INTERVAL;

        const originalPos = { x: this.player.x, y: this.player.y };
        const originalTint = this.player.tint;
        const originalAlpha = this.player.alpha;
        const originalScale = this.player.scale; // Store original scale

        // Apply ghost effect immediately (bright white, maybe slightly scaled if desired)
        this.player.setTint(ghostColor);
        this.player.setAlpha(ghostAlpha);
        // Optional: Slightly scale up the main player too?
        // this.player.setScale(originalScale * 1.05);

        // Start jitter and glow spawning timer
        this.playerGlowGhostTimer = this.scene.time.addEvent({
            delay: jitterInterval,
            callback: () => {
                if (!this.player || !this.player.active) { // Stop if player destroyed
                    this.playerGlowGhostTimer?.remove(); this.playerGlowGhostTimer = null; return;
                }

                // Calculate jittered position
                const jitterX = Phaser.Math.FloatBetween(-jitterAmount, jitterAmount);
                const jitterY = Phaser.Math.FloatBetween(-jitterAmount, jitterAmount);
                const currentX = originalPos.x + jitterX;
                const currentY = originalPos.y + jitterY;
                this.player.setPosition(currentX, currentY);

                // Spawn Glow Sprites at current jittered position
                for (let i = 0; i < glowSpriteCount; i++) {
                    // Add slight offset to each glow sprite for better effect
                    const glowOffsetX = Phaser.Math.FloatBetween(-jitterAmount * 0.5, jitterAmount * 0.5);
                    const glowOffsetY = Phaser.Math.FloatBetween(-jitterAmount * 0.5, jitterAmount * 0.5);

                    const glowSprite = this.scene.add.sprite(currentX + glowOffsetX, currentY + glowOffsetY, this.player.texture.key, this.player.frame.name)
                        .setOrigin(this.player.originX, this.player.originY)
                        .setDepth(this.player.depth - 1) // Behind player
                        .setAlpha(glowAlpha)
                        .setScale(originalScale * glowScale) // Use player's original scale as base
                        .setTint(ghostColor); // White tint

                    // Add fade out tween
                    this.scene.tweens.add({
                        targets: glowSprite,
                        alpha: 0,
                        duration: glowFade,
                        ease: 'Quad.easeOut', // Faster fade out
                        onComplete: () => { glowSprite.destroy(); }
                    });
                }
            },
            repeat: Math.floor(duration / jitterInterval) -1 // Repeat for the duration
        });

        // Timer to stop the main ghost effect
        this.scene.time.delayedCall(duration, () => {
            this.playerGlowGhostTimer?.remove(); this.playerGlowGhostTimer = null;

            // Restore player state if it still exists
            if (this.player && this.player.active) {
                this.player.setPosition(originalPos.x, originalPos.y);
                this.player.setTint(originalTint);
                this.player.setAlpha(originalAlpha);
                this.player.setScale(originalScale); // Restore scale
            }
        });
    }

    /** P Key: Layered Psychedelic Static */
    triggerLayeredStatic() {
        // (Keep existing triggerLayeredStatic logic - no changes needed here based on request)
         if (this.staticOverlay1 || this.staticOverlay2 || !this.staticTextureCreated || !this.scene) return; console.log("Glitch: Layered Psychedelic Static!");
         const camera = this.scene.cameras.main; const duration = GLITCH_CONFIG.LAYERED_STATIC_DURATION;
         const tintColors1 = GLITCH_CONFIG.LAYERED_STATIC_TINT_COLORS_1; const tintColors2 = GLITCH_CONFIG.LAYERED_STATIC_TINT_COLORS_2;
         const tintInterval = GLITCH_CONFIG.LAYERED_STATIC_TINT_INTERVAL; let tintIndex1 = 0; let tintIndex2 = Math.floor(tintColors2.length / 2);
         this.staticOverlay1 = this.scene.add.tileSprite(0, 0, camera.width, camera.height, GLITCH_CONFIG.LAYERED_STATIC_TEXTURE_KEY).setOrigin(0, 0).setScrollFactor(0).setDepth(150).setAlpha(GLITCH_CONFIG.LAYERED_STATIC_ALPHA_1);
         if (tintColors1.length > 0) this.staticOverlay1.setTint(tintColors1[0]);
         this.staticOverlay2 = this.scene.add.tileSprite(0, 0, camera.width, camera.height, GLITCH_CONFIG.LAYERED_STATIC_TEXTURE_KEY).setOrigin(0, 0).setScrollFactor(0).setDepth(151).setAlpha(GLITCH_CONFIG.LAYERED_STATIC_ALPHA_2);
         if (tintColors2.length > 0) this.staticOverlay2.setTint(tintColors2[tintIndex2 % tintColors2.length]);
         this.scene.tweens.add({ targets: this.staticOverlay1, tilePositionY: { from: 0, to: -GLITCH_CONFIG.LAYERED_STATIC_TEXTURE_SIZE * GLITCH_CONFIG.LAYERED_STATIC_SCROLL_SPEED_1 }, ease: 'Linear', duration: duration, repeat: 0, onComplete: () => { this.staticOverlay1?.destroy(); this.staticOverlay1 = null; this.staticTintTimer1?.remove(); this.staticTintTimer1 = null; } });
         this.scene.tweens.add({ targets: this.staticOverlay2, tilePositionX: { from: 0, to: -GLITCH_CONFIG.LAYERED_STATIC_TEXTURE_SIZE * GLITCH_CONFIG.LAYERED_STATIC_SCROLL_SPEED_2 }, ease: 'Linear', duration: duration, repeat: 0, onComplete: () => { this.staticOverlay2?.destroy(); this.staticOverlay2 = null; this.staticTintTimer2?.remove(); this.staticTintTimer2 = null; } });
         if (tintColors1.length > 0 && tintInterval > 0) { this.staticTintTimer1 = this.scene.time.addEvent({ delay: tintInterval, callback: () => { tintIndex1++; if (this.staticOverlay1?.active) this.staticOverlay1.setTint(tintColors1[tintIndex1 % tintColors1.length]); else { this.staticTintTimer1?.remove(); this.staticTintTimer1 = null; } }, loop: true }); }
         if (tintColors2.length > 0 && tintInterval > 0) { this.staticTintTimer2 = this.scene.time.addEvent({ delay: tintInterval, callback: () => { tintIndex2++; if (this.staticOverlay2?.active) this.staticOverlay2.setTint(tintColors2[tintIndex2 % tintColors2.length]); else { this.staticTintTimer2?.remove(); this.staticTintTimer2 = null; } }, loop: true }); }
         this.scene.time.delayedCall(duration + 100, () => { this.staticOverlay1?.destroy(); this.staticOverlay1 = null; this.staticOverlay2?.destroy(); this.staticOverlay2 = null; this.staticTintTimer1?.remove(); this.staticTintTimer1 = null; this.staticTintTimer2?.remove(); this.staticTintTimer2 = null; });
    }

} // End Class GlitchManager
