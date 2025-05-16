class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Ensure properties for all layers are present
        this.player = null; this.cursors = null; this.map = null; this.collisionLayer = null; this.birds = null;
        this.glitchManager = null; this.uiManager = null;
        this.originalBackground = null; // Furthest background
        this.bgLayer1 = null; this.bgLayer2 = null; this.bgLayer3 = null; // New parallax layers
        this.stars = null; this.playerLight = null; this.fireflies = null; this.fireflyTextureCreated = false;
        this.glitchKeyU = null; this.glitchKeyI = null; this.glitchKeyO = null; this.glitchKeyP = null;
        this.glitchTriggerZones = [];
        this.passwordTextObject = null; 
        this.typingTimer = null;      
        this.mothNpc = null;
        this.npcs = null;
        this.mothTriggerZoneRect = null; 
        this.fishFliesSwarm = null; 
        this.fishFliesSwarmLight = null;
        this.margotNpc = null;
        this.margotTriggerZoneRect = null;

    }

    preload() {
        this.load.image(ASSETS.BACKGROUND_ORIGINAL.key, ASSETS.BACKGROUND_ORIGINAL.file);
        this.load.image(ASSETS.BG_LAYER_1.key, ASSETS.BG_LAYER_1.file);
        this.load.image(ASSETS.BG_LAYER_2.key, ASSETS.BG_LAYER_2.file);
        this.load.image(ASSETS.BG_LAYER_3.key, ASSETS.BG_LAYER_3.file);
        this.load.spritesheet(ASSETS.WATER_SPRITESHEET.key, ASSETS.WATER_SPRITESHEET.file, { frameWidth: WATER_CONFIG.FRAME_WIDTH, frameHeight: WATER_CONFIG.FRAME_HEIGHT });
        this.load.image(ASSETS.TILESET_MAIN.key, ASSETS.TILESET_MAIN.file);
        this.load.image(ASSETS.VIKING.key, ASSETS.VIKING.file);
        this.load.image(ASSETS.TREES.key, ASSETS.TREES.file);
        this.load.image(ASSETS.DECORATIONS.key, ASSETS.DECORATIONS.file);
        this.load.image(ASSETS.STORE_TILESET.key, ASSETS.STORE_TILESET.file);
        this.load.image(ASSETS.PLANE_TILESET.key, ASSETS.PLANE_TILESET.file);
        this.load.image(ASSETS.HARBOURMASTER_TILESET.key, ASSETS.HARBOURMASTER_TILESET.file);
        this.load.tilemapTiledJSON(ASSETS.MAP_DATA.key, ASSETS.MAP_DATA.file);
        this.load.spritesheet(ASSETS.PLAYER_IDLE.key, ASSETS.PLAYER_IDLE.file, { frameWidth: PLAYER_CONFIG.SPRITE_WIDTH, frameHeight: PLAYER_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.PLAYER_RUN.key, ASSETS.PLAYER_RUN.file, { frameWidth: PLAYER_CONFIG.SPRITE_WIDTH, frameHeight: PLAYER_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.PLAYER_JUMP.key, ASSETS.PLAYER_JUMP.file, { frameWidth: PLAYER_CONFIG.SPRITE_WIDTH, frameHeight: PLAYER_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.BIRD_SLEEP.key, ASSETS.BIRD_SLEEP.file, { frameWidth: BIRD_CONFIG.FRAME_WIDTH, frameHeight: BIRD_CONFIG.FRAME_HEIGHT });
        this.load.spritesheet(ASSETS.BIRD_FLY.key, ASSETS.BIRD_FLY.file, { frameWidth: BIRD_CONFIG.FRAME_WIDTH, frameHeight: BIRD_CONFIG.FRAME_HEIGHT });
        this.load.spritesheet(ASSETS.MOTH_SPRITESHEET.key, ASSETS.MOTH_SPRITESHEET.file, {frameWidth: MOTH_CONFIG.FRAME_WIDTH, frameHeight: MOTH_CONFIG.FRAME_HEIGHT});
        this.load.json(ASSETS.DIALOGUE_DATA.key, ASSETS.DIALOGUE_DATA.file);
        this.load.spritesheet(ASSETS.MARGOT_IDLE.key, ASSETS.MARGOT_IDLE.file, { frameWidth: MARGOT_CONFIG.SPRITE_WIDTH, frameHeight: MARGOT_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.MARGOT_WALK.key, ASSETS.MARGOT_WALK.file, { frameWidth: MARGOT_CONFIG.SPRITE_WIDTH, frameHeight: MARGOT_CONFIG.SPRITE_HEIGHT });
    }

    create() {
        console.log("Phaser: Creating scene...");
        const camWidth = this.cameras.main.width;   
        const camHeight = this.cameras.main.height;
        
        // Instantiate Managers
        if (typeof GlitchManager !== 'undefined') {
            this.glitchManager = new GlitchManager(this);
        } else { console.error("GlitchManager class not found!"); }
        if (typeof UIManager !== 'undefined') {
            this.uiManager = new UIManager(this); // Create UI Manager
        } else { console.error("UIManager class not found!"); }


        // 1. Original Background (Visible Initially)
        this.originalBackground = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BACKGROUND_ORIGINAL.key)
            .setOrigin(0, 0)
            .setScrollFactor(0) // Keep scroll factor 0 if it shouldn't move with camera at all
            .setDepth(-9)
            .setVisible(true)
            .setTileScale(0.1, 0.1);
            //.setPipeline('Light2D'); 

        // 2. Stars (Visible Initially)
        this.stars = this.add.group();
        this.createStars(this.map?.widthInPixels || camWidth); // Sets depth -8 internally

        // 3. New Parallax Layers (Invisible Initially)
        this.bgLayer1 = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BG_LAYER_1.key)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(-7)
            .setVisible(false); // <-- Start invisible

        this.bgLayer2 = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BG_LAYER_2.key)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(-6)
            .setVisible(false); // <-- Start invisible

        this.bgLayer3 = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BG_LAYER_3.key)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(-5)
            .setVisible(false); // <-- Start invisible

        // Pass a reference to GlitchManager if needed (maybe the closest new layer now?)
        this.glitchManager?.setBackground(this.bgLayer3);

        this.setupMapAndLayers();
        this.birds = this.physics.add.group({ allowGravity: false, immovable: true });
        this.fireflies = this.add.group();
        this.npcs = this.physics.add.group({ allowGravity: false });
        this.createPlayerAndCamera();
        this.setupLighting(); // Creates fireflies

        
        let mothSpawnX = 500; // Default X if zone not found
        let mothSpawnY = 180; // Default Y if zone not found

        if (this.mothTriggerZoneRect) {
            // Position to the right edge + offset, centered vertically
            mothSpawnX = this.mothTriggerZoneRect.right + MOTH_CONFIG.SPAWN_OFFSET_X;
            mothSpawnY = this.mothTriggerZoneRect.centerY;
            console.log(`Calculated Moth spawn based on trigger zone: (${mothSpawnX}, ${mothSpawnY})`);
        } else {
             console.warn("MothTriggerZone not found, using default spawn position.");
        }

        // GIT dem fishflys
        this.createFishflyTexture();
        this.fishFliesSwarm = this.add.group({
            // classType: FishFly, // Optional: If you only ever add FishFly objects, this can be useful.
            runChildUpdate: true  // <-- ADD THIS (or ensure it's true if already present)
        });


        // --- Instantiate the Moth ---
        this.mothNpc = new MothNPC(this, mothSpawnX, mothSpawnY);
        this.npcs.add(this.mothNpc);
        console.log("Moth NPC instance added to scene and group.");

        // --- >>> Spawn Fireflies Around Moth <<< ---
        // Check if the moth object and the creation function exist
        if (this.mothNpc && typeof this.createFirefliesForLight === 'function') {
            this.createFirefliesForLight(this.mothNpc.x, this.mothNpc.y);
            console.log(`Created fireflies orbiting moth's initial position.`);
            // Note: These fireflies will orbit the SPAWN point.
            // Making them follow the moving moth requires changes to updateFireflies.
        }
        // --- End Firefly Spawn ---

        // --- Rest of Create ---
        this.createAnimations();
        this.createFallbackBirds();
        this.setupCollisions();
        // this.setupLighting(); // Moved earlier
        this.createWater();
        this.setupInput();
        this.glitchManager?.createStaticTexture();
        console.log("Phaser: Create complete.");
    }

    // --- Create Helpers ---

    handleError(message) { 
         console.error("Phaser Error:", message);
         this.add.text(100, 100, `Error: ${message}`, { color: '#ff0000', fontSize: '16px', backgroundColor: '#000' })
             .setScrollFactor(0).setDepth(200);
    }

    setupMapAndLayers() { 
         console.log("Creating tilemap...");
         if (!this.cache.tilemap.exists(ASSETS.MAP_DATA.key)) {
             return this.handleError(`Tilemap data key "${ASSETS.MAP_DATA.key}" not found.`);
         }
         const map = this.make.tilemap({ key: ASSETS.MAP_DATA.key });
         this.map = map;
         const worldWidth = map.widthInPixels;
         const worldHeight = map.heightInPixels;
         this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
         const tilesetMain = map.addTilesetImage(TILED_NAMES.TILESET_MAIN, ASSETS.TILESET_MAIN.key);
         const tilesetTrees = map.addTilesetImage(TILED_NAMES.TILESET_TREES, ASSETS.TREES.key);
         const tilesetDecorations = map.addTilesetImage(TILED_NAMES.TILESET_DECORATIONS, ASSETS.DECORATIONS.key);
         const tilesetViking = map.addTilesetImage(TILED_NAMES.TILESET_VIKING, ASSETS.VIKING.key);
         const tilesetStore1 = map.addTilesetImage(TILED_NAMES.TILESET_STORE1, ASSETS.STORE_TILESET.key);
         const tilesetPlane = map.addTilesetImage(TILED_NAMES.TILESET_PLANE, ASSETS.PLANE_TILESET.key);
         const tilesetHarbourmaster = map.addTilesetImage(TILED_NAMES.TILESET_HARBOURMASTER, ASSETS.HARBOURMASTER_TILESET.key);
         if (!tilesetMain) return this.handleError(`Failed to add main tileset "${TILED_NAMES.TILESET_MAIN}".`);
         const allTilesets = [tilesetMain, tilesetTrees, tilesetDecorations, tilesetViking, tilesetStore1, tilesetPlane, tilesetHarbourmaster].filter(ts => ts);
         this.collisionLayer = map.createLayer(TILED_NAMES.LAYER_COLLISION, allTilesets, 0, 0)?.setDepth(0);
         map.createLayer(TILED_NAMES.LAYER_DECOR_BACK, allTilesets, 0, 0)?.setDepth(-1);
         map.createLayer(TILED_NAMES.LAYER_TREES, allTilesets, 0, 0)?.setDepth(-2);
         if (!this.collisionLayer) return this.handleError(`Failed to create collision layer "${TILED_NAMES.LAYER_COLLISION}".`);
         this.collisionLayer.setCollisionByProperty({ [TILED_NAMES.PROPERTY_COLLIDES]: true });
        this.glitchTriggerZones = [];
        this.mothTriggerZoneRect = null; // Reset in case scene restarts
        this.margotTriggerZoneRect = null; // Reset Margot's trigger rect
        const triggerLayer = this.map.getObjectLayer(TILED_NAMES.LAYER_TRIGGERS);

        if (triggerLayer) {
            triggerLayer.objects.forEach(obj => {
                // --- Find Viking Zone ---
                if (obj.name === TILED_NAMES.OBJECT_NAME_VIKING_TRIGGER) {
                    const zoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                    const effect = getTiledPropertyValue(obj.properties, TILED_NAMES.PROPERTY_GLITCH_EFFECT) || 'random';
                    this.glitchTriggerZones.push({ name: obj.name, rect: zoneRect, effect: effect, isActive: true });
                }
                // --- >>> Find Moth Zone <<< ---
                else if (obj.name === TILED_NAMES.OBJECT_NAME_MOTH_TRIGGER) {
                     console.log(`Found ${TILED_NAMES.OBJECT_NAME_MOTH_TRIGGER} at x:${obj.x}, y:${obj.y}`);
                     // Store the zone's rectangle
                     this.mothTriggerZoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                }
                // --- >>> FIND LakeTriggerZone <<< ---
                else if (obj.name === TILED_NAMES.OBJECT_NAME_LAKE_TRIGGER) { // Use constant
                    console.log(`Found <span class="math-inline">\{TILED\_NAMES\.OBJECT\_NAME\_LAKE\_TRIGGER\} at x\:</span>{obj.x}, y:${obj.y}`);
                    const zoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                    this.glitchTriggerZones.push({
                        name: obj.name,
                        rect: zoneRect,
                        isActive: true, // It should be active initially
                        type: 'lake_boundary' // Custom type
                    });
                }
                else if (obj.name === TILED_NAMES.OBJECT_NAME_WATER_FOUNTAIN_TRIGGER) {
                    console.log(`Found ${TILED_NAMES.OBJECT_NAME_WATER_FOUNTAIN_TRIGGER} (Name from Tiled: "${obj.name}") at x:${obj.x}, y:${obj.y}`); // Enhanced log
                    const zoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                    this.glitchTriggerZones.push({
                        name: obj.name, // This should be "WaterFountainTriggerZone"
                        rect: zoneRect,
                        isActive: true,
                        type: 'fishfly_fountain_interaction' // Make sure this type is unique and correct
                    });
                }
                    // --- >>> Find MargotTriggerZone <<< ---
                else if (obj.name === TILED_NAMES.OBJECT_NAME_MARGOT_TRIGGER) { // Ensure this matches your constant
                    console.log(`Found ${TILED_NAMES.OBJECT_NAME_MARGOT_TRIGGER} at x:${obj.x}, y:${obj.y}`); // Corrected log
                    this.margotTriggerZoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                        let margotSpawnX = obj.x + (obj.width / 2);
                        let margotSpawnY = obj.y + 5 + obj.height - (MARGOT_CONFIG.SPRITE_HEIGHT / 2);

                        if (typeof MargotNPC !== 'undefined') {
                            this.margotNpc = new MargotNPC(this, margotSpawnX, margotSpawnY);
                            if (this.npcs) {
                                this.npcs.add(this.margotNpc);
                            } else {
                                console.error("this.npcs group not initialized before adding MargotNPC!");
                            }
                            this.margotNpc.setActive(true).setVisible(true);
                            console.log("Margot NPC instance added to scene and group.");
                        } else {
                            console.error("MargotNPC class not defined. Make sure MargotNPC.js is included in your HTML.");
                        }
                    }
            });
        } else {
            console.warn(`Tiled object layer '${TILED_NAMES.LAYER_TRIGGERS}' not found.`);
        }

        if (!this.margotTriggerZoneRect) {
            console.warn(`!!! ${TILED_NAMES.OBJECT_NAME_MARGOT_TRIGGER} not found in Tiled map object layer '${TILED_NAMES.LAYER_TRIGGERS}' !!!`); // Corrected log
        }
        if (!this.mothTriggerZoneRect) {
            console.warn(`!!! ${TILED_NAMES.OBJECT_NAME_MOTH_TRIGGER} not found in Tiled map object layer '${TILED_NAMES.LAYER_TRIGGERS}' !!!`);
        }
    } // end setupMapAndLayers

    createPlayerAndCamera() { 
         console.log("Creating player...");
         const spawnX = PLAYER_CONFIG.START_X;
         let spawnY = this.map.heightInPixels - (PLAYER_CONFIG.SPRITE_HEIGHT / 2);
         if (this.collisionLayer) {
             const spawnTileX = Math.floor(spawnX / TILE_SIZE);
             let groundFound = false;
             for (let y = this.collisionLayer.height - 1; y >= 0; y--) {
                 const tile = this.collisionLayer.getTileAt(spawnTileX, y);
                 if (tile?.properties[TILED_NAMES.PROPERTY_COLLIDES]) {
                     spawnY = tile.getTop() - (PLAYER_CONFIG.BODY_HEIGHT / 2) - 2; groundFound = true; break;
                 }
             }
              if (!groundFound) console.warn(`No ground tile found below X=${spawnX.toFixed(1)}.`);
         } else { console.warn(`Collision layer not ready for player ground check.`); }
         this.player = new Player(this, spawnX, spawnY);
         this.glitchManager?.setPlayer(this.player);
         this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
         this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    }

    createAnimations() {
         console.log("Creating non-player/bird animations...");
         if (WATER_CONFIG.NUM_FRAMES > 0 && !this.anims.exists(WATER_CONFIG.ANIM_KEY)) {
             this.anims.create({ key: WATER_CONFIG.ANIM_KEY, frames: this.anims.generateFrameNumbers(ASSETS.WATER_SPRITESHEET.key, { start: 0, end: WATER_CONFIG.NUM_FRAMES - 1 }), frameRate: WATER_CONFIG.FRAME_RATE, repeat: -1 });
         }
    }

    createFallbackBirds() { 
         console.log("Placing birds directly...");
         const sleepingBird = new Bird(this, 700, 290, 'sleeping');
         this.birds.add(sleepingBird);
         const figure8Bird = new Bird(this, 0, 0, 'figure8');
         this.birds.add(figure8Bird);
    }

    createFishflySwarm(spawnX, spawnY, playerTarget) {
        if (!this.textures.exists(FISHFLIES_CONFIG.TEXTURE_KEY)) {
            console.warn("Fishfly texture not created yet!");
            return;
        }
        if (!playerTarget) {
            console.warn("Player target not provided for fishfly swarm!");
            return;
        }
    
        const numFishFlies = Phaser.Math.Between(FISHFLIES_CONFIG.PER_SWARM_POINT.min, FISHFLIES_CONFIG.PER_SWARM_POINT.max);
        // console.log(`Creating <span class="math-inline">\{numFishFlies\} fish flies from \(</span>{spawnX},${spawnY}) targeting player.`);
    
        for (let i = 0; i < numFishFlies; i++) {
            const fishFlyInstance = new FishFly(
                this, // scene
                spawnX, // x
                spawnY, // y
                FISHFLIES_CONFIG.TEXTURE_KEY,
                playerTarget,
                spawnX, // initialSpawnX (the fountain's location)
                spawnY, // initialSpawnY (the fountain's location)
                FISHFLIES_CONFIG // Pass the configuration
            );
            this.fishFliesSwarm.add(fishFlyInstance); // Add the new FishFly instance to your existing group
        }
    }
     
    setupCollisions() {
        // ... existing player/collision layer collision ...
        if (this.player && this.collisionLayer) {
            this.physics.add.collider(this.player, this.collisionLayer);
        } else { console.warn("Could not add player-ground collision."); }

        // --- Add Player-NPC Overlap ---
        if (this.player && this.npcs) {
            // Use the group for collision checks
            this.physics.add.overlap(this.player, this.npcs, this.handlePlayerNpcOverlap, null, this);
            console.log("Added overlap check between player and npcs group.");
        }
    }

    handlePlayerNpcOverlap(player, npc) {
        // Check which type of NPC it is if you have multiple types
        if (npc instanceof MothNPC) {
             console.log("Player overlapped with MothNPC");
             // Optionally call a specific interaction method on the moth:
             // if (typeof npc.handleInteraction === 'function') {
             //     npc.handleInteraction();
             // }
             // Add a small cooldown to prevent constant logging/triggering
             if (!npc.getData('isOverlapping')) {
                npc.setData('isOverlapping', true);
                this.time.delayedCall(500, () => {
                    npc.setData('isOverlapping', false);
                });
            }
        }
        else if (npc instanceof MargotNPC) {
        // console.log("Player is overlapping with MargotNPC.");
        // This is where you could put a simpler interaction if she's NOT in her main sequence.
        // For now, the main interaction is via the trigger zone.
        if (!npc.getData('isOverlapping')) { // Simple cooldown for repeated overlap logs
            npc.setData('isOverlapping', true);
            this.time.delayedCall(500, () => {
                if (npc.active) { // Check if npc still exists
                   npc.setData('isOverlapping', false);
                }
            });
        }
    }
    }

    setupLighting() { 
         console.log("Setting up lighting...");
         this.lights.enable().setAmbientColor(AMBIENT_LIGHT_COLOR);
         if(this.player) {
             this.playerLight = this.lights.addLight(this.player.x, this.player.y, PLAYER_CONFIG.LIGHT_RADIUS).setColor(PLAYER_CONFIG.LIGHT_COLOR).setIntensity(PLAYER_CONFIG.LIGHT_INTENSITY);
         }
         this.fireflies = this.add.group();
         const lightObjectLayer = this.map.getObjectLayer(TILED_NAMES.LAYER_OBJECTS);
         if (lightObjectLayer) {
              lightObjectLayer.objects.forEach(object => {
                  if (getTiledPropertyValue(object.properties, TILED_NAMES.PROPERTY_LIGHT_TYPE) === TILED_NAMES.OBJECT_TYPE_LIGHT) {
                      const lightX = object.x + (object.width ? object.width / 2 : 0); const lightY = object.y + (object.height ? object.height / 2 : 0);
                      const radius = getTiledPropertyValue(object.properties, TILED_NAMES.PROPERTY_LIGHT_RADIUS) || 150; const intensity = getTiledPropertyValue(object.properties, TILED_NAMES.PROPERTY_LIGHT_INTENSITY) || 0.8;
                      let color = 0xffffff; const colorProp = getTiledPropertyValue(object.properties, TILED_NAMES.PROPERTY_LIGHT_COLOR);
                      if (colorProp) { try { const parsedColor = parseInt(String(colorProp).replace('#', ''), 16); if (!isNaN(parsedColor)) color = parsedColor; } catch (e) { console.warn("Error parsing Tiled light color"); } }
                      this.lights.addLight(lightX, lightY, radius).setColor(color).setIntensity(intensity);
                      this.createFirefliesForLight(lightX, lightY);
                  }
              });
         } else console.warn(`Tiled light layer '${TILED_NAMES.LAYER_OBJECTS}' not found.`);
         this.map.layers.forEach(layer => { if (layer.tilemapLayer) layer.tilemapLayer.setPipeline('Light2D'); });
    }

    createFirefliesForLight(lightX, lightY) { 
         const numFireflies = Phaser.Math.Between(FIREFLY_CONFIG.PER_LIGHT.min, FIREFLY_CONFIG.PER_LIGHT.max);
         if (!this.fireflyTextureCreated && !this.textures.exists(FIREFLY_CONFIG.TEXTURE_KEY)) {
              const gfx = this.make.graphics({ x: 0, y: 0 }, false); const maxSize = FIREFLY_CONFIG.SIZE.max;
              gfx.fillStyle(FIREFLY_CONFIG.COLOR, 1).fillCircle(maxSize, maxSize, maxSize); gfx.generateTexture(FIREFLY_CONFIG.TEXTURE_KEY, maxSize * 2, maxSize * 2); gfx.destroy(); this.fireflyTextureCreated = true;
         }
         if (!this.textures.exists(FIREFLY_CONFIG.TEXTURE_KEY)) return;
         for (let i = 0; i < numFireflies; i++) {
             const firefly = this.fireflies.create(lightX, lightY, FIREFLY_CONFIG.TEXTURE_KEY); if (!firefly) continue;
             const orbitRadius = Phaser.Math.FloatBetween(FIREFLY_CONFIG.ORBIT_RADIUS.min, FIREFLY_CONFIG.ORBIT_RADIUS.max); const orbitSpeed = Phaser.Math.FloatBetween(FIREFLY_CONFIG.ORBIT_SPEED.min, FIREFLY_CONFIG.ORBIT_SPEED.max) * Phaser.Math.RND.pick([-1, 1]); const startAngle = Phaser.Math.FloatBetween(0, Math.PI * 2); const scale = Phaser.Math.FloatBetween(FIREFLY_CONFIG.SIZE.min, FIREFLY_CONFIG.SIZE.max) / FIREFLY_CONFIG.SIZE.max;
             firefly.setData({ centerX: lightX, centerY: lightY, orbitRadius: orbitRadius, orbitSpeed: orbitSpeed, currentAngle: startAngle, radiusAmplitude: Phaser.Math.FloatBetween(FIREFLY_CONFIG.RADIUS_OSCILLATION.amplitude * 0.5, FIREFLY_CONFIG.RADIUS_OSCILLATION.amplitude * 1.5), radiusOscSpeed: Phaser.Math.FloatBetween(FIREFLY_CONFIG.RADIUS_OSCILLATION.speed * 0.5, FIREFLY_CONFIG.RADIUS_OSCILLATION.speed * 1.5) * Phaser.Math.RND.pick([-1, 1]) });
             firefly.setAlpha(Phaser.Math.FloatBetween(FIREFLY_CONFIG.ALPHA.min, FIREFLY_CONFIG.ALPHA.max)).setScale(scale).setDepth(FIREFLY_CONFIG.DEPTH).setPipeline('Light2D');
             const initialRadius = orbitRadius + Math.sin(0) * firefly.getData('radiusAmplitude'); firefly.x = lightX + Math.cos(startAngle) * initialRadius; firefly.y = lightY + Math.sin(startAngle) * initialRadius;
         }
    }

    createStars() { 
         console.log("Creating stars...");
         this.stars = this.add.group();
         const numStars = Math.floor((this.map?.widthInPixels || this.cameras.main.width) / 15); const starTextureKey = 'star_pixel';
         if (!this.textures.exists(starTextureKey)) { const starGfx = this.make.graphics().fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2); starGfx.generateTexture(starTextureKey, 2, 2); starGfx.destroy(); }
         for (let i = 0; i < numStars; i++) {
             const sX = Phaser.Math.Between(0, this.map?.widthInPixels || this.cameras.main.width); const sY = Phaser.Math.Between(0, this.cameras.main.height * 0.8);
             const star = this.stars.create(sX, sY, starTextureKey);
             if(star) { star.setScale(Phaser.Math.FloatBetween(0.3, 1.2)).setAlpha(Phaser.Math.FloatBetween(0.4, 0.9)).setData({ twinkleSpeed: Phaser.Math.FloatBetween(0.001, 0.005), baseAlpha: star.alpha }).setScrollFactor(Phaser.Math.FloatBetween(0.1, 0.5)).setDepth(-5); }
         }
    }

    createFishflyTexture() {
        if (!this.textures.exists(FISHFLIES_CONFIG.TEXTURE_KEY)) {
            const gfx = this.make.graphics({ x: 0, y: 0 }, false);
            const maxSize = FISHFLIES_CONFIG.SIZE.max;
            // Fish flies might not glow, so a simple fill might be enough, or a slightly more complex shape
            gfx.fillStyle(FISHFLIES_CONFIG.COLOR, 1); // Use fishfly color
            // Could be a small rectangle or just a circle
            gfx.fillRect(0, 0, maxSize, maxSize); // Simple square particle
            // gfx.fillCircle(maxSize, maxSize, maxSize); // Or a circle
            gfx.generateTexture(FISHFLIES_CONFIG.TEXTURE_KEY, maxSize, maxSize); // Adjust texture size if using fillRect
            gfx.destroy();
            console.log("Created fishfly texture:", FISHFLIES_CONFIG.TEXTURE_KEY);
        }
    }

    createWater() { 
         console.log("Placing animated water sprites...");
         const screenHeight = this.cameras.main.height; const waterY = screenHeight - WATER_CONFIG.FRAME_HEIGHT + 24;
         if (this.anims.exists(WATER_CONFIG.ANIM_KEY)) {
             for (let i = 0; i < WATER_CONFIG.SPRITE_COUNT; i++) { const waterX = i * WATER_CONFIG.FRAME_WIDTH; this.add.sprite(waterX, waterY, ASSETS.WATER_SPRITESHEET.key).setOrigin(0, 0).setDepth(WATER_CONFIG.DEPTH).setPipeline('Light2D').play(WATER_CONFIG.ANIM_KEY); }
         } else { this.handleError(`Water animation '${WATER_CONFIG.ANIM_KEY}' missing!`); }
    }

    setupInput() {
        // Setup player controls
        this.cursors = this.input.keyboard.createCursorKeys();
        // Setup Glitch keys (Debug key moved to UIManager)
        this.glitchKeyU = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U);
        this.glitchKeyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.glitchKeyO = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
        this.glitchKeyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    // --- Update Method ---
    update(time, delta) {
        if (!this.cursors || !this.player?.active) {
            return; // Early exit if player or controls aren't ready
        }
    
        // --- Update Parallax Backgrounds ---
        const scrollX = this.cameras.main.scrollX;
        // this.originalBackground?.setTilePosition(scrollX * PARALLAX_FACTORS.ORIGINAL_BG); // Assuming PARALLAX_FACTORS is defined
        this.bgLayer1?.setTilePosition(scrollX * PARALLAX_FACTORS.BG_LAYER_1); // Ensure PARALLAX_FACTORS is defined
        this.bgLayer2?.setTilePosition(scrollX * PARALLAX_FACTORS.BG_LAYER_2); // and contains these keys
        this.bgLayer3?.setTilePosition(scrollX * PARALLAX_FACTORS.BG_LAYER_3);
    
        // --- Update Player ---
        this.player.update(this.cursors);
    
        // --- Update Stars ---
        this.updateStars(time);
    
        // --- Update General Fireflies (if these are different from FishFlies) ---
        this.updateFireflies(time, delta); // This updates your original fireflies group, not the fishfly swarm
    
        // --- Update Player's Personal Light ---
        this.updatePlayerLight();
    
        // --- Update Fishfly Swarm Light ---
        if (this.fishFliesSwarmLight) {
            const activeFishFlies = this.fishFliesSwarm.getChildren().filter(ff => ff.active && ff.visible);
    
            if (activeFishFlies.length > 0) {
                let centerX = 0;
                let centerY = 0;
                activeFishFlies.forEach(fly => {
                    centerX += fly.x;
                    centerY += fly.y;
                });
                this.fishFliesSwarmLight.x = centerX / activeFishFlies.length;
                this.fishFliesSwarmLight.y = centerY / activeFishFlies.length;
    
                // Ensure light is on if it was turned off
                if (!this.fishFliesSwarmLight.visible) {
                    this.fishFliesSwarmLight.setVisible(true);
                }
                // Restore intensity (ensure FISHFLIES_CONFIG.LIGHT_INTENSITY is defined)
                const targetIntensity = FISHFLIES_CONFIG.LIGHT_INTENSITY || 0.55;
                // If you want to ensure it's always at targetIntensity when active:
                this.fishFliesSwarmLight.setIntensity(targetIntensity);
                // Or if you only want to restore if it was 0:
                // if (this.fishFliesSwarmLight.intensity < targetIntensity) { // Or === 0
                //     this.fishFliesSwarmLight.setIntensity(targetIntensity);
                // }
    
            } else {
                // No active fishflies, effectively turn off the light
                this.fishFliesSwarmLight.setIntensity(0); // Good for performance
                this.fishFliesSwarmLight.setVisible(false); // Also hide it
            }
        }
    
        // --- Update Birds ---
        const worldView = this.cameras.main.worldView;
        this.birds?.children.iterate(bird => {
            if (bird?.active && typeof bird.update === 'function') {
                bird.update(this.player, time, delta, worldView);
            }
        });
    
        // --- Update NPCs (like MothNPC) ---
        this.npcs?.children.iterate(npc => {
            if (npc?.active && typeof npc.update === 'function') {
                npc.update(time, delta); // Assuming MothNPC and other NPCs have an update method
            }
        });
    
        // --- Update Systems & Checks ---
        this.checkGlitchTriggers();
        this.handleGlitches(time); // For manual glitch key presses
    
        // --- Update UI Manager ---
        this.uiManager?.handleInput();
        const uiData = { /* ... pass any dynamic data needed by UI ... */ };
        this.uiManager?.update(uiData);
    }

    // --- Helper Update Methods ---

    updateBackground() { 
         if (this.background) { this.background.tilePositionX = this.cameras.main.scrollX * PARALLAX_FACTOR; }
    }

    updateStars(time) { 
         if (this.stars) { this.stars.children.iterate(star => { if (star?.getData) { const speed = star.getData('twinkleSpeed') || 0.003; const baseAlpha = star.getData('baseAlpha') || 0.8; star.setAlpha(baseAlpha * (0.75 + Math.sin(time * speed) * 0.25)); } }); }
    }

    updateFireflies(time, delta) { 
         if (this.fireflies) { this.fireflies.children.iterate(firefly => { if (firefly?.getData) { const centerX = firefly.getData('centerX'); const centerY = firefly.getData('centerY'); const baseOrbitRadius = firefly.getData('orbitRadius'); const orbitSpeed = firefly.getData('orbitSpeed'); let currentAngle = firefly.getData('currentAngle'); const radiusAmplitude = firefly.getData('radiusAmplitude'); const radiusOscSpeed = firefly.getData('radiusOscSpeed'); currentAngle += orbitSpeed * (delta / 16.667); firefly.setData('currentAngle', currentAngle); const currentRadius = baseOrbitRadius + Math.sin(time * radiusOscSpeed) * radiusAmplitude; firefly.x = centerX + Math.cos(currentAngle) * currentRadius; firefly.y = centerY + Math.sin(currentAngle) * currentRadius; } }); }
    }

    updatePlayerLight() { 
         if (this.playerLight && this.player) { this.playerLight.x = this.player.x; this.playerLight.y = this.player.y; }
    }

    checkGlitchTriggers() {
        if (!this.player?.body || !this.glitchManager || !this.glitchTriggerZones.length) return;

        const playerBodyRect = new Phaser.Geom.Rectangle(this.player.body.x, this.player.body.y, this.player.body.width, this.player.body.height);

        this.glitchTriggerZones.forEach(zone => {
            if (zone?.isActive && zone.rect && Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, zone.rect)) {
                console.log(`Player entered ACTIVE zone: ${zone.name}`);
                zone.isActive = false; // Make it a one-time trigger

                if (zone.name === TILED_NAMES.OBJECT_NAME_VIKING_TRIGGER) {
                    console.log("Switching background, adding effects, scheduling message!");

                    // --- BACKGROUND, LIGHT, FIREFLIES ---
                    this.originalBackground?.setVisible(true);
                    this.stars?.setVisible(true);
                    this.bgLayer1?.setVisible(true);
                    this.bgLayer2?.setVisible(true);
                    this.bgLayer3?.setVisible(true);

                    const zoneCenterX = zone.rect.x + zone.rect.width / 2;
                    const zoneCenterY = zone.rect.y + 16;
                    const newLightRadius = 200;
                    const newLightColor = 0xFFFFCC;
                    const newLightIntensity = 0.85;
                    this.lights.addLight(zoneCenterX, zoneCenterY, newLightRadius).setColor(newLightColor).setIntensity(newLightIntensity);
                    if (this.createFirefliesForLight) { this.createFirefliesForLight(zoneCenterX, zoneCenterY); }


                    const passwordMessage = "Remember the password: Luana Moth";
                    const screenCenterX = this.cameras.main.centerX;
                    const screenCenterY = this.cameras.main.centerY;
                    const startTypingDelay = 1500; // Wait 1.5 seconds after glitch trigger

                    console.log(`Scheduling password typing animation in ${startTypingDelay}ms.`);

                    // Schedule the function call
                    this.time.delayedCall(
                        startTypingDelay,          // Delay in milliseconds
                        this.animateTextDisplay,   // Function to call (needs to be created)
                        [passwordMessage, screenCenterX, screenCenterY, TEXT_STYLE], // Arguments for the function
                        this                       // Context (the scene)
                    );

                    // --- TRIGGER GLITCH EFFECTS (as before) ---
                    this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.U);
                    this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.I);
                    this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.O);
                    this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.P);
                }
                // LAKETRIGGER GLITCH
                else if (zone.name === TILED_NAMES.OBJECT_NAME_LAKE_TRIGGER) {
                    console.log(`Player entered Lake Boundary zone: ${zone.name}`);

                    // --- PART 1: Flash ORIGINAL BACKGROUND with 'I' key effect ---
                    if (this.glitchManager && this.originalBackground &&
                        typeof this.glitchManager.setBackground === 'function' &&
                        typeof this.glitchManager.triggerGlitchByKey === 'function') {

                        console.log("Lake Trigger: Flashing originalBackground with Ethereal Storm...");
                        const previousGlitchManagerTarget = this.glitchManager.background; // Store current default (e.g., bgLayer3)
                        const stormDuration = GLITCH_CONFIG.STORM_DURATION || 900; // Get duration from your GLITCH_CONFIG

                        this.originalBackground.setVisible(true); // IMPORTANT: Make sure originalBackground is visible for the effect
                        this.glitchManager.setBackground(this.originalBackground); // Tell GlitchManager to target originalBackground

                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.U);
                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.I);
                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.O);
                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.P);

                        // After the storm duration, restore GlitchManager's default background target
                        this.time.delayedCall(stormDuration + 100, () => { // Add a small buffer
                            if (this.glitchManager) {
                                this.glitchManager.setBackground(previousGlitchManagerTarget);
                                console.log("Lake Trigger: Restored GlitchManager default background target.");
                            }
                            // Optional: If originalBackground is *only* for this flash and not usually visible, hide it again.
                            // If originalBackground is your standard furthest background, you can leave it visible.
                            // Example: if (!this.sceneInitiallyShowsOriginalBackground) this.originalBackground.setVisible(false);
                        }, [], this);
                    }
                    // Display "the lake is not safe right now" message
                    const lakeMessage = "The lake is not safe right now";
                    const screenCenterX = this.cameras.main.centerX;
                    const screenCenterY = this.cameras.main.centerY + 60; // Adjust Y as needed
                    // Ensure TEXT_STYLE is defined, or use a literal style object
                    const lakeMessageStyle = TEXT_STYLE || { font: '14px monospace', fill: '#ff8888', backgroundColor: 'rgba(30,0,0,0.7)', padding: { x: 10, y: 5 }, align: 'center', wordWrap: {width: this.cameras.main.width * 0.8} };

                    // Decide if you want this message to spell out or appear instantly.
                    // If using animateTextDisplay, be mindful of the cooldown for the LakeTriggerZone.
                    this.animateTextDisplay(lakeMessage, screenCenterX, screenCenterY, lakeMessageStyle);
                    // OR, if you have/create an instant message display in UIManager:
                    // if (this.uiManager && typeof this.uiManager.displayTemporaryMessage === 'function') {
                    //    this.uiManager.displayTemporaryMessage(lakeMessage, 3000); // Display for 3 seconds
                    // } else { // Fallback to spelling it out
                    //    this.animateTextDisplay(lakeMessage, screenCenterX, screenCenterY, lakeMessageStyle);
                    // }


                    // 2c. Push the player back
                    if (this.player) {
                        this.player.setVelocityX(150); // Adjust direction/force as needed (e.g., -150 if lake is to the right)
                        if (typeof this.player.disableControlsForDuration === 'function') {
                            this.player.disableControlsForDuration(300); // Disable controls briefly
                        }
                    }

                    //Cooldown for this re-triggerable Lake Zone ---
                    zone.isActive = false; // Deactivate temporarily
                    const lakeCooldown = 10000; // IMPORTANT: Make this long enough if using animateTextDisplay (e.g., 4-5 seconds)
                                            // If using an instant message, 1500-2500ms might be fine.
                    this.time.delayedCall(lakeCooldown, () => {
                        if (zone) { // Check if zone still exists
                            zone.isActive = true; // Reactivate
                            console.log("LakeTriggerZone re-activated.");
                        }
                    }, [], this);
                }
                else if (zone.name === TILED_NAMES.OBJECT_NAME_WATER_FOUNTAIN_TRIGGER || zone.type === 'fishfly_fountain_interaction') {
                    console.log(`Player entered Fish Fly Fountain zone: ${zone.name}`);
                    zone.isActive = false;
                
                    const fountainVisualCenterX = zone.rect.x + zone.rect.width / 2;
                    const fountainVisualTopY = zone.rect.y + 16;
                
                    if (typeof this.createFishflySwarm === 'function' && this.player) {
                        if (this.fishFliesSwarm && this.fishFliesSwarm.countActive(true) === 0) {
                            console.log("Creating new fishfly swarm, emerging from fountain.");
                            this.createFishflySwarm(fountainVisualCenterX, fountainVisualTopY, this.player);
                
                            // ---> ADD/ENABLE SWARM LIGHT <---
                            if (this.fishFliesSwarm.countActive(true) > 0) { // Check if flies were actually created
                                const lightRadius = FISHFLIES_CONFIG.LIGHT_RADIUS || 60; // Define in FISHFLIES_CONFIG
                                const lightColor = FISHFLIES_CONFIG.LIGHT_COLOR || 0xffb070;  // Define in FISHFLIES_CONFIG (e.g., a warm orange)
                                const lightIntensity = FISHFLIES_CONFIG.LIGHT_INTENSITY || 0.5; // Define in FISHFLIES_CONFIG
                
                                if (!this.fishFliesSwarmLight) {
                                    this.fishFliesSwarmLight = this.lights.addLight(fountainVisualCenterX, fountainVisualTopY, lightRadius, lightColor, lightIntensity);
                                } else {
                                    this.fishFliesSwarmLight.setPosition(fountainVisualCenterX, fountainVisualTopY);
                                    this.fishFliesSwarmLight.setRadius(lightRadius);
                                    this.fishFliesSwarmLight.setColor(lightColor);
                                    this.fishFliesSwarmLight.setIntensity(lightIntensity);
                                    this.fishFliesSwarmLight.setVisible(true);
                                }
                            }
                            
                
                        } else {
                            console.log("Fishfly swarm might already exist or group not initialized.");
                        }
                    } else {
                        console.warn("createFishflySwarm function not found!");
                    }
            
                    // B. Start Dialogue Sequence
                    if (this.uiManager && typeof this.uiManager.startDialogueSequence === 'function') {
                        // Disable player movement (UIManager might do this, or you do it here)
                        if (this.player && typeof this.player.setControllable === 'function') {
                            this.player.setControllable(false); // Player needs this method
                        }

                        console.log("GameScene: Attempting to start fish_flies_fountain_intro dialogue.");
                        this.uiManager.startDialogueSequence('fish_flies_fountain_intro', () => {
                            console.log("GameScene: Fish flies dialogue sequence finished.");
                            if (this.player && typeof this.player.setControllable === 'function') {
                                this.player.setControllable(true);
                            }
                        
                            if (this.fishFliesSwarm) {
                                this.fishFliesSwarm.children.each(fishFly => {
                                    // Ensure it's an instance of your FishFly class and is active
                                    if (fishFly instanceof FishFly && fishFly.active) {
                                        fishFly.returnHome(); // Call the method on the FishFly instance
                                    }
                                });
                            }
                            // The light turning off is handled by GameScene's update loop
                            // when it sees no active fishflies remain.
                        });
                    } 
                    
                    else {
                        console.warn("UIManager.startDialogueSequence function not found! Cannot start dialogue.");
                    }
                }
                
                //ADD OTHER GLITCHS?
            }

        });
        // --- Handle Margot Trigger (separate check) ---
        if (this.margotNpc && this.margotTriggerZoneRect &&
            !this.margotNpc.hasInteracted && !this.margotNpc.isInteracting) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, this.margotTriggerZoneRect)) {
                console.log("Player entered MargotTriggerZone, initiating interaction.");
                this.margotNpc.startInteraction();
            }
        }
    }

    handleGlitches(time) { 
         if (!this.glitchManager) return;
         if (Phaser.Input.Keyboard.JustDown(this.glitchKeyU)) this.glitchManager.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.U);
         if (Phaser.Input.Keyboard.JustDown(this.glitchKeyI)) this.glitchManager.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.I);
         if (Phaser.Input.Keyboard.JustDown(this.glitchKeyO)) this.glitchManager.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.O);
         if (Phaser.Input.Keyboard.JustDown(this.glitchKeyP)) this.glitchManager.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.P);
    }

    animateTextDisplay(fullMessage, x, y, style) {
        console.log("Starting text animation for:", fullMessage);

        // --- Cleanup previous instance (if any) ---
        if (this.typingTimer) {
            this.typingTimer.remove();
            this.typingTimer = null;
        }
        if (this.passwordTextObject) {
            this.passwordTextObject.destroy();
            this.passwordTextObject = null;
        }

        // --- Create the text object (initially empty and fully opaque) ---
        this.passwordTextObject = this.add.text(x, y, '', style)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(100)
            .setAlpha(1); // Ensure it starts fully visible

        // --- Typing animation settings ---
        let characterIndex = 0;
        const characterTypeDelay = 70;    // Milliseconds between characters
        const displayDuration = 3000;   // Milliseconds to display AFTER typing (3 seconds)
        const fadeOutDuration = 500;    // Milliseconds for the fade-out animation (0.5 seconds)

        // --- Start the character typing timer ---
        this.typingTimer = this.time.addEvent({
            delay: characterTypeDelay,
            callback: () => {
                // Still typing?
                if (characterIndex < fullMessage.length) {
                    this.passwordTextObject.text += fullMessage[characterIndex];
                    characterIndex++;
                } else {
                    // ===== Typing complete =====
                    console.log("Text animation complete. Text will display for", displayDuration / 1000, "seconds.");

                    // Stop the typing timer
                    if (this.typingTimer) {
                        this.typingTimer.remove();
                        this.typingTimer = null;
                    }

                    // --- Schedule the fade-out and destruction ---
                    this.time.delayedCall(displayDuration, () => {
                        // Check if the text object still exists (e.g., wasn't manually destroyed)
                        if (this.passwordTextObject) {
                             console.log("Starting fade out animation.");
                             // Create a tween to fade the alpha
                             this.tweens.add({
                                targets: this.passwordTextObject,
                                alpha: 0, // Target alpha value (fully transparent)
                                duration: fadeOutDuration,
                                ease: 'Power1', // A simple easing function
                                onComplete: () => {
                                    // This runs AFTER the tween finishes
                                    console.log("Fade out complete. Destroying text object.");
                                    if (this.passwordTextObject) {
                                        this.passwordTextObject.destroy(); // Remove from scene
                                        this.passwordTextObject = null;   // Clear our reference
                                    }
                                }
                                // 'this' scope is usually handled correctly by arrow functions
                            });
                        } else {
                            console.log("Text object already gone before fade could start.");
                        }
                    }, [], this); // Pass scope `this` to delayedCall

                } // End of typing complete block
            },
            callbackScope: this,
            loop: true
        }); // End of addEvent

        // --- Safety check for empty messages ---
        if (fullMessage.length === 0 && this.typingTimer) {
             this.typingTimer.remove();
             this.typingTimer = null;
             // Also destroy the (empty) text object immediately if message was empty
             if(this.passwordTextObject) {
                this.passwordTextObject.destroy();
                this.passwordTextObject = null;
             }
        }
    }

} // End Scene Class

// --- Phaser Game Configuration ---
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 336,
    parent: 'phaser-game', 
    pixelArt: true,     
    physics: { default: 'arcade', arcade: { gravity: { y: 750 }, debug: false } },
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH, 
        zoom: 2,
    },
    scene: [CutsceneScene, GameScene] // Your scene(s)  
};

// --- Create the Phaser Game Instance ---
const game = new Phaser.Game(config);
