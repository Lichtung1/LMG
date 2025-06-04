// --- Constants and Definitions ---
const TILE_SIZE = 16;

// Asset Keys & Files
const ASSETS = {
    BACKGROUND_ORIGINAL: { key: 'backgroundOriginal', file: 'assets/Background1.png' },
    BG_LAYER_1: { key: 'bgLayer1', file: 'assets/parallax-layer-1-960x540.png' }, // Farthest forest
    BG_LAYER_2: { key: 'bgLayer2', file: 'assets/parallax-layer-2-960x540.png' }, // Middle forest
    BG_LAYER_3: { key: 'bgLayer3', file: 'assets/parallax-layer-3-960x540.png' }, // Closest forest
    TILESET_MAIN: { key: 'tileset_img', file: 'assets/tileset.png' },
    WATER_SPRITESHEET: { key: 'water_anim_key', file: 'assets/water.png' },
    PLAYER_IDLE: { key: 'player_idle', file: 'assets/purple-hood-idle.png' },
    PLAYER_RUN: { key: 'player_run', file: 'assets/purple-hood-running.png' },
    PLAYER_JUMP: { key: 'player_jump', file: 'assets/purple-hood-jumping.png' },
    TREES: { key: 'updated_trees_img', file: 'assets/Updated_Trees_Collection.png' },
    BIRD_SLEEP: { key: 'bird_sleep_sheet', file: 'assets/BirdSleep.png' },
    HOUSE1_TILESET: { key: 'house1_img', file: 'assets/house1.png' },
    HOUSE2_TILESET: { key: 'house2_img', file: 'assets/house2.png' },
    BIRD_FLY:   { key: 'bird_fly_sheet',   file: 'assets/BirdFly.png' },
    VIKING: { key: 'viking_img', file: 'assets/vikingpixel.png' }, // Ensure this path is correct
    DECORATIONS: { key: 'decorative_elements_img', file: 'assets/Decorative_Elements.png' },
    PLANE_TILESET: { key: 'plane_tileset_img', file: 'assets/plane.png' }, // Added plane.png
    HARBOURMASTER_TILESET: { key: 'harbourmaster_tileset_img', file: 'assets/harbourmaster.png' }, // Added harbourmaster.png
    HOTEL_TILESET: { key: 'hotel_tileset_img', file: 'assets/hotel.png' }, // Added harbourmaster.png
    MAP_DATA: { key: 'levelMap', file: 'assets/level.tmj' },
    STORE_TILESET: { key: 'store1_tileset_img', file: 'assets/store1.png' },
    DIALOGUE_DATA: { key: 'dialogue_data_main', file: 'dialogues.json' },
    MOTH_SPRITESHEET: { key: 'Atlas_moth_sheet', file: 'assets/AtlasMoth.png' },
    LUNA_MOTH_SPRITESHEET: { key: 'moth_sheet', file: 'assets/moth_spritesheet.png' },
    MARGOT_IDLE: { key: 'margot_idle_sheet', file: 'assets/margot_idle_spritesheet.png' },
    MARGOT_WALK: { key: 'margot_walk_sheet', file: 'assets/margot_walk_spritesheet.png' },
    GATEKEEPER_SPRITESHEET: { key: 'gatekeeperSheet', file: 'assets/Entity.png' }
};

// Tiled Map Names
const TILED_NAMES = {
    TILESET_MAIN: 'tileset',
    TILESET_TREES: 'Updated Trees Collection',
    TILESET_DECORATIONS: 'Decorative Elements',
    TILESET_VIKING: 'vikingpixel',           // <-- Tileset name for viking statue in Tiled
    TILESET_STORE1: 'store1', 
    TILESET_HOUSE1: 'house1', 
    TILESET_HOUSE2: 'house2', 
    TILESET_HOTEL: 'hotel', 
    TILESET_HARBOURMASTER: 'harbourmaster',  // Added 'harbourmaster' as named in Tiled
    LAYER_COLLISION: 'Tile Layer 1',
    TILESET_PLANE: 'plane',                // Added 'plane' as named in Tiled
    LAYER_DECOR_BACK: 'rocks and lamps',     // <-- Layer containing the viking statue
    LAYER_TREES: 'trees',
    LAYER_OBJECTS: 'LightSources',
    LAYER_TRIGGERS: 'TriggerZones',          // <-- Object layer name (no space)
    OBJECT_TYPE_LIGHT: 'Light',
    OBJECT_NAME_VIKING_TRIGGER: 'VikingGlitchZone', // <-- Name given to the viking trigger object in Tiled
    PROPERTY_COLLIDES: 'collides',
    PROPERTY_LIGHT_TYPE: 'type',
    PROPERTY_LIGHT_RADIUS: 'lightRadius',
    PROPERTY_LIGHT_INTENSITY: 'lightIntensity',
    PROPERTY_LIGHT_COLOR: 'lightColor',
    PROPERTY_GLITCH_EFFECT: 'glitchEffect',   // <-- Custom property on trigger object for specific effect
    OBJECT_NAME_MOTH_TRIGGER: 'MothTriggerZone', 
    OBJECT_NAME_LAKE_TRIGGER: "LakeTriggerZone", 
    OBJECT_NAME_MARGOT_TRIGGER: 'MargotTriggerZone', 
    OBJECT_NAME_LUNA_MOTH_TRIGGER: 'LunaMothTriggerZone', 
    OBJECT_NAME_LUNA_MOTH_SPAWN_POINT: 'LunaMothSpawnPoint',
    OBJECT_NAME_ATLAS_MOTH_SPAWN_POINT: 'AtlasMothSpawnPoint', // Name for the Atlas Moth's spawn point object in Tiled
    LUNA_MOTH_WAYPOINT_PREFIX: 'LunaWaypoint_', // Prefix for Luna Moth waypoint objects in Tiled
    OBJECT_NAME_PLAYER_SPAWN_POINT: 'PlayerSpawnPoint', // Name of the object in Tiled for player start
    OBJECT_NAME_FISHFLY_SPAWN_1: "Fishfly1", // Tiled object name for 1st fish fly swarm spawn point
    OBJECT_NAME_WATER_FOUNTAIN_TRIGGER: "WaterFountainTriggerZone",
    OBJECT_NAME_FISHFLY_TRIGGER_2: "FishflyZone2",     // New Tiled object name for the 2nd fish fly encounter trigger zone
    OBJECT_NAME_FISHFLY_SPAWN_2: "Fishfly2", 
    OBJECT_NAME_GATEKEEPER_SPAWN_POINT:  'GatekeeperSpawnPoint', // Name of the Tiled POINT object for spawn
    OBJECT_NAME_GATEKEEPER_TRIGGER_ZONE: 'GatekeeperTriggerZone', // Name of the Tiled RECTANGLE object for dialogue trigger
 

};

// Water Animation
const WATER_CONFIG = {
    ANIM_KEY: 'water_flow_anim',
    FRAME_WIDTH: 4 * TILE_SIZE, FRAME_HEIGHT: 4 * TILE_SIZE,
    FRAME_RATE: 9, NUM_FRAMES: 15, DEPTH: -2.5, SPRITE_COUNT: 3
};

const EERIE_AMBIENT_LIGHT = 0x252535; // Example: Darker, desaturated blue/grey

// For Incantation (CHOOSE YOUR WORD!)
// In GameScene create(): this.CORRECT_INCANTATION_WORD = "YOUR_WORD_HERE";
// In GameScene create(): this.INCANTATION_REPETITIONS = 3; // Or 1

// For Gatekeeper
// ASSETS.GATEKEEPER_SPRITESHEET = { key: 'gatekeeperSheet', file: 'path/to/gatekeeper_spritesheet.png'};
// const GATEKEEPER_CONFIG = {
//     FRAME_WIDTH: 128, // Example
//     FRAME_HEIGHT: 128, // Example
//     ANIM_IDLE: 'gatekeeper_idle', // Example animation key
//     IDLE_FRAMES: 4, // Example
//     IDLE_FRAME_RATE: 5, // Example
//     LIGHT_RADIUS: 150, // Example
//     LIGHT_COLOR: 0xFF66CC, // Example
//     LIGHT_INTENSITY: 0.8 // Example
// };
// const TILED_NAMES = { /* ... */ GATEKEEPER_SPAWN_X: 'GatekeeperSpawnXFromTiled', /* ... */ }; // If using Tiled for spawn point

// New Dialogue Keys for dialogues.json
// 'viking_incantation_prompt' (though the text is hardcoded in startIncantationChallenge for now)
// 'gatekeeper_greeting'

const MARGOT_CONFIG = {
    SPRITE_WIDTH: 36,
    SPRITE_HEIGHT: 36,
    WALK_SPEED: 40,
    ANIM_IDLE: 'margot_idle_anim',
    ANIM_WALK: 'margot_walk_anim',
    IDLE_FRAMES: 29,
    IDLE_FRAME_RATE: 10,
    WALK_FRAMES: 6,
    WALK_FRAME_RATE: 10,
    // --- ADD THESE ---
    LIGHT_RADIUS: 70,      // Example value, adjust as needed
    LIGHT_COLOR: 0xFFE0BD, // Example: a soft, warm, slightly desaturated orange/yellow
    LIGHT_INTENSITY: 0.4   // Example value (0 to 1+)
};

// --- GATEKEEPER_CONFIG ---
const GATEKEEPER_CONFIG = {
    FRAME_WIDTH: 64,  // Replace with the actual width of one frame of your Gatekeeper
    FRAME_HEIGHT: 80, // Replace with the actual height of one frame
    ANIM_IDLE: 'gatekeeper_idle_anim', // Animation key for its idle state
    IDLE_FRAMES: 10,                 // You mentioned it's a 10-frame spritesheet
    IDLE_FRAME_RATE: 8,              // Adjust for desired animation speed

    // Optional: Light properties if the Gatekeeper emits light
    LIGHT_RADIUS: 120,
    LIGHT_COLOR: 0xFF88CC, // Example: A mystical magenta
    LIGHT_INTENSITY: 0.7,
};

// Player Configuration
const PLAYER_CONFIG = {
    START_X: 210 + TILE_SIZE * 1.5,
    SPEED: 180,
    JUMP_VELOCITY: -350,
    BOUNCE: 0.1,
    SPRITE_WIDTH: 108,
    SPRITE_HEIGHT: 108,
    BODY_WIDTH: 15,
    BODY_HEIGHT: 40,
    LIGHT_RADIUS: 100,
    LIGHT_COLOR: 0xe6c8ff,
    LIGHT_INTENSITY: 0.65,
    DEPTH: 5,
    ANIM_IDLE: 'idle', // Use the exact string key you use in initAnimations
    ANIM_RUN: 'run',   // Use the exact string key you use in initAnimations
    ANIM_JUMP: 'jump'  // Use the exact string key you use in initAnimations
};
// Firefly Configuration
const FIREFLY_CONFIG = {
    TEXTURE_KEY: 'firefly_texture', PER_LIGHT: { min: 2, max: 4 }, ORBIT_RADIUS: { min: 8, max: 25 },
    ORBIT_SPEED: { min: 0.01, max: 0.04 }, SIZE: { min: 0.8, max: 1.8 }, COLOR: 0xFFFF99,
    ALPHA: { min: 0.6, max: 1.0 }, DEPTH: 6, RADIUS_OSCILLATION: { amplitude: 3, speed: 0.01 }
};

// Bird Configuration
// NOTE: Console shows 'Critters' layer not found. Update TILED_OBJECT_LAYER if needed.
const BIRD_CONFIG = {
    FRAME_WIDTH: 16, FRAME_HEIGHT: 16, SLEEP_ANIM_KEY: 'bird_sleep_anim', FLY_ANIM_KEY: 'bird_fly_anim',
    SLEEP_FRAMES: 8, FLY_FRAMES: 8, WAKE_DISTANCE: 60, FLY_SPEED_X: 100, FLY_SPEED_Y: -30,
    DEPTH: 4, TILED_OBJECT_LAYER: 'Critters', TILED_OBJECT_TYPE: 'SleepingBird'
};

// Figure 8 Path Configuration
const FIGURE8_PATH_CONFIG = {
    CENTER_X: 116, CENTER_Y: 200, WIDTH_RADIUS: 100, HEIGHT_RADIUS: 20, SPEED: 0.015, START_ANGLE: 0
};

// In constants.js
const FISHFLIES_CONFIG = {
    TEXTURE_KEY: 'fishfly_particle_texture',
    COLOR: 0xffffff, // Or your preferred color
    SIZE: { min: 1, max: 2 },
    PER_SWARM_POINT: { min: 25, max: 35 },

    EMERGE_DURATION: { min: 400, max: 1000 },

    // --- Figure 8 Orbiting Parameters ---
    FIGURE8_RADIUS_X: { min: 15, max: 25 },
    FIGURE8_RADIUS_Y: { min: 8, max: 15 },
    FIGURE8_SPEED: { min: 0.05, max: 0.1 },
    FIGURE8_PHASE_OFFSET_MAX: Math.PI * 2,
    FIGURE8_RADIUS_OSCILLATION: { amplitude: 3, speed: 0.005 },

    // --- Vertical Bobbing ---
    Y_BOB_AMPLITUDE: {min: 5, max: 12},
    Y_BOB_SPEED: {min: 0.05, max: 0.12},

    // --- Light Properties ---
    LIGHT_RADIUS: 60,
    LIGHT_COLOR: 0x008080, 
    LIGHT_INTENSITY: 1, 

    // --- Following Behavior & General ---
    FOLLOW_LERP_FACTOR: 0.07,
    ALPHA: { min: 0.3, max: 0.6 },
    DEPTH_OFFSET_FROM_PLAYER: 1,

    // --- MISSING PROPERTIES TO ADD ---
    PLAYER_OFFSET_X: { min: -15, max: 15 }, // Horizontal offset range from player's head for buzzing
    PLAYER_OFFSET_Y: { min: -20, max: -5 }, // Vertical offset range (e.g., slightly above player's head)
    RETURN_DURATION: { min: 100, max: 750 } // Duration for the return tween when going home
};

const MOTH_CONFIG = {
    FRAME_WIDTH: 64,
    FRAME_HEIGHT: 64,
    ANIM_FLY: 'moth_fly',
    FLY_FRAMES: 6, // Make sure this matches your sheet
    FLY_FRAME_RATE: 10,
    HOVER_SPEED: 30,
    HOVER_RANGE: 80,
    VERTICAL_DRIFT: 15,
    // --- New Constants ---
    SPAWN_OFFSET_X: 40,   // Pixels to the right of MothTriggerZone's edge
    LIGHT_RADIUS: 90,     // How far the moth's light reaches
    LIGHT_COLOR: 0xFFFFEE, // A faint yellowish-white glow
    LIGHT_INTENSITY: 0.5   // How bright the glow is (0 to 1+)
};

const LUNA_MOTH_CONFIG = {
    // --- Spritesheet and Animation ---
    FRAME_WIDTH: 64,        // Width of a single frame in the Luna Moth spritesheet
    FRAME_HEIGHT: 64,       // Height of a single frame
    ANIM_FLY: 'luna_moth_fly',// UNIQUE animation key for Luna Moth's flying animation
    FLY_FRAMES: 6,          // Number of frames in Luna Moth's fly animation (ensure this matches your Luna Moth spritesheet)
    FLY_FRAME_RATE: 10,     // Animation speed for flying

    // --- Light Properties ---
    LIGHT_RADIUS: 70,       // Example: Slightly different light for Luna Moth
    LIGHT_COLOR: 0xAADDFF,  // Example: A light blue/greenish glow, distinct from Atlas Moth
    LIGHT_INTENSITY: 0.65,  // Example: Brightness

    // --- Behavior Specific to Luna Moth ---
    LEAD_SPEED: 65,         // Speed at which Luna Moth leads the player

    // --- Optional: If Luna Moth has a distinct idle hover when not leading ---
    // IDLE_HOVER_SPEED: 15,
    // IDLE_HOVER_RANGE_X: 5, // Can be smaller for a gentler hover
    // IDLE_HOVER_RANGE_Y: 3,
};

const PARALLAX_FACTORS = {
    ORIGINAL_BG: 0.02, // Furthest original background - moves extremely slowly (or set to 0)
    STARS: 0.05,       // Stars move slightly faster
    BG_LAYER_1: 0.1,   // Farthest new layer
    BG_LAYER_2: 0.3,   // Middle new layer
    BG_LAYER_3: 0.6,   // Closest new layer
};
const AMBIENT_LIGHT_COLOR = 0x404050;

/** Helper function to get Tiled property from an object's properties array */
function getTiledPropertyValue(propertiesArray, propertyName) {
    if (!propertiesArray) return undefined;
    const prop = propertiesArray.find(p => p.name === propertyName);
    return prop ? prop.value : undefined;
}