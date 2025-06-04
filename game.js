class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Ensure properties for all layers are present
        this.player = null; this.cursors = null; this.map = null; this.collisionLayer = null; this.birds = null;
        this.glitchManager = null; this.uiManager = null;
        this.originalBackground = null; 
        this.bgLayer1 = null; this.bgLayer2 = null; this.bgLayer3 = null; 
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
        this.mothDialogueTriggered = false;
        this.atlasMothSpawnData = null; 
        this.lunaMothNpc = null;
        this.lunaMothTriggerZoneRect = null;
        this.lunaMothDialogueTriggered = false;
        this.playerIsFollowingLunaMoth = false;
        this.playerSpawnData = null; 
        this.fishflySpawn1Data = null; 
        this.fishflyTrigger2Rect = null;
        this.fishflySpawn2Data = null; 
        this.fishflyDialogue2Triggered = false;
        this.gatekeeperNpc = null;
        this.gatekeeperSpawnData = null;
        this.gatekeeperTriggerRect = null;
        this.gatekeeperDialogueTriggered = false;
        this.lunaMothSequenceCompleted = false; 
        this.awaitingIncantationInput = false; 
        this.typedIncantation = "";            
        this.incantationTextObject = null;     
        this.incantationPromptText = null;    
        this.vikingIncantationTriggerZone = null; 
        this.incantationSuccessfulAndForestRevealed = false; 
        this.CORRECT_INCANTATION_WORD = "";
        this.INCANTATION_REPETITIONS = 0;
        this.FULL_CORRECT_INCANTATION = "";
        this.loadingText = null;
        this.orientationNotice = null; 
    }


    preload() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // 1. Create text with a fallback, visible immediately.
        this.loadingText = this.add.text(centerX, centerY, 'LOADING...', {
            fontFamily: 'monospace', // Fallback font
            fontSize: '48px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // 2. Attempt to apply the custom font once it's ready.
        // This relies on your CSS @font-face for 'EccoEpilogue' being correct.
        document.fonts.ready.then(() => {
            // This promise resolves when all CSS-linked fonts are loaded,
            // or at least when the browser has finished its initial font processing.
            if (this.loadingText && this.loadingText.active) {
                // Check if 'EccoEpilogue' is now actually available before setting it
                if (document.fonts.check('1em EccoEpilogue')) {
                    this.loadingText.setFontFamily('EccoEpilogue');
                    console.log('LOADING... text updated to EccoEpilogue (using document.fonts.ready).');
                } else {
                    console.warn('EccoEpilogue still not checkable after document.fonts.ready, using fallback.');
                }
            }
        });

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
        this.load.image(ASSETS.HOUSE1_TILESET.key, ASSETS.HOUSE1_TILESET.file);
        this.load.image(ASSETS.HOUSE2_TILESET.key, ASSETS.HOUSE2_TILESET.file);
        this.load.image(ASSETS.HOTEL_TILESET.key, ASSETS.HOTEL_TILESET.file);
        this.load.image(ASSETS.HARBOURMASTER_TILESET.key, ASSETS.HARBOURMASTER_TILESET.file);
        this.load.tilemapTiledJSON(ASSETS.MAP_DATA.key, ASSETS.MAP_DATA.file);
        this.load.spritesheet(ASSETS.PLAYER_IDLE.key, ASSETS.PLAYER_IDLE.file, { frameWidth: PLAYER_CONFIG.SPRITE_WIDTH, frameHeight: PLAYER_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.PLAYER_RUN.key, ASSETS.PLAYER_RUN.file, { frameWidth: PLAYER_CONFIG.SPRITE_WIDTH, frameHeight: PLAYER_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.PLAYER_JUMP.key, ASSETS.PLAYER_JUMP.file, { frameWidth: PLAYER_CONFIG.SPRITE_WIDTH, frameHeight: PLAYER_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.BIRD_SLEEP.key, ASSETS.BIRD_SLEEP.file, { frameWidth: BIRD_CONFIG.FRAME_WIDTH, frameHeight: BIRD_CONFIG.FRAME_HEIGHT });
        this.load.spritesheet(ASSETS.BIRD_FLY.key, ASSETS.BIRD_FLY.file, { frameWidth: BIRD_CONFIG.FRAME_WIDTH, frameHeight: BIRD_CONFIG.FRAME_HEIGHT });
        this.load.spritesheet(ASSETS.MOTH_SPRITESHEET.key, ASSETS.MOTH_SPRITESHEET.file, {frameWidth: MOTH_CONFIG.FRAME_WIDTH, frameHeight: MOTH_CONFIG.FRAME_HEIGHT});
        this.load.spritesheet(ASSETS.LUNA_MOTH_SPRITESHEET.key, ASSETS.LUNA_MOTH_SPRITESHEET.file, { frameWidth: LUNA_MOTH_CONFIG.FRAME_WIDTH, frameHeight: LUNA_MOTH_CONFIG.FRAME_HEIGHT });
        this.load.json(ASSETS.DIALOGUE_DATA.key, ASSETS.DIALOGUE_DATA.file);
        this.load.spritesheet(ASSETS.MARGOT_IDLE.key, ASSETS.MARGOT_IDLE.file, { frameWidth: MARGOT_CONFIG.SPRITE_WIDTH, frameHeight: MARGOT_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.MARGOT_WALK.key, ASSETS.MARGOT_WALK.file, { frameWidth: MARGOT_CONFIG.SPRITE_WIDTH, frameHeight: MARGOT_CONFIG.SPRITE_HEIGHT });
        this.load.spritesheet(ASSETS.GATEKEEPER_SPRITESHEET.key, ASSETS.GATEKEEPER_SPRITESHEET.file, { frameWidth: GATEKEEPER_CONFIG.FRAME_WIDTH, frameHeight: GATEKEEPER_CONFIG.FRAME_HEIGHT });
    }

    create() {
        if (this.loadingText) {
            this.loadingText.destroy();
            this.loadingText = null;
        }

        console.log("Phaser: Creating scene...");
        const camWidth = this.cameras.main.width;
        const camHeight = this.cameras.main.height;

        // Initialize Managers
        if (typeof GlitchManager !== 'undefined') {
            this.glitchManager = new GlitchManager(this);
        } else { console.error("GlitchManager class not found!"); }
        if (typeof UIManager !== 'undefined') {
            this.uiManager = new UIManager(this);
        } else { console.error("UIManager class not found!"); }


        // --- Create the Orientation Notice (Text-based for this example) ---
        // It's created but initially hidden or its visibility is set by checkOrientationDisplay.
        this.orientationNotice = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'Please rotate your device\nto Landscape mode', // Using \n for a potential line break
            {
                fontFamily: 'EccoEpilogue', //  <<< USE YOUR CUSTOM FONT HERE
                fontSize: '28px',          //  <<< SET FONT SIZE
                fill: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.85)',
                padding: { x: 20, y: 15 },
                align: 'center', // Important for multi-line text
                wordWrap: { width: this.cameras.main.width * 0.8 }
            }
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(2000)
        .setVisible(false);

        // Check initial orientation and show/hide notice
        this.checkOrientationDisplay(); // Make sure this method is defined in your GameScene class

        // Listen for orientation changes
        this.scale.on('orientationchange', this.checkOrientationDisplay, this);


        // Backgrounds (static & parallax tileSprites)
        this.originalBackground = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BACKGROUND_ORIGINAL.key)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(-9).setVisible(true).setTileScale(0.1, 0.1);
        this.bgLayer1 = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BG_LAYER_1.key)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(-7).setVisible(false);
        this.bgLayer2 = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BG_LAYER_2.key)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(-6).setVisible(false);
        this.bgLayer3 = this.add.tileSprite(0, 0, camWidth, camHeight, ASSETS.BG_LAYER_3.key)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(-5).setVisible(false);
        this.glitchManager?.setBackground(this.bgLayer3);

        // Incantation Setup
        this.CORRECT_INCANTATION_WORD = "PASSWORD";
        this.INCANTATION_REPETITIONS = 1;
        let tempFullIncantation = [];
        for (let i = 0; i < this.INCANTATION_REPETITIONS; i++) {
            tempFullIncantation.push(this.CORRECT_INCANTATION_WORD);
        }
        this.FULL_CORRECT_INCANTATION = tempFullIncantation.join(" ").toUpperCase();
        console.log("Full Correct Incantation set to:", this.FULL_CORRECT_INCANTATION);

        // === MAP SETUP (Defines this.map and its dimensions) ===
        this.setupMapAndLayers();

        // === STARS (AFTER MAP SETUP to use this.map.widthInPixels) ===
        this.stars = this.add.group(); // Initialize the stars group
        this.createStars();        // Call createStars (it will now use the map's width)

        // Initialize Physics Groups
        this.birds = this.physics.add.group({ allowGravity: false, immovable: true });
        this.fireflies = this.add.group(); // For decorative lights around static points
        this.npcs = this.physics.add.group({ allowGravity: false });
        this.fishFliesSwarm = this.add.group({ runChildUpdate: true }); // For the fishfly entities

        // Player & Camera
        this.createPlayerAndCamera();

        // Lighting
        this.setupLighting(); // Ensure this is called after player for playerLight

        // --- Atlas Moth (this.mothNpc) Instantiation ---
        let mothSpawnX = 500; // Default X
        let mothSpawnY = 180; // Default Y

        if (this.atlasMothSpawnData) { // Check if Tiled spawn point was found
            mothSpawnX = this.atlasMothSpawnData.x;
            mothSpawnY = this.atlasMothSpawnData.y;
            console.log(`Spawning Atlas Moth at Tiled object '${TILED_NAMES.OBJECT_NAME_ATLAS_MOTH_SPAWN_POINT}': (${mothSpawnX}, ${mothSpawnY})`);
        } else if (this.mothTriggerZoneRect) { // Fallback to old logic if spawn point object isn't found
            mothSpawnX = this.mothTriggerZoneRect.right + MOTH_CONFIG.SPAWN_OFFSET_X;
            mothSpawnY = this.mothTriggerZoneRect.centerY;
            console.log(`Atlas Moth: Tiled spawn point not found. Calculated spawn based on trigger zone: (${mothSpawnX}, ${mothSpawnY})`);
        } else {
            console.warn("Atlas Moth: Neither Tiled spawn point nor trigger zone found. Using default spawn position.");
        }

        if (typeof MothNPC !== 'undefined') {
            this.mothNpc = new MothNPC(this, mothSpawnX, mothSpawnY);
            this.npcs.add(this.mothNpc);
            console.log("Atlas Moth (mothNpc) instance added to scene and group.");
            if (this.mothNpc && typeof this.createFirefliesForLight === 'function') {
                this.createFirefliesForLight(this.mothNpc.x, this.mothNpc.y);
            }
        } else {
            console.error("MothNPC class (for Atlas Moth) not defined!");
        }


        // --- Luna Moth (this.lunaMothNpc) Instantiation ---
        let lunaMothSpawnX = 100; // Default X for Luna Moth
        let lunaMothSpawnY = 200; // Default Y for Luna Moth

        const lunaSpawnPointObject = this.map.findObject(TILED_NAMES.LAYER_TRIGGERS, obj => obj.name === TILED_NAMES.OBJECT_NAME_LUNA_MOTH_SPAWN_POINT);
        if (lunaSpawnPointObject) {
            lunaMothSpawnX = lunaSpawnPointObject.x;
            lunaMothSpawnY = lunaSpawnPointObject.y;
            console.log(`Luna Moth spawning at Tiled object '${TILED_NAMES.OBJECT_NAME_LUNA_MOTH_SPAWN_POINT}': (${lunaMothSpawnX}, ${lunaMothSpawnY})`);
        } else if (this.lunaMothTriggerZoneRect) {
            lunaMothSpawnX = this.lunaMothTriggerZoneRect.x - 50;
            lunaMothSpawnY = this.lunaMothTriggerZoneRect.centerY;
            console.log(`Luna Moth: Tiled spawn point not found. Spawning near its trigger zone: (${lunaMothSpawnX}, ${lunaMothSpawnY})`);
        } else {
            console.warn("Luna Moth: Neither Tiled spawn point nor its trigger zone found. Using default spawn for Luna Moth.");
        }

        if (typeof LunaMothNPC !== 'undefined' && this.player) {
            this.lunaMothNpc = new LunaMothNPC(this, lunaMothSpawnX, lunaMothSpawnY, this.player);
            this.npcs.add(this.lunaMothNpc);
            console.log("LunaMothNPC instance added to scene and group.");
        } else {
            if (typeof LunaMothNPC === 'undefined') console.error("LunaMothNPC class not defined! Make sure it's included.");
            if (!this.player) console.error("Player not available for LunaMothNPC instantiation.");
        }

        if (this.lunaMothWaypoints.length === 0) {
            console.warn("No Luna Moth waypoints were loaded from Tiled. Luna Moth might not lead correctly. Consider adding Tiled objects like 'LunaWaypoint_0', 'LunaWaypoint_1', etc.");
        }


        this.createFishflyTexture();
        // this.fishFliesSwarm = this.add.group({ runChildUpdate: true }); // NOTE: This was initialized earlier, check if re-init is needed.
        this.createAnimations();
        this.createFallbackBirds();
        this.setupCollisions();
        this.createWater();
        this.setupInput();
        this.glitchManager?.createStaticTexture();

        console.log("Phaser: Create complete.");
    }


    handleError(message) { 
         console.error("Phaser Error:", message);
         this.add.text(100, 100, `Error: ${message}`, { color: '#ff0000', fontSize: '16px', backgroundColor: '#000' })
             .setScrollFactor(0).setDepth(200);
    }

setupMapAndLayers() {
    console.log("GameScene: Setting up map and layers...");
    if (!this.cache.tilemap.exists(ASSETS.MAP_DATA.key)) {
        return this.handleError(`Tilemap data key "${ASSETS.MAP_DATA.key}" not found.`);
    }
    this.map = this.make.tilemap({ key: ASSETS.MAP_DATA.key });

    const worldWidth = this.map.widthInPixels;
    const worldHeight = this.map.heightInPixels;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    

    // Add Tilesets (ensure all listed in ASSETS and TILED_NAMES are correct)
    const tilesetMain = this.map.addTilesetImage(TILED_NAMES.TILESET_MAIN, ASSETS.TILESET_MAIN.key);
    const tilesetTrees = this.map.addTilesetImage(TILED_NAMES.TILESET_TREES, ASSETS.TREES.key);
    const tilesetDecorations = this.map.addTilesetImage(TILED_NAMES.TILESET_DECORATIONS, ASSETS.DECORATIONS.key);
    const tilesetViking = this.map.addTilesetImage(TILED_NAMES.TILESET_VIKING, ASSETS.VIKING.key);
    const tilesetStore1 = this.map.addTilesetImage(TILED_NAMES.TILESET_STORE1, ASSETS.STORE_TILESET.key);
    const tilesetPlane = this.map.addTilesetImage(TILED_NAMES.TILESET_PLANE, ASSETS.PLANE_TILESET.key);
    const tilesetHouse1 = this.map.addTilesetImage(TILED_NAMES.TILESET_HOUSE1, ASSETS.HOUSE1_TILESET.key);
    const tilesetHouse2 = this.map.addTilesetImage(TILED_NAMES.TILESET_HOUSE2, ASSETS.HOUSE2_TILESET.key);
    const tilesetHotel = this.map.addTilesetImage(TILED_NAMES.TILESET_HOTEL, ASSETS.HOTEL_TILESET.key);
    const tilesetHarbourmaster = this.map.addTilesetImage(TILED_NAMES.TILESET_HARBOURMASTER, ASSETS.HARBOURMASTER_TILESET.key);
    

    const allTilesets = [
        tilesetMain, tilesetTrees, tilesetDecorations, tilesetViking,
        tilesetStore1, tilesetPlane, tilesetHouse1, tilesetHouse2, tilesetHarbourmaster, tilesetHotel
    ].filter(ts => ts); // Filter out any nulls if a tileset fails to load

    if (allTilesets.length === 0) { // Or check specifically for tilesetMain
         return this.handleError(`Failed to load critical tilesets.`);
    }

    // Create Layers
    this.collisionLayer = this.map.createLayer(TILED_NAMES.LAYER_COLLISION, allTilesets, 0, 0);
    if (this.collisionLayer) {
        this.collisionLayer.setDepth(0);
        this.collisionLayer.setCollisionByProperty({ [TILED_NAMES.PROPERTY_COLLIDES]: true });
    } else {
        this.handleError(`Failed to create collision layer "${TILED_NAMES.LAYER_COLLISION}".`);
    }
    // Add other static layers if they exist and are defined in TILED_NAMES
    const decorBackLayer = this.map.createLayer(TILED_NAMES.LAYER_DECOR_BACK, allTilesets, 0, 0);
    if (decorBackLayer) decorBackLayer.setDepth(-1);

    const treesLayer = this.map.createLayer(TILED_NAMES.LAYER_TREES, allTilesets, 0, 0);
    if (treesLayer) treesLayer.setDepth(-2);


    // Initialize/Reset properties to be populated from Tiled objects
    this.glitchTriggerZones = [];
    this.playerSpawnData = null;
    this.atlasMothSpawnData = null;
    this.fishflySpawn1Data = null;
    this.fishflySpawn2Data = null;
    this.lunaMothWaypoints = [];
    this.gatekeeperSpawnData = null; // For the NPC's position

    this.mothTriggerZoneRect = null;
    this.lunaMothTriggerZoneRect = null;
    this.margotTriggerZoneRect = null;
    this.fishflyTrigger2Rect = null;
    this.gatekeeperTriggerRect = null; // <<<< Will be populated from Tiled
    this.gatekeeperDialogueTriggered = false; // Reset this flag

    const objectLayerName = TILED_NAMES.LAYER_TRIGGERS; // Your "TriggerZones" layer
    const objectLayer = this.map.getObjectLayer(objectLayerName);;

    if (objectLayer) {
        console.log(`Processing objects from Tiled layer: "${objectLayerName}"`);
        objectLayer.objects.forEach(obj => {
            // Spawn Points
            if (obj.name === TILED_NAMES.OBJECT_NAME_PLAYER_SPAWN_POINT) {
                console.log(`Found Player Spawn Point ("${obj.name}") at x:${obj.x}, y:${obj.y}`);
                this.playerSpawnData = { x: obj.x, y: obj.y };
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_ATLAS_MOTH_SPAWN_POINT) {
                console.log(`Found Atlas Moth Spawn Point ("${obj.name}") at x:${obj.x}, y:${obj.y}`);
                this.atlasMothSpawnData = { x: obj.x, y: obj.y };
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_FISHFLY_SPAWN_1) {
                console.log(`Found Fishfly Swarm 1 Spawn Point ("${obj.name}") at x:${obj.x}, y:${obj.y}`);
                this.fishflySpawn1Data = { x: obj.x, y: obj.y };
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_FISHFLY_SPAWN_2) {
                console.log(`Found Fishfly Swarm 2 Spawn Point ("${obj.name}") at x:${obj.x}, y:${obj.y}`);
                this.fishflySpawn2Data = { x: obj.x, y: obj.y };
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_GATEKEEPER_SPAWN_POINT) {
                console.log(`Found Gatekeeper Spawn Point ("<span class="math-inline">\{obj\.name\}"\) at x\:</span>{obj.x}, y:${obj.y}`);
                this.gatekeeperSpawnData = { x: obj.x, y: obj.y };
            }

            // Luna Moth Waypoints
            else if (obj.name && obj.name.startsWith(TILED_NAMES.LUNA_MOTH_WAYPOINT_PREFIX)) {
                const index = parseInt(obj.name.substring(TILED_NAMES.LUNA_MOTH_WAYPOINT_PREFIX.length), 10);
                if (!isNaN(index)) {
                    this.lunaMothWaypoints.push({ index: index, x: obj.x, y: obj.y, name: obj.name });
                } else {
                    console.warn(`Could not parse index from waypoint name: ${obj.name}`);
                }
            }
            // Trigger Zones (Rectangles) & Glitch Zones
            else if (obj.name === TILED_NAMES.OBJECT_NAME_VIKING_TRIGGER) {
                const zoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                const effect = getTiledPropertyValue(obj.properties, TILED_NAMES.PROPERTY_GLITCH_EFFECT) || 'random';
                // Store the zone object itself if needed for specific handling, or just its data
                this.vikingIncantationTriggerZone = { // Store the Tiled zone data
                    name: obj.name,
                    rect: zoneRect,
                    effect: effect,
                    isActive: true, // This will be managed dynamically
                    type: 'viking_initial_or_incantation'
                };
                this.glitchTriggerZones.push(this.vikingIncantationTriggerZone); // Also add to general glitch zones if it has other effects
                console.log(`Found Viking Trigger Zone: "${obj.name}" and stored as vikingIncantationTriggerZone.`);
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_MOTH_TRIGGER) { // Atlas Moth Dialogue
                this.mothTriggerZoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                console.log(`Found Original Moth (Atlas) Trigger Zone: "${obj.name}"`);
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_LAKE_TRIGGER) {
                const zoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                this.glitchTriggerZones.push({ name: obj.name, rect: zoneRect, isActive: true, type: 'lake_boundary' });
                console.log(`Found Lake Trigger Zone: "${obj.name}"`);
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_WATER_FOUNTAIN_TRIGGER) { // Fish Flies #1
                const zoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                this.glitchTriggerZones.push({ name: obj.name, rect: zoneRect, isActive: true, type: 'fishfly_fountain_interaction' });
                console.log(`Found Water Fountain Trigger Zone: "${obj.name}" (for Fish Flies #1)`);
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_MARGOT_TRIGGER) {
                console.log(`Found ${TILED_NAMES.OBJECT_NAME_MARGOT_TRIGGER} at x:${obj.x}, y:${obj.y}`);
                this.margotTriggerZoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                // Margot's spawn is calculated relative to her trigger zone:
                let margotSpawnX = obj.x + (obj.width / 2);
                let margotSpawnY = obj.y + 5 + obj.height - (MARGOT_CONFIG.SPRITE_HEIGHT / 2);
                if (typeof MargotNPC !== 'undefined') {
                    this.margotNpc = new MargotNPC(this, margotSpawnX, margotSpawnY); // Margot is created here
                    if (this.npcs) { this.npcs.add(this.margotNpc); }
                    else { console.error("this.npcs group not initialized before adding MargotNPC!"); } // Should be fine as npcs is created in create()
                    this.margotNpc.setActive(true).setVisible(true);
                    console.log("Margot NPC instance added to scene and group."); // We need to see this log!
                } else { console.error("MargotNPC class not defined."); }
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_LUNA_MOTH_TRIGGER) { // Luna Moth Dialogue
                this.lunaMothTriggerZoneRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                console.log(`Found Luna Moth Trigger Zone: "${obj.name}"`);
            } else if (obj.name === TILED_NAMES.OBJECT_NAME_FISHFLY_TRIGGER_2) { // Fish Flies #2
                this.fishflyTrigger2Rect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
                console.log(`Found Fishfly Swarm 2 Trigger Zone: "${obj.name}"`);
            }           
            else if (obj.name === TILED_NAMES.OBJECT_NAME_GATEKEEPER_TRIGGER_ZONE) {
                console.log(`Found Gatekeeper Trigger Zone ("${obj.name}") at x:${obj.x}, y:${obj.y}, w:${obj.width}, h:${obj.height}`);
                this.gatekeeperTriggerRect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.width, obj.height);
            }
            // Add else if for other named objects like LunaMothSpawnPoint if not handled in create()
        });

        if (this.lunaMothWaypoints.length > 0) {
            this.lunaMothWaypoints.sort((a, b) => a.index - b.index);
            console.log("Sorted Luna Moth Waypoints:", this.lunaMothWaypoints.map(wp => `(${wp.name}: ${wp.x},${wp.y})`).join(' -> '));
        }
    } else {
        console.warn(`Tiled object layer "${objectLayerName}" not found. Critical interactive elements might be missing.`);
    }

    // Final checks and warnings
    if (!this.playerSpawnData) console.warn(`!!! Player Spawn Point object named "${TILED_NAMES.OBJECT_NAME_PLAYER_SPAWN_POINT}" not found!`);
    if (!this.atlasMothSpawnData && !this.mothTriggerZoneRect) console.warn(`!!! Atlas Moth spawning relies on either "${TILED_NAMES.OBJECT_NAME_ATLAS_MOTH_SPAWN_POINT}" object or "${TILED_NAMES.OBJECT_NAME_MOTH_TRIGGER}" for offset, neither found!`);
    if (!this.mothTriggerZoneRect) console.warn(`!!! Atlas Moth dialogue trigger "${TILED_NAMES.OBJECT_NAME_MOTH_TRIGGER}" not found!`);
    if (!this.lunaMothTriggerZoneRect) console.warn(`!!! Luna Moth dialogue trigger "${TILED_NAMES.OBJECT_NAME_LUNA_MOTH_TRIGGER}" not found!`);
    if (this.lunaMothWaypoints.length === 0) console.warn(`!!! No Luna Moth waypoints found with prefix "${TILED_NAMES.LUNA_MOTH_WAYPOINT_PREFIX}".`);
    if (!this.fishflySpawn1Data && !this.glitchTriggerZones.find(z => z.name === TILED_NAMES.OBJECT_NAME_WATER_FOUNTAIN_TRIGGER)) console.warn(`!!! Fishfly Swarm #1 needs spawn point "${TILED_NAMES.OBJECT_NAME_FISHFLY_SPAWN_1}" or fountain trigger for fallback spawn!`);
    if (!this.fishflyTrigger2Rect) console.warn(`!!! Fishfly Swarm #2 trigger "${TILED_NAMES.OBJECT_NAME_FISHFLY_TRIGGER_2}" not found!`);
    if (!this.fishflySpawn2Data && !this.fishflyTrigger2Rect) console.warn(`!!! Fishfly Swarm #2 needs spawn point "${TILED_NAMES.OBJECT_NAME_FISHFLY_SPAWN_2}" or its trigger for fallback spawn!`);
    if (!this.gatekeeperSpawnData) console.warn(`!!! Gatekeeper Spawn Point ("${TILED_NAMES.OBJECT_NAME_GATEKEEPER_SPAWN_POINT}") not found!`);
    if (!this.gatekeeperTriggerRect) console.warn(`!!! Gatekeeper Trigger Zone ("${TILED_NAMES.OBJECT_NAME_GATEKEEPER_TRIGGER_ZONE}") not found!`);

    console.log("GameScene: Map and layers setup complete.");
}


createPlayerAndCamera() {
    console.log("Creating player...");
    let spawnX;
    let spawnY;

    if (this.playerSpawnData && this.playerSpawnData.x !== undefined && this.playerSpawnData.y !== undefined) {
        // --- Use Tiled spawn point ---
        spawnX = this.playerSpawnData.x;
        spawnY = this.playerSpawnData.y; // Tiled y-coordinate. Player will spawn with its origin at this point.
                                        // If player has physics, they will fall to ground if this point is in the air.
        console.log(`Player spawning at Tiled object '${TILED_NAMES.OBJECT_NAME_PLAYER_SPAWN_POINT}': (X: ${spawnX}, Y: ${spawnY})`);

        // Optional: If you want the player to snap precisely to the ground below this Tiled point,
        // you can still use a modified version of your ground-finding logic here.
        // For now, we'll use the direct Tiled coordinates. Ensure your Tiled point is placed where you want the player's origin.
        // Most Player classes have origin (0.5, 0.5) or (0.5, 1).
        // If your Player class origin is (0,0), spawnY is the top of your player.
        // If (0.5, 1), spawnY is the bottom-center. Adjust Tiled placement accordingly.

    } else {
        // --- Fallback to existing config-based spawn logic ---
        console.warn(`PlayerSpawnPoint Tiled object not found or invalid. Using PLAYER_CONFIG.START_X and ground scan.`);
        spawnX = PLAYER_CONFIG.START_X;
        // Your existing ground finding logic for Y
        spawnY = this.map.heightInPixels - (PLAYER_CONFIG.SPRITE_HEIGHT / 2); // Initial high Y before scan

        if (this.collisionLayer) {
            const spawnTileX = Math.floor(spawnX / TILE_SIZE);
            let groundFound = false;
            // Iterate from top down from an assumed reasonable start Y or map top if necessary
            // This loop was from bottom up, let's adjust for clarity or keep if it worked for you.
            // For a general point, scanning down is more typical if point is 'in air'.
            // Your original was from bottom-up, which is fine for finding the *highest* ground at an X.
            for (let yTile = this.collisionLayer.height - 1; yTile >= 0; yTile--) {
                const tile = this.collisionLayer.getTileAt(spawnTileX, yTile);
                if (tile?.properties[TILED_NAMES.PROPERTY_COLLIDES]) {
                    // This positions the center of the player's body slightly above the tile top
                    spawnY = tile.getTop() - (PLAYER_CONFIG.BODY_HEIGHT / 2) - 2;
                    groundFound = true;
                    console.log(`Player spawn Y (config) adjusted to ground: ${spawnY}`);
                    break;
                }
            }
            if (!groundFound) console.warn(`No ground tile found below X=${spawnX.toFixed(1)} using config start. Player might float.`);
        } else {
            console.warn(`Collision layer not ready for player ground check using config start.`);
        }
    }

    this.player = new Player(this, spawnX, spawnY);
    if (this.glitchManager && typeof this.glitchManager.setPlayer === 'function') {
        this.glitchManager.setPlayer(this.player);
    }
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08); // Adjust lerp if needed
    console.log("Player and camera created.");
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

         if (typeof FISHFLIES_CONFIG !== 'undefined' && this.lights) {
            this.fishFliesSwarmLight = this.lights.addLight(
                0, 0,
                FISHFLIES_CONFIG.LIGHT_RADIUS || 60,        // Radius
                FISHFLIES_CONFIG.LIGHT_COLOR || 0x008080,   // Color (defaults to teal from config)
                0                                           // Initial Intensity (start at 0)
            );
            this.fishFliesSwarmLight.setVisible(false); // Start invisible
            console.log("FishFliesSwarmLight object created and initialized (off).");
        } else {
            console.error("FISHFLIES_CONFIG is not defined or lighting system not ready. FishFliesSwarmLight NOT created.");
            // Consider how to handle this case if FISHFLIES_CONFIG might be missing.
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
        // this.stars group should already be initialized in create() before calling this.

        if (!this.map || typeof this.map.widthInPixels === 'undefined') {
            console.warn("Map not fully ready for star creation or widthInPixels is missing. Stars might not cover the whole map width or use camera width as fallback.");
        }

        const worldWidth = this.map?.widthInPixels || this.cameras.main.width;
        const camHeight = this.cameras.main.height; // Base height for Y positioning

        const numStars = Math.floor(worldWidth / 15); // Adjust '15' for desired density
        const starTextureKey = 'star_pixel';

        if (!this.textures.exists(starTextureKey)) {
            const starGfx = this.make.graphics().fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2);
            starGfx.generateTexture(starTextureKey, 2, 2);
            starGfx.destroy();
        }

        for (let i = 0; i < numStars; i++) {
            const sX = Phaser.Math.Between(0, worldWidth); // Spread across the full map width
            const sY = Phaser.Math.Between(0, camHeight * 0.8); // Place stars in the upper 80% of the initial camera view height

            const star = this.stars.create(sX, sY, starTextureKey);

            if (star) {
                star.setScale(Phaser.Math.FloatBetween(0.3, 1.2))
                    .setAlpha(Phaser.Math.FloatBetween(0.4, 0.9))
                    .setData({
                        twinkleSpeed: Phaser.Math.FloatBetween(0.001, 0.005),
                        baseAlpha: star.alpha // Store initial alpha for twinkling
                    })
                    .setScrollFactor(Phaser.Math.FloatBetween(0.1, 0.5)) // Crucial for parallax effect
                    // === MODIFIED LINE ===
                    .setDepth(-5.5); // Stars between Middle Forest (bgLayer2 @ -6) and Closest Forest (bgLayer3 @ -5)
                                    // For stars further back (between Farthest and Middle forests), use -6.5
            }
        }
        console.log(`Created ${this.stars.getLength()} stars across approximately ${worldWidth}px width with depth -5.5.`);
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

    update(time, delta) {
        if (!this.cursors || !this.player?.active) {
            return;
        }

        // --- Parallax Backgrounds ---
        const scrollX = this.cameras.main.scrollX;
        this.bgLayer1?.setTilePosition(scrollX * PARALLAX_FACTORS.BG_LAYER_1);
        this.bgLayer2?.setTilePosition(scrollX * PARALLAX_FACTORS.BG_LAYER_2);
        this.bgLayer3?.setTilePosition(scrollX * PARALLAX_FACTORS.BG_LAYER_3);

        // --- Core Entity Updates ---
        this.player.update(this.cursors);

        this.birds?.children.iterate(bird => {
            if (bird?.active && typeof bird.update === 'function') {
                bird.update(this.player, time, delta, this.cameras.main.worldView);
            }
        });

        this.npcs?.children.iterate(npc => {
            if (npc?.active && typeof npc.update === 'function') {
                npc.update(time, delta); // Atlas Moth, Luna Moth, etc.
            }
        });

        // --- Visual Effect Updates (can be here or after entities) ---
        this.updateStars(time);
        this.updateFireflies(time, delta); // Your general fireflies
        this.updatePlayerLight();
        this.updateFishFliesSwarmLight(); // Extracted fishfly light logic for clarity if complex

        // --- Game Logic & Interaction Checks ---
        this.checkTriggersAndInteractions(time, delta); // Handles zone entries, starts dialogues etc.

        // --- Manual Debug/Test Features (Optional) ---
        if (typeof this.handleGlitches === 'function') { // Check if function exists
            this.handleGlitches(time); // For manual U,I,O,P glitch triggers
        }

        // --- UI Updates (Crucial for dialogues) ---
        if (this.uiManager) {
            if (typeof this.uiManager.handleInput === 'function') {
                this.uiManager.handleInput( /* pass necessary input state if not global */ );
            }
            if (typeof this.uiManager.update === 'function') {
                const uiData = { /* collect any data UIManager needs, e.g., player.state */ };
                this.uiManager.update(uiData, time, delta); // Or just uiManager.update()
            }
        }
    }

    // Helper function for fishfly light (if you want to keep update cleaner)
    updateFishFliesSwarmLight() {
        if (!this.fishFliesSwarmLight) {
            // console.log("[UpdateSwarmLight] fishFliesSwarmLight object doesn't exist.");
            return;
        }
        if (!this.fishFliesSwarm) {
            // console.log("[UpdateSwarmLight] fishFliesSwarm group doesn't exist.");
            return;
        }

        const activeFishFlies = this.fishFliesSwarm.getChildren().filter(ff => ff.active && ff.visible);
        // console.log(`[UpdateSwarmLight] Active fish flies: ${activeFishFlies.length}. Light currently visible: ${this.fishFliesSwarmLight.visible}, intensity: ${this.fishFliesSwarmLight.intensity}`);

        if (activeFishFlies.length > 0) {
            let centerX = 0; let centerY = 0;
            activeFishFlies.forEach(fly => { centerX += fly.x; centerY += fly.y; });
            this.fishFliesSwarmLight.x = centerX / activeFishFlies.length;
            this.fishFliesSwarmLight.y = centerY / activeFishFlies.length;

            const targetIntensity = (FISHFLIES_CONFIG?.LIGHT_INTENSITY !== undefined) ? FISHFLIES_CONFIG.LIGHT_INTENSITY : 0.55;
            // Only set if different, or always set:
            this.fishFliesSwarmLight.setIntensity(targetIntensity);
            this.fishFliesSwarmLight.setVisible(true); // Explicitly set visible if flies are active

            // console.log(`[UpdateSwarmLight] Light ON. New Intensity: ${this.fishFliesSwarmLight.intensity}, Visible: ${this.fishFliesSwarmLight.visible}`);
        } else {
            // Only turn off if it's currently on, to reduce console spam
            if (this.fishFliesSwarmLight.intensity > 0 || this.fishFliesSwarmLight.visible) {
                console.warn(`[UpdateSwarmLight] No active fish flies. Turning swarm light OFF.`);
                this.fishFliesSwarmLight.setIntensity(0);
                this.fishFliesSwarmLight.setVisible(false);
            }
        }
    }
    // --- Helper Update Methods ---


checkTriggersAndInteractions(time, delta) {
    // Early exit if player isn't ready or its body is not enabled
    if (!this.player?.body?.enable) {
        return;
    }

    const playerBodyRect = new Phaser.Geom.Rectangle(
        this.player.body.x,
        this.player.body.y,
        this.player.body.width,
        this.player.body.height
    );

    // --- Handle General Glitch Trigger Zones (from this.glitchTriggerZones array) ---
    if (this.glitchManager && this.glitchTriggerZones && this.glitchTriggerZones.length > 0) {
        this.glitchTriggerZones.forEach(zone => {
            // Check if the current iterated zone is active and player is overlapping
            if (zone?.isActive && zone.rect && Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, zone.rect)) {

                // --- Viking Zone (Initial or Incantation Challenge) ---
                // This 'zone' object comes from this.glitchTriggerZones.
                // In setupMapAndLayers, we pushed the object we also store in this.vikingIncantationTriggerZone here.
                if (zone.name === TILED_NAMES.OBJECT_NAME_VIKING_TRIGGER) {
                    if (this.lunaMothSequenceCompleted && !this.awaitingIncantationInput) {
                        console.log("Player at Viking after Luna Moth. Initiating incantation challenge.");
                        this.startIncantationChallenge(zone); // Pass the current 'zone' object from the array
                        // startIncantationChallenge should handle zone.isActive = false;
                    } else if (!this.lunaMothSequenceCompleted) {
                        console.log(`Player entered Viking Zone: "${zone.name}" (Initial incantation challenge)`);
                        zone.isActive = false; // Make this initial interaction one-time

                        this.originalBackground?.setVisible(true);
                        this.stars?.setVisible(true);
                        this.bgLayer1?.setVisible(true); this.bgLayer2?.setVisible(true); this.bgLayer3?.setVisible(true);

                        const zoneCenterX = zone.rect.centerX;
                        const zoneCenterY = zone.rect.top - 16; // Example positioning
                        this.lights.addLight(zoneCenterX, zoneCenterY, 200, 0xFFFFCC, 0.85);
                        if (typeof this.createFirefliesForLight === 'function') {
                            this.createFirefliesForLight(zoneCenterX, zoneCenterY);
                        }
                        
                        // Directly start incantation challenge on first proper encounter
                        this.startIncantationChallenge(zone);

                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.U);
                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.I);
                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.O);
                        this.glitchManager?.triggerGlitchByKey(Phaser.Input.Keyboard.KeyCodes.P);
                    }
                }
                // --- Lake Boundary Trigger ---
                else if (zone.name === TILED_NAMES.OBJECT_NAME_LAKE_TRIGGER) {
                    console.log(`Player entered Lake Boundary zone: ${zone.name}`);
                    zone.isActive = false;
                    if (this.glitchManager && this.originalBackground) {
                        const previousGlitchManagerTarget = this.glitchManager.background;
                        const stormDuration = (typeof GLITCH_CONFIG !== 'undefined' && GLITCH_CONFIG.STORM_DURATION) ? GLITCH_CONFIG.STORM_DURATION : 900;
                        this.originalBackground.setVisible(true);
                        this.glitchManager.setBackground(this.originalBackground);
                        this.glitchManager.triggerGlitchByKey?.(Phaser.Input.Keyboard.KeyCodes.U); // Example storm glitches
                        this.glitchManager.triggerGlitchByKey?.(Phaser.Input.Keyboard.KeyCodes.I);
                        this.glitchManager.triggerGlitchByKey?.(Phaser.Input.Keyboard.KeyCodes.O);
                        this.glitchManager.triggerGlitchByKey?.(Phaser.Input.Keyboard.KeyCodes.P);
                        this.time.delayedCall(stormDuration + 100, () => {
                            if (this.glitchManager) this.glitchManager.setBackground(previousGlitchManagerTarget);
                        }, [], this);
                    }
                    const lakeMessage = "The lake is not safe right now";
                    const lakeMessageStyle = (typeof TEXT_STYLE !== 'undefined') ? TEXT_STYLE : { font: '14px monospace', fill: '#ff8888', backgroundColor: 'rgba(30,0,0,0.7)', padding: { x: 10, y: 5 }, align: 'center', wordWrap: {width: this.cameras.main.width * 0.8} };
                    if (typeof this.animateTextDisplay === 'function') this.animateTextDisplay(lakeMessage, this.cameras.main.centerX, this.cameras.main.centerY + 60, lakeMessageStyle);
                    if (this.player) { this.player.setVelocityX(this.player.x < zone.rect.centerX ? 150 : -150); if (typeof this.player.disableControlsForDuration === 'function') this.player.disableControlsForDuration(300); }
                    this.time.delayedCall(10000, () => { if (zone) zone.isActive = true; console.log("LakeTriggerZone re-activated."); }, [], this);
                }
                // --- Water Fountain (Fish Flies #1) ---
                else if (zone.name === TILED_NAMES.OBJECT_NAME_WATER_FOUNTAIN_TRIGGER && zone.type === 'fishfly_fountain_interaction') {
                    console.log(`Player entered Fish Fly Fountain zone: ${zone.name}`);
                    if ((!this.fishFliesSwarm || this.fishFliesSwarm.countActive(true) === 0)) { // zone.isActive already checked by outer if
                        zone.isActive = false; 
                        let spawnX, spawnY;
                        if (this.fishflySpawn1Data) {
                            spawnX = this.fishflySpawn1Data.x; spawnY = this.fishflySpawn1Data.y;
                        } else {
                            spawnX = zone.rect.centerX; spawnY = zone.rect.centerY; 
                            console.warn(`Tiled object "${TILED_NAMES.OBJECT_NAME_FISHFLY_SPAWN_1}" not found for 1st swarm. Spawning at fountain trigger center.`);
                        }
                        if (typeof this.createFishflySwarm === 'function' && this.player) {
                            this.createFishflySwarm(spawnX, spawnY, this.player);
                            if (this.fishFliesSwarm?.countActive(true) > 0 && this.fishFliesSwarmLight && typeof FISHFLIES_CONFIG !== 'undefined') {
                                this.fishFliesSwarmLight.setPosition(spawnX, spawnY)
                                    .setRadius(FISHFLIES_CONFIG.LIGHT_RADIUS || 60)
                                    .setColor(FISHFLIES_CONFIG.LIGHT_COLOR || 0xffb070)
                                    .setIntensity(FISHFLIES_CONFIG.LIGHT_INTENSITY || 0.55)
                                    .setVisible(true);
                            }
                        }
                        if (this.uiManager?.startDialogueSequence) {
                            this.player?.setControllable(false);
                            this.uiManager.startDialogueSequence('fish_flies_fountain_intro', () => {
                                this.player?.setControllable(true);
                                this.fishFliesSwarm?.children.each(ff => { if (ff instanceof FishFly) ff.returnHome?.() });
                                this.time.delayedCall(20000, () => { if(zone) zone.isActive = true; console.log("Fountain zone reactivated.") }, [], this);
                            });
                        } else { if (this.player) this.player.setControllable(true); }
                    }
                }
                // Add any other general glitch zones from this.glitchTriggerZones here
            }
        });
    }

    // --- Specific NPC Dialogue Triggers (Checked independently) ---

    // --- Margot Trigger ---
    if (this.margotNpc && this.margotNpc.active && this.margotTriggerZoneRect && 
        !this.margotNpc.hasInteracted && !this.margotNpc.isInteracting) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, this.margotTriggerZoneRect)) {
            console.log("Player entered MargotTriggerZone, initiating interaction.");
            this.margotNpc.startInteraction?.();
        }
    }

    // --- Atlas Moth (Original Moth) Dialogue Trigger ---
    if (this.mothNpc && this.mothNpc.active && this.mothTriggerZoneRect && !this.mothDialogueTriggered) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, this.mothTriggerZoneRect)) {
            console.log("Player entered Atlas Moth's TriggerZone, initiating dialogue.");
            this.mothDialogueTriggered = true;
            this.player?.setControllable(false);
            this.mothNpc.onDialogueStart?.();
            this.uiManager?.startDialogueSequence('moth_encounter_dialogue', () => {
                this.player?.setControllable(true);
                this.mothNpc.onDialogueEnd?.();
                // Optional: this.mothTriggerZoneRect = null; // To make it a permanent one-time trigger
            });
        }
    }

    // --- Luna Moth Intro Dialogue Trigger ---
    if (this.lunaMothNpc && this.lunaMothNpc.active && this.lunaMothTriggerZoneRect && 
        !this.lunaMothDialogueTriggered && !this.lunaMothSequenceCompleted) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, this.lunaMothTriggerZoneRect)) {
            console.log("Player entered Luna Moth's TriggerZone, initiating dialogue.");
            this.lunaMothDialogueTriggered = true;
            this.player?.setControllable(false);
            this.lunaMothNpc.onDialogueStart?.();
            this.uiManager?.startDialogueSequence('luna_moth_intro_dialogue', () => {
                this.player?.setControllable(true);
                this.playerIsFollowingLunaMoth = true;
                this.lunaMothNpc.onDialogueEnd?.(true, this.lunaMothWaypoints);
                // Optional: this.lunaMothTriggerZoneRect = null;
            });
        }
    }

    // --- Second Fish Fly Encounter Trigger ---
    if (this.fishflyTrigger2Rect && !this.fishflyDialogue2Triggered) {
        // Add any prerequisite flags here if needed, e.g. && this.mothDialogueTriggered
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, this.fishflyTrigger2Rect)) {
            console.log("Player entered Second Fish Fly Zone ('Project Quassia' dialogue).");
            this.fishflyDialogue2Triggered = true;
            let spawnX, spawnY;
            if (this.fishflySpawn2Data) {
                spawnX = this.fishflySpawn2Data.x; spawnY = this.fishflySpawn2Data.y;
            } else {
                spawnX = this.fishflyTrigger2Rect.centerX; spawnY = this.fishflyTrigger2Rect.centerY;
                console.warn(`Tiled object "${TILED_NAMES.OBJECT_NAME_FISHFLY_SPAWN_2}" not found for 2nd swarm. Spawning at its trigger zone center.`);
            }
            if (typeof this.createFishflySwarm === 'function' && this.player) {
                this.fishFliesSwarm?.clear(true, true); // Clear previous swarm
                this.createFishflySwarm(spawnX, spawnY, this.player);
                if (this.fishFliesSwarm?.countActive(true) > 0 && this.fishFliesSwarmLight && typeof FISHFLIES_CONFIG !== 'undefined') {
                    this.fishFliesSwarmLight.setPosition(spawnX, spawnY)
                        .setRadius(FISHFLIES_CONFIG.LIGHT_RADIUS || 60)
                        .setColor(FISHFLIES_CONFIG.LIGHT_COLOR || 0x008080) 
                        .setIntensity(FISHFLIES_CONFIG.LIGHT_INTENSITY || 1)
                        .setVisible(true);
                }
            }
            this.player?.setControllable(false);
            this.uiManager?.startDialogueSequence('fish_flies_project_quassia_dialogue', () => {
                this.player?.setControllable(true);
                this.fishFliesSwarm?.children.each(ff => { if (ff instanceof FishFly) ff.returnHome?.() });
                // this.fishflyTrigger2Rect = null; // Optional: make one-time
            });
        }
    }

    // --- Gatekeeper Dialogue Trigger ---
    if (this.gatekeeperNpc && this.gatekeeperNpc.active &&
        this.gatekeeperTriggerRect &&  // <<< This will now use the Rect from Tiled
        !this.gatekeeperDialogueTriggered &&
        this.incantationSuccessfulAndForestRevealed &&
        !this.awaitingIncantationInput) {

        // Optional: Add a debug log here if still having issues
        // console.log(`[DEBUG Gatekeeper Check Tiled Zone] Conditions met. Player at <span class="math-inline">\{playerBodyRect\.x\.toFixed\(0\)\},</span>{playerBodyRect.y.toFixed(0)}. Zone at <span class="math-inline">\{this\.gatekeeperTriggerRect\.x\.toFixed\(0\)\},</span>{this.gatekeeperTriggerRect.y.toFixed(0)}.`);

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBodyRect, this.gatekeeperTriggerRect)) {
            console.log("Player entered Gatekeeper's Tiled TriggerZone. Attempting dialogue.");
            this.gatekeeperDialogueTriggered = true;

            this.player?.setControllable(false);
            this.gatekeeperNpc.onDialogueStart?.();

            if (this.uiManager && typeof this.uiManager.startDialogueSequence === 'function') {
                this.uiManager.startDialogueSequence('gatekeeper_encounter_dialogue', () => {
                    console.log("Gatekeeper encounter dialogue finished.");
                    this.player?.setControllable(true);
                    this.gatekeeperNpc.onDialogueEnd?.();
                    if (typeof this.showExternalMedia === 'function') {
                        this.showExternalMedia();
                    }
                });
            } else {
                console.warn("UIManager not ready for Gatekeeper dialogue or startDialogueSequence missing.");
                this.player?.setControllable(true);
                this.gatekeeperDialogueTriggered = false; // Allow retry if UI fails
            }
        }
    }
}

    lunaMothArrivedAtDestination() {
        console.log("GameScene: Luna Moth has signaled arrival. Triggering farewell dialogue.");
        this.playerIsFollowingLunaMoth = false; // Player is no longer actively following for *this* sequence

        if (this.uiManager && typeof this.uiManager.startDialogueSequence === 'function' && this.lunaMothNpc) {
            this.player?.setControllable(false); // Briefly disable controls for final words
            if (typeof this.lunaMothNpc.onDialogueStart === 'function') this.lunaMothNpc.onDialogueStart(); // Moth stops for final words

            this.uiManager.startDialogueSequence('luna_moth_farewell_dialogue', () => { // New dialogue key
                console.log("GameScene: Luna Moth farewell dialogue finished.");
                this.player?.setControllable(true);

                // What happens to Luna Moth now? Despawn, fly off, become idle?
                // Example: Make it idle
                if (this.lunaMothNpc) {
                    this.lunaMothNpc.state = 'IDLE_AFTER_LEADING'; // A new state for LunaMothNPC to handle
                    this.lunaMothNpc.body.setVelocity(0,0); // Ensure it stops
                    // Or this.lunaMothNpc.destroy();
                }
            });
        } else {
            console.warn("Cannot trigger Luna Moth farewell dialogue. UI Manager or NPC missing.");
            // If UI isn't ready, player should probably regain control
            this.player?.setControllable(true);
        }
    }

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

    onCorrectIncantation() {
        console.log("Incantation Correct! Proceeding with forest reveal and gatekeeper spawn.");
        this.awaitingIncantationInput = false;
        this.input.keyboard.off('keydown', this.handleIncantationKeyDown, this);
        this.incantationTextObject?.destroy();
        this.incantationPromptText?.destroy();
        this.incantationTextObject = null;
        this.incantationPromptText = null;
        this.player?.setControllable(true);

        if (this.vikingIncantationTriggerZone) { // Assuming this is the zone object
            this.vikingIncantationTriggerZone.isActive = false;
            console.log(`Viking incantation zone "${this.vikingIncantationTriggerZone.name}" deactivated permanently after success.`);
        }

        //this.revealEerieForest(); // Makes the forest appear

        // --- Call the dedicated function to spawn the Gatekeeper ---
        this.spawnGatekeeper(); // This spawns this.gatekeeperNpc

        // --- REMOVE DYNAMIC CREATION OF TRIGGER RECT ---
        // The this.gatekeeperTriggerRect is now expected to be loaded from Tiled in setupMapAndLayers.

        
        // Ensure the dialogue can be triggered now that the Gatekeeper exists
        // and the necessary game state is met.
        this.gatekeeperDialogueTriggered = false;
        this.incantationSuccessfulAndForestRevealed = true;
        console.log("Flag 'incantationSuccessfulAndForestRevealed' set to true. Gatekeeper trigger zone should be active if defined in Tiled.");
    }

    showExternalMedia() {
        console.log("Attempting to show external media...");
        // For now, let's just log it and perhaps open a simple placeholder URL in a new tab.
        // You will need to replace 'YOUR_MEDIA_URL_HERE' with the actual URL when ready.
        // This action happens outside the Phaser canvas, in the browser.

        const mediaURL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; 

        // Simple way to open a new tab:
        // Be aware that browsers might block pop-ups if not initiated by a direct user click.
        // Since this is in a callback from a dialogue advance (which is a user click), it *might* be allowed.
        try {
            const newWindow = window.open(mediaURL, '_blank');
            if (newWindow) {
                console.log(`Opened new window/tab for: ${mediaURL}`);
                // newWindow.focus(); // Try to bring it to the front
            } else {
                console.warn(`Could not open new window/tab for: ${mediaURL}. Pop-up blocker might be active or other browser restriction.`);
                // Fallback: Display a message to the player to visit the URL manually
                this.uiManager?.displayTemporaryMessage(`Please visit: ${mediaURL}`, 10000); // Display for 10s
            }
        } catch (e) {
            console.error("Error trying to open external media:", e);
            this.uiManager?.displayTemporaryMessage(`Error opening media. Please try visiting: ${mediaURL}`, 10000);
        }

        // More advanced integration (like an iframe overlay or a dedicated HTML element)
        // would require more complex DOM manipulation and communication with your Phaser game,
        // which is beyond a quick addition here.
        // For now, opening a new tab is the simplest approach to test the concept.
    }

    startIncantationChallenge(zone) {
        if (this.awaitingIncantationInput) return; // Don't start if already started

        console.log("Starting incantation challenge.");
        this.awaitingIncantationInput = true;
        this.player?.setControllable(false);
        this.typedIncantation = ""; // Reset previously typed text

        // 1. Big Scary Glitch (ensure GlitchManager has such a method)
        this.glitchManager?.playScaryGlitchSequence?.(); // Or trigger a specific strong glitch

        // 2. Display Prompt Text
        const promptX = this.cameras.main.centerX;
        const promptY = this.cameras.main.centerY - 60; // Position above where typed text will appear
        if (this.incantationPromptText) this.incantationPromptText.destroy(); // Clear previous
        this.incantationPromptText = this.add.text(promptX, promptY, "Recite the incantation:", {
            font: "18px monospace", fill: "#ff4444", align: 'center',
            stroke: '#000000', strokeThickness: 3,
            padding: { x:10, y:5 }, backgroundColor: 'rgba(0,0,0,0.6)'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200); // High depth

        // 3. Display Area for Typed Text by Player
        if (this.incantationTextObject) this.incantationTextObject.destroy(); // Clear previous
        this.incantationTextObject = this.add.text(promptX, this.cameras.main.centerY, "_", { // Start with a placeholder
            font: "20px monospace", fill: "#ffffff", align: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', padding: {x:10, y:5},
            fixedWidth: 350, // Adjust width as needed
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        // 4. Enable Keyboard Input Listener for typing
        this.input.keyboard.on('keydown', this.handleIncantationKeyDown, this);

        // Store the zone and temporarily deactivate it to prevent re-triggering while typing
        if (zone) {
            this.vikingIncantationTriggerZone = zone; // Store the actual zone object reference
            this.vikingIncantationTriggerZone.isActive = false;
        }
    }

    handleIncantationKeyDown(event) {
        if (!this.awaitingIncantationInput) return;

        const key = event.key.toUpperCase();
        const keyCode = event.keyCode;

        if (keyCode >= Phaser.Input.Keyboard.KeyCodes.A && keyCode <= Phaser.Input.Keyboard.KeyCodes.Z) {
            this.typedIncantation += key;
        } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
            this.typedIncantation += " "; // Allow spaces if your incantation has them
        } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE && this.typedIncantation.length > 0) {
            this.typedIncantation = this.typedIncantation.slice(0, -1);
        } else if (keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
            this.submitIncantation();
            return; // Don't add "Enter" to the text
        }
        // Ignore other keys or handle them as needed

        // Update the displayed text (show a cursor or underscore if empty)
        this.incantationTextObject.setText(this.typedIncantation.length > 0 ? this.typedIncantation : "_");
    }

    submitIncantation() {
        if (!this.awaitingIncantationInput) return;

        const attempt = this.typedIncantation.trim().toUpperCase();
        console.log(`Incantation Submitted: "${attempt}", Correct: "${this.FULL_CORRECT_INCANTATION}"`);

        if (attempt === this.FULL_CORRECT_INCANTATION) {
            console.log("Incantation CORRECT!");
            this.incantationTextObject?.setText("CORRECT!"); // Brief feedback
            this.time.delayedCall(500, () => { // Slight delay before proceeding
                this.onCorrectIncantation();
            });
        } else {
            console.log("Incantation INCORRECT.");
            this.glitchManager?.playScaryGlitchSequence?.(); // Another glitch for wrong attempt
            this.incantationTextObject?.setText("Incorrect. Try again.");
            this.typedIncantation = ""; // Clear for next attempt

            this.time.delayedCall(1500, () => { // After showing "Incorrect"
                if (this.awaitingIncantationInput && this.incantationTextObject) { // Check if still in this state
                    this.incantationTextObject.setText("_"); // Reset to placeholder
                    if (this.incantationPromptText) this.incantationPromptText.setText("Recite the incantation:");
                }
            });
            // Player can try typing again. The listener is still active.
            // The vikingIncantationTriggerZone.isActive remains false.
        }
    }

    revealEerieForest() {
        console.log("Revealing the eerie forest...");
        // This is highly dependent on your Tilemap setup.
        // Option 1: Making hidden layers visible
        const eerieForestLayers = ['NameOfYourEerieForestBaseLayer', 'NameOfYourEerieForestObjectLayer']; // REPLACE with actual layer names from Tiled
        eerieForestLayers.forEach(layerName => {
            const layer = this.map.getLayer(layerName)?.tilemapLayer;
            if (layer) {
                layer.setVisible(true);
                layer.setAlpha(0); // Start transparent
                this.tweens.add({ targets: layer, alpha: 1, duration: 2000 }); // Fade in
                console.log(`Layer '${layerName}' made visible and fading in.`);
            } else {
                console.warn(`Eerie forest layer '${layerName}' not found in tilemap.`);
            }
        });

        // Option 2: Changing tiles (more complex, requires knowing tile indices)
        // this.map.replaceByIndex(OLD_TILE_INDEX, NEW_FOREST_TILE_INDEX, x, y, width, height, 'YourCollisionLayer');

        // Option 3: Removing a visual barrier sprite
        // if (this.vikingPathBlockerSprite) this.vikingPathBlockerSprite.destroy();

        // TODO: Adjust camera bounds if the new area expands the world
        // this.cameras.main.setBounds(0, 0, NEW_WORLD_WIDTH, this.map.heightInPixels);
        // this.physics.world.setBounds(0, 0, NEW_WORLD_WIDTH, this.map.heightInPixels);

        // Maybe play a sound effect
        // this.sound.play('forest_reveal_sfx');
    }

    spawnGatekeeper() {
        if (!this.gatekeeperSpawnData) {
            console.error("Cannot spawn Gatekeeper: Spawn data from Tiled ('GatekeeperSpawnPoint') not found.");
            return; // Exit if no spawn data
        }
        if (typeof GatekeeperNPC === 'undefined') {
            console.error("GatekeeperNPC class is not defined. Make sure GatekeeperNPC.js is included in index.html before game.js.");
            return; // Exit if class is missing
        }

        // Check if Gatekeeper already exists to prevent duplicates, though current flow shouldn't cause this.
        if (this.gatekeeperNpc && this.gatekeeperNpc.active) {
            console.warn("Gatekeeper already exists. Not spawning another.");
            return;
        }

        console.log(`Spawning Gatekeeper at Tiled point: (${this.gatekeeperSpawnData.x}, ${this.gatekeeperSpawnData.y})`);
        this.gatekeeperNpc = new GatekeeperNPC(this, this.gatekeeperSpawnData.x, this.gatekeeperSpawnData.y);

        if (this.npcs) {
            this.npcs.add(this.gatekeeperNpc);
            console.log("GatekeeperNPC instance added to scene and npcs group.");
        } else {
            console.error("this.npcs group not defined. Cannot add Gatekeeper.");
            // If npcs group is critical, you might destroy the created gatekeeperNpc to prevent issues
            this.gatekeeperNpc.destroy();
            this.gatekeeperNpc = null;
        }
    }

    checkOrientationDisplay() {
        if (!this.orientationNotice) { // If notice hasn't been created yet, do nothing
            // console.log('[Orientation Check] Notice object does not exist yet.');
            return;
        }

        if (this.scale.isPortrait) {
            console.log("[Orientation Check] Display is Portrait. Showing notice.");
            this.orientationNotice.setText('Please rotate your\ndevice to Landscape mode');
            this.orientationNotice.setVisible(true);
        } else if (this.scale.isLandscape) {
            console.log("[Orientation Check] Display is Landscape. Hiding notice.");
            this.orientationNotice.setVisible(false);
        } else {
            // Fallback for any other state, though usually it's one of the above
            console.log("[Orientation Check] Orientation unknown or not strictly portrait/landscape. Hiding notice.");
            this.orientationNotice.setVisible(false);
        }
    }

} // End Scene Class

// --- Phaser Game Configuration ---
const config = {
    type: Phaser.AUTO,
    width: 800, // Your game's design width
    height: 336, // Your game's design height
    parent: 'phaser-game',
    pixelArt: true,
    physics: { default: 'arcade', arcade: { gravity: { y: 750 }, debug: false } },
    scale: {
        mode: Phaser.Scale.FIT, // This will scale the game to fit within the window, maintaining aspect ratio.
        autoCenter: Phaser.Scale.CENTER_BOTH, // This keeps your game centered.

        orientation: Phaser.Scale.LANDSCAPE, // Request landscape orientation
        forceOrientation: true // Attempt to force this orientation on mobile
    },
    scene: [GameScene]
};

// --- Create the Phaser Game Instance ---
const game = new Phaser.Game(config);
