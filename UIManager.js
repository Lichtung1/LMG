class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.dialogueData = this.scene.cache.json.get(ASSETS.DIALOGUE_DATA.key); 

        // UI elements for dialogue
        this.dialogueBox = null;    // Graphics object for the box background
        this.speakerText = null;    // Phaser Text object for speaker's name
        this.dialogueText = null;   // Phaser Text object for the dialogue line
        this.promptArrow = null;    // Optional: A little arrow to indicate "click to continue"

        this.currentDialogueKey = null;
        this.currentDialogueIndex = 0;
        this.isDialogueActive = false;
        this.onDialogueCompleteCallback = null;

        this.typingTimer = null;        // Phaser Time Event for typing characters
        this.currentLineToType = "";    // The full string of the current line
        this.currentCharIndex = 0;      // Index of the character currently being typed
        this.isTyping = false;          // Flag to know if text is currently being typed out
        this.typingSpeed = 50;          // Milliseconds per character (adjust for speed)

        // --- DIALOGUE STYLES ---
        const PIXEL_FONT_FAMILY = 'EccoEpilogue'; // Use the exact name from your CSS font-family

        this.dialogueTextStyle = {
            fontFamily: PIXEL_FONT_FAMILY, // 
            fontSize: '16px', // Adjust size as needed for your font
            fill: '#ffffff',
            wordWrap: { width: this.scene.cameras.main.width - 60, useAdvancedWrap: true },
            lineSpacing: 4,
            padding: { top: 2, bottom: 2 }
        };
        this.speakerTextStyle = {
            fontFamily: PIXEL_FONT_FAMILY, // 
            fontSize: '18px', // Adjust size
            fill: '#ffff00',
            fontStyle: 'bold',
            padding: { top: 2, bottom: 2 }
        };
        this.promptArrowStyle = { // For the 'V' character or similar
            fontFamily: PIXEL_FONT_FAMILY, // 
            fontSize: '16px',
            fill: '#ffffff'
        };

        // Store reference to player for disabling controls
        this.playerRef = this.scene.player; // Assuming scene.player is your player object
    }

    // Call this from GameScene when an interaction should start dialogue
    startDialogueSequence(dialogueKey, onCompleteCallback = null) {
        if (!this.dialogueData || !this.dialogueData[dialogueKey]) {
            console.warn(`Dialogue key "${dialogueKey}" not found.`);
            onCompleteCallback?.();
            return;
        }
        if (this.isDialogueActive) {
            console.warn("Cannot start new dialogue, one is already active.");
            return;
        }
    
        console.log(`UIManager: Starting dialogue for key: ${dialogueKey}`);
        this.currentDialogueKey = dialogueKey;
        this.currentDialogueIndex = 0;
        this.isDialogueActive = true;
        this.onDialogueCompleteCallback = onCompleteCallback;
    
        if (this.playerRef && typeof this.playerRef.setControllable === 'function') {
            this.playerRef.setControllable(false);
        } else {
            console.warn("Player reference or setControllable method not found in UIManager.");
        }
    
        this.createDialogueUI(); // Ensure UI is ready

        // Hide prompt initially, displayNextDialogueLine will manage it based on typing state
        this.promptArrow.setVisible(false);
        if (this.promptArrowTween && !this.promptArrowTween.isPaused()) {
            this.promptArrowTween.pause();
            this.promptArrow.setAlpha(1);
        }

        this.displayNextDialogueLine(); // Display the first line (which will start typing)

        this.scene.input.on('pointerdown', this.handleDialogueAdvance, this);
        this.scene.input.keyboard.on('keydown', this.handleAnyKeyAdvance, this);
    }

    handleAnyKeyAdvance(event) { // New method
        if (!this.isDialogueActive) return;
        // You could optionally ignore certain keys like Shift, Ctrl, Alt if needed
        // if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
        //     return;
        // }
        this.handleDialogueAdvance(); // Call the same advance logic
    }


    createDialogueUI() {
        if (this.dialogueBox) {
            // If UI exists, clear content and ensure visibility for reuse
            this.dialogueText.setText('');
            this.speakerText.setText('');
            this.promptArrow.setVisible(false);
            if (this.promptArrowTween && !this.promptArrowTween.isPaused()) {
                this.promptArrowTween.pause(); // Pause tween if it was running
            }
            this.dialogueBox.setVisible(true); // Make sure box is visible
            this.speakerText.setVisible(true);
            this.dialogueText.setVisible(true);
            return;
        }

        const cam = this.scene.cameras.main;
        const padding = 20;         // Padding from edges of screen for the box
        const innerPadding = 10;    // Padding inside the box for text
        const boxHeight = 100;      // Desired height of the dialogue box

        // --- POSITION BOX AT THE TOP ---
        const boxY = padding; // Y position of the top of the box

        // Dialogue Box Background
        this.dialogueBox = this.scene.add.graphics()
            .fillStyle(0x111111, 0.85)
            .fillRect(padding, boxY, cam.width - (padding * 2), boxHeight) // x, y, width, height
            .setScrollFactor(0)
            .setDepth(990);

        // Speaker Text - Positioned inside the box, top-left
        this.speakerText = this.scene.add.text(
            padding + innerPadding,
            boxY + innerPadding, // Y relative to top of the box
            '',
            this.speakerTextStyle
        ).setScrollFactor(0).setDepth(991);

        // Dialogue Text - Positioned below speaker text
        this.dialogueTextStyle.wordWrap = { width: cam.width - (padding * 2) - (innerPadding * 2), useAdvancedWrap: true };
        this.dialogueText = this.scene.add.text(
            padding + innerPadding,
            boxY + innerPadding + 25, // Y relative to top of the box, below speaker
            '',
            this.dialogueTextStyle
        ).setScrollFactor(0).setDepth(991);

        // Prompt Arrow - Bottom right OF THE DIALOGUE BOX (which is now at the top)
        this.promptArrow = this.scene.add.text(
            cam.width - padding - innerPadding,         // X: Far right of the box
            boxY + boxHeight - innerPadding,            // Y: Bottom of the box
            '...',                                      // Your new prompt text
            this.promptArrowStyle
        ).setOrigin(1, 1) // Origin to bottom-right of the "..." text
         .setScrollFactor(0).setDepth(991).setVisible(false);

        // Blinking tween for prompt arrow
        this.promptArrowTween = this.scene.tweens.add({
            targets: this.promptArrow,
            alpha: 0.3,
            duration: 600,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            paused: true
        });
    }

    displayNextDialogueLine() {
        if (!this.isDialogueActive || !this.currentDialogueKey || !this.dialogueData) { /* ... */ return; }
        const dialogueSequence = this.dialogueData[this.currentDialogueKey];
        if (!dialogueSequence || this.currentDialogueIndex >= dialogueSequence.length) {
            this.endDialogue();
            return;
        }

        const currentLineData = dialogueSequence[this.currentDialogueIndex];
        if (!currentLineData) { /* ... error handling ... */ this.endDialogue(); return; }

        this.speakerText.setText(currentLineData.speaker ? currentLineData.speaker + ":" : "");
        
        // --- START TYPING EFFECT ---
        this.currentLineToType = currentLineData.line;
        this.currentCharIndex = 0;
        this.dialogueText.setText(''); // Clear previous line
        this.isTyping = true;
        this.promptArrow.setVisible(false); // Hide prompt while typing
        if (this.promptArrowTween && !this.promptArrowTween.isPaused()) {
            this.promptArrowTween.pause();
            this.promptArrow.setAlpha(1); // Reset alpha
        }


        // Clear any existing typing timer before starting a new one
        if (this.typingTimer) {
            this.typingTimer.remove();
            this.typingTimer = null;
        }

        this.typingTimer = this.scene.time.addEvent({
            delay: this.typingSpeed,
            callback: this.typeCharacter,
            callbackScope: this,
            loop: true // Will loop until we stop it
        });
        // --- END TYPING EFFECT ---

        // currentDialogueIndex is incremented in handleDialogueAdvance AFTER line is fully shown or skipped
    }

    typeCharacter() { 
        if (!this.isTyping || !this.dialogueText || !this.dialogueText.active) { // Safety checks
            this.typingTimer?.remove();
            this.typingTimer = null;
            this.isTyping = false;
            return;
        }

        if (this.currentCharIndex < this.currentLineToType.length) {
            this.dialogueText.text += this.currentLineToType[this.currentCharIndex];
            this.currentCharIndex++;
        } else {
            // Line finished typing
            this.isTyping = false;
            this.typingTimer.remove();
            this.typingTimer = null;
            this.promptArrow.setVisible(true);
            if (this.promptArrowTween && this.promptArrowTween.isPaused()) {
                 this.promptArrowTween.resume();
            }
        }
    }

    handleDialogueAdvance() {
        if (!this.isDialogueActive) return;

        if (this.isTyping) {
            // --- If typing, INSTANTLY show the full line ---
            this.isTyping = false;
            if (this.typingTimer) {
                this.typingTimer.remove();
                this.typingTimer = null;
            }
            this.dialogueText.setText(this.currentLineToType); // Show full line
            this.currentCharIndex = this.currentLineToType.length; // Mark as fully typed

            this.promptArrow.setVisible(true); // Show prompt arrow
             if (this.promptArrowTween && this.promptArrowTween.isPaused()) {
                 this.promptArrowTween.resume();
            }
        } else {
            // --- If not typing (line is fully displayed), advance to next line or end ---
            if (this.promptArrowTween && !this.promptArrowTween.isPaused()) {
                this.promptArrowTween.pause();
                this.promptArrow.setAlpha(1);
            }
            this.promptArrow.setVisible(false);

            this.currentDialogueIndex++; // Increment to get the next line
            const dialogueSequence = this.dialogueData[this.currentDialogueKey];
            if (this.currentDialogueIndex < dialogueSequence.length) {
                this.displayNextDialogueLine();
            } else {
                this.endDialogue();
            }
        }
    }

    endDialogue() {
        if (!this.isDialogueActive) return;
                
        if (this.typingTimer) {
            this.typingTimer.remove();
            this.typingTimer = null;
        }
        this.isTyping = false; // Ensure typing flag is reset


        this.isDialogueActive = false;
        console.log("UIManager: Ending dialogue for key:", this.currentDialogueKey);

        this.dialogueBox?.destroy();
        this.speakerText?.destroy();
        this.dialogueText?.destroy();
        if(this.promptArrowTween) this.promptArrowTween.stop();
        this.promptArrow?.destroy();

        this.dialogueBox = null;
        this.speakerText = null;
        this.dialogueText = null;
        this.promptArrow = null;
        this.promptArrowTween = null;

        this.scene.input.off('pointerdown', this.handleDialogueAdvance, this);
        this.scene.input.keyboard.off('keydown', this.handleAnyKeyAdvance, this);

        if (this.playerRef && typeof this.playerRef.setControllable === 'function') {
            this.playerRef.setControllable(true);
        }

        this.onDialogueCompleteCallback?.();
        this.onDialogueCompleteCallback = null;
        this.currentDialogueKey = null;
    }

    displayTemporaryMessage(message, duration = 3000, style) {
        const cam = this.scene.cameras.main;
        const x = cam.centerX;
        const y = cam.height * 0.8; // Display towards the bottom center

        // Use a default style if none provided, ensure it's defined (e.g., in constants.js)
        const messageStyle = style || {
            font: '16px monospace', // Placeholder
            fill: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 },
            align: 'center',
            wordWrap: { width: cam.width * 0.7 }
        };


        // Clear previous temporary message if any
        if (this.temporaryMessageObject) {
            this.temporaryMessageObject.destroy();
            this.temporaryMessageObject = null;
        }
        if (this.temporaryMessageTimer) {
            this.temporaryMessageTimer.remove();
            this.temporaryMessageTimer = null;
        }

        this.temporaryMessageObject = this.scene.add.text(x, y, message, messageStyle)
            .setOrigin(0.5)
            .setScrollFactor(0) // Stays fixed on screen
            .setDepth(1000);    // Ensure it's on top

        this.temporaryMessageTimer = this.scene.time.delayedCall(duration, () => {
            if (this.temporaryMessageObject) {
                this.temporaryMessageObject.destroy();
                this.temporaryMessageObject = null;
            }
        }, [], this);
    }

    createUIElements() {
        // Standard UI text (non-debug)
        this.scene.add.text(15, 15, 'Use LEFT/RIGHT arrow keys to move, UP to jump', { fontSize: '14px', fill: '#fff', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(100);
        this.scene.add.text(15, 35, 'Press \'D\' to toggle debug info', { fontSize: '14px', fill: '#fff', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(100);
        this.scene.add.text(15, 55, 'Glitch Keys: U=Shake, I=Flash, O=Flicker, P=Static', { fontSize: '12px', fill: '#aaa', stroke: '#000', strokeThickness: 1 }).setScrollFactor(0).setDepth(100);

        // Debug specific elements (created invisible initially)
        this.debugText = this.scene.add.text(15, 75, 'Debug Info:\n', { fontSize: '12px', fill: '#0f0', lineSpacing: 4, backgroundColor: 'rgba(0,0,0,0.5)' })
            .setScrollFactor(0).setDepth(100).setVisible(this.isDebugVisible);

        this.customDebugGraphics = this.scene.add.graphics().setAlpha(0.75).setDepth(99).setVisible(this.isDebugVisible);
    }

    setupDebugInput() {
        // Setup the key listener for toggling debug info
        if (this.scene.input?.keyboard) { // Check if keyboard input is available
             this.debugKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        } else {
            console.warn("Keyboard input not available for UIManager setup.");
        }
    }

    // Handles input related to UI/Debug (like toggling debug view)
    handleInput() {
        if (this.debugKey && Phaser.Input.Keyboard.JustDown(this.debugKey)) {
            this.isDebugVisible = !this.isDebugVisible;
            this.debugText?.setVisible(this.isDebugVisible);
            this.customDebugGraphics?.setVisible(this.isDebugVisible);
            // Clear debug graphics when hiding
            if (!this.isDebugVisible) {
                this.customDebugGraphics?.clear();
            }
            console.log("Debug visibility toggled:", this.isDebugVisible);
        }
    }

    // Updates the debug display if it's visible
    // Needs game state data passed in
    update(gameData) {
        if (!this.isDebugVisible || !gameData) {
            return; // Don't update if not visible or no data
        }

        const { player, birds, fireflies, glitchTriggerZones, fps, collisionLayer } = gameData;

        // Update Debug Text
        if (this.debugText && player?.body) { // Ensure text element and player body exist
            const onGround = player.body.blocked.down || player.body.touching.down;
            const vikingZone = glitchTriggerZones?.find(z => z.name === TILED_NAMES.OBJECT_NAME_VIKING_TRIGGER); // Assumes TILED_NAMES is global via constants.js

            this.debugText.setText([
                `Player X/Y: ${player.x.toFixed(1)} / ${player.y.toFixed(1)}`,
                `Velocity X/Y: ${player.body.velocity.x.toFixed(1)} / ${player.body.velocity.y.toFixed(1)}`,
                `On Ground: ${onGround}`, `Animation: ${player.anims.currentAnim?.key ?? 'none'}`,
                `Camera ScrollX: ${this.scene.cameras.main.scrollX.toFixed(1)}`, `Fireflies: ${fireflies?.getLength() ?? 0}`,
                `Birds Active: ${birds?.countActive(true) ?? 0}`, `FPS: ${fps.toFixed(1)}`,
                `Trigger Zones Loaded: ${glitchTriggerZones?.length ?? 0}`,
                `Viking Zone Active: ${vikingZone?.isActive ?? 'N/A'}`
            ]);
        } else if (this.debugText) {
             this.debugText.setText("Debug Info:\nPlayer not available.");
        }

        // Update Debug Graphics
        this.customDebugGraphics?.clear(); // Clear previous drawings

        if (this.customDebugGraphics) {
            // Draw collision layer debug
            if (collisionLayer) {
                collisionLayer.renderDebug(this.customDebugGraphics, { tileColor: null, collidingTileColor: new Phaser.Display.Color(0, 255, 0, 50), faceColor: new Phaser.Display.Color(255, 0, 0, 150) });
            }
            // Draw player body
            if (player?.body) {
                 this.customDebugGraphics.lineStyle(1, 0xffff00, 0.8).strokeRect(player.body.x, player.body.y, player.body.width, player.body.height);
            }
            // Draw bird wake distance
            if(birds) {
                 birds.getChildren().forEach(bird => {
                     if (bird.active && bird.getData('isSleeping')) { // Check bird state directly
                          this.customDebugGraphics.lineStyle(1, 0x00ffff, 0.5).strokeCircle(bird.x, bird.y, BIRD_CONFIG.WAKE_DISTANCE); // Assumes BIRD_CONFIG is global
                     }
                 });
            }
            // Draw Glitch Trigger Zones
            if (glitchTriggerZones) {
                glitchTriggerZones.forEach(zone => {
                    if (zone?.rect) {
                        this.customDebugGraphics.lineStyle(zone.isActive ? 2 : 1, zone.isActive ? 0xff00ff : 0x880088, zone.isActive ? 0.6 : 0.4)
                                             .strokeRectShape(zone.rect);
                    }
                });
            }
        }
    }
}

// Note: Ensure constants.js is loaded before this file ('UIManager.js') in your index.html
// Ensure this file is loaded before game.js