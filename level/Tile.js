import { global } from "../main.js"; // remove global import

export class Tile {
    tileAmount;

    // BIG REFACTOR, swap... (maybe)
    void;
    stone;
    dirt;
    grass;
    sand;
    mud;
    negeritre;
    water;
    leaves;
    log;
    flesh;
    metal;
    voidWall;
    lava;
    rock;
    roots;
    step;
    leafPile;
    sponge;
    pumice;
    glass;
    carpet;
    music;
    stoneBlood;
    tiles = [];

    tileMaterials = [0, 0, 0, 0, 0, 0];
    culling = true;
    opaque = true;
    breakable = true;
    viscosity = 1;
    audio = 0;
    hasCustomBoundingBox = false;
    hasCustomFaceVertices = false;
    hasCustomFaceUVs = false;
    customBoundingBox = [0, 0, 0, 1, 1, 1];
    customFaceVertices = new Float32Array(72);
    customFaceUVs = new Float32Array(8);

    constructor(tileMaterials, audio) {
        this.tileMaterials = tileMaterials;
        if(Array.isArray(tileMaterials)) {
            this.tileMaterials = tileMaterials;
        } else {
            this.tileMaterials= new Array(6).fill(tileMaterials);
        }
        this.audio = audio;
    }

    initializeTiles() {
        this.tileAmount = 26;

        // tile id
        this.void = 0;
        this.stone = 1;
        this.dirt = 2;
        this.grass = 3;
        this.wood = 4;
        this.stoneDeep = 5;
        this.sand = 6;
        this.mud = 7;
        this.negeritre = 8;
        this.water = 9;
        this.leaves = 10;
        this.log = 11;
        this.flesh = 12;
        this.metal = 13;
        this.voidWall = 14;
        this.lava = 15;
        this.rock = 16;
        this.roots = 17;
        this.step = 18;
        this.leafPile = 19;
        this.sponge = 20;
        this.pumice = 21;
        this.glass = 22;
        this.carpet = 23;
        this.music = 24;
        this.stoneBlood = 25;

        // tile classes
        this.tiles[this.void] = new TileVoid(0, 0);
        this.tiles[this.stone] = new Tile(5, 1);
        this.tiles[this.dirt] = new TileDirt(2, 3);
        this.tiles[this.grass] = new TileGrass([6, 6, 3, 2, 6, 6], 3);
        this.tiles[this.wood] = new Tile(4, 2);
        this.tiles[this.stoneDeep] = new TileStoneDeep(1, 1);
        this.tiles[this.sand] = new TileGravity(7, 3, this.sand);
        this.tiles[this.mud] = new Tile(8, 4);
        this.tiles[this.negeritre] = new TileNegeritre(9, 1);
        this.tiles[this.water] = new TileLiquid(10, 0, 0.8, this.water);
        this.tiles[this.leaves] = new TileLeaves(11, 0);
        this.tiles[this.log] = new TileLog([12, 12, 13, 13, 12, 12], 2);
        this.tiles[this.flesh] = new Tile(14, 4);
        this.tiles[this.metal] = new Tile(15, 5);
        this.tiles[this.voidWall] = new TileVoidWall(0, 1);
        this.tiles[this.lava] = new TileLiquid(16, 0, 0.4, this.lava);
        this.tiles[this.rock] = new TileGravity(17, 3, this.rock);
        this.tiles[this.roots] = new Tile(18, 3);
        this.tiles[this.step] = new TileStep(5, 1);
        this.tiles[this.leafPile] = new TileLeafPile(11, 0);
        this.tiles[this.sponge] = new TileSponge(20, 3, this.water);
        this.tiles[this.pumice] = new TileSponge(21, 1, this.lava);
        this.tiles[this.glass] = new TileGlass(22, 1);
        this.tiles[this.carpet] = new TileCarpet(23, 1);
        this.tiles[this.music] = new TileMusic([25, 25, 24, 25, 25, 25], 5);
        this.tiles[this.stoneBlood] = new Tile(26, 1);
    }

    tick() { 
    }

    update(x, y, z) {
        ++global.level.tileUpdates;
    }

    added(x, y, z) { 
    }

    removed(x, y, z) {  
    }

    interact(x, y, z) {
    }
}

class TileTest extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }
}

class TileVoid extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
        this.viscosity = 0;
        this.breakable = false;
        this.hasCustomBoundingBox = true;
        this.customBoundingBox = [0, 0, 0, 0, 0, 0];
    }
}

class TileDirt extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    update(x, y, z) {
        if(!global.tile.tiles[global.level.getTile(x, y + 1, z)].opaque && global.level.theme != 1) {
            global.level.setTileWithUpdate(x, y, z, global.tile.grass);
        }
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileGrass extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    update(x, y, z) {
        if(global.tile.tiles[global.level.getTile(x, y + 1, z)].opaque) {
            global.level.setTileWithUpdate(x, y, z, global.tile.dirt);
        }
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileStoneDeep extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    removed(x, y, z) {
        global.level.setTileWithUpdate(x, y, z, global.tile.stone);
    }
}

class TileNegeritre extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    removed(x, y, z) {
        global.level.setTileWithUpdate(x, y, z, global.tile.negeritre);
    }
}

// CHECK FOR PUMICE
class TileLiquid extends Tile {
    #tile;

    constructor(tileMaterials, audio, viscosity, tile) {
        super(tileMaterials, audio);
        this.opaque = false;
        this.viscosity = viscosity;
        this.#tile = tile;
        this.breakable = false;
        this.hasCustomBoundingBox = true;
        this.customBoundingBox = [1 / 16, 1 / 16, 1 / 16, 15 / 16, 15 / 16, 15 / 16];
    }

    tick(x, y, z) {
        if(global.level.getTile(x, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z, this.#tile);
            return;
        }
        if(global.level.getTile(x - 1, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x - 1, y - 1, z, this.#tile);
            return;
        }
        if(global.level.getTile(x + 1, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x + 1, y - 1, z, this.#tile);
            return;
        }
        if(global.level.getTile(x, y - 1, z - 1) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z - 1, this.#tile);
            return;
        }
        if(global.level.getTile(x, y - 1, z + 1) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z + 1, this.#tile);
            return;
        }
    }

    update(x, y, z) {
        global.level.scheduleTick(x, y, z, this.#tile == global.tile.water ? 4 : 8);
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileLeaves extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.culling = false;
        this.opaque = false;
        this.viscosity = 0.6;
        this.breakable = false;
        this.hasCustomBoundingBox = true;
        this.customBoundingBox = [1 / 16, 1 / 16, 1 / 16, 15 / 16, 15 / 16, 15 / 16];
    }

    tick(x, y, z) {
        let logCheck = false;

        for(let i = x - 1; i < x + 2; ++i) {
            for(let j = y - 1; j < y + 2; ++j) {
                for(let k = z - 1; k < z + 2; ++k) {
                    if(global.level.getTile(i, j, k) == global.tile.log) {
                        logCheck = true;
                    }
                }
            }
        }

        if(!logCheck) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
        }

        global.level.scheduleTick(x, y, z, 256 + Math.floor(Math.random() * 257));
    }

    update(x, y, z) {
        global.level.scheduleTick(x, y, z, 16 + Math.floor(Math.random() * 17));
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileGravity extends Tile {
    #tile;

    constructor(tileMaterials, audio, tile) {
        super(tileMaterials, audio);
        this.#tile = tile;
    }

    update(x, y, z) {
        let i = y;
        while(global.level.getTile(x, i - 1, z) == global.tile.void) {
            --i;
        }
        if(i != y) {
            global.level.setTileWithUpdate(x, i, z, this.#tile);
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            
        }
    }

    added(x, y, z) {
        this.update(x, y, z);
    }
}

class TileLog extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    removed(x, y, z) {
        for(let i = x - 1; i < x + 2; ++i) {
            for(let j = y - 1; j < y + 2; ++j) {
                for(let k = z - 1; k < z + 2; ++k) {
                    global.level.updateTile(i, j, k);
                }
            }
        }
    }
}

// CHANGE TO USE TRANSPARENT MATERIAL
class TileVoidWall extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
    }
}

class TileStep extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
        this.culling = false;
        this.hasCustomBoundingBox = true;
        this.hasCustomFaceVertices = true;
        this.hasCustomFaceUVs = true;
        this.customBoundingBox = [0, 0, 0, 1, 8 / 16, 1];
        this.customFaceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 0.5, 1, 0, 0.5, 1, // front
            1, 0, 0, 0, 0, 0, 0, 0.5, 0, 1, 0.5, 0, // back
            0, 0.5, 1, 1, 0.5, 1, 1, 0.5, 0, 0, 0.5, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 0.5, 0, 1, 0.5, 1, // right
            0, 0, 0, 0, 0, 1, 0, 0.5, 1, 0, 0.5, 0  // left
        ]);
        this.customFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // front
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // right
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // left
        ]);
    }
    
    added(x, y, z) {
        if(global.level.getTile(x, y - 1, z) == global.tile.step) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z, global.tile.stone);
        }
    }
}

class TileLeafPile extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.culling = false;
        this.opaque = false;
        this.viscosity = 0;
        this.breakable = false;
        this.hasCustomFaceVertices = true;
        this.hasCustomFaceUVs = true;
        this.customFaceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 1 / 16, 1, 0, 1 / 16, 1, // front
            1, 0, 0, 0, 0, 0, 0, 1 / 16, 0, 1, 1 / 16, 0, // back
            0, 1 / 16, 1, 1, 1 / 16, 1, 1, 1 / 16, 0, 0, 1 / 16, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 1 / 16, 0, 1, 1 / 16, 1, // right
            0, 0, 0, 0, 0, 1, 0, 1 / 16, 1, 0, 1 / 16, 0  // left
        ]);
        this.customFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // front
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // right
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // left
        ]);
    }

    update(x, y, z) {
        if(global.tile.tiles[global.level.getTile(x, y - 1, z)].breakable != 1) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
        }
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileSponge extends Tile {
    #tile;

    constructor(tileMaterials, audio, tile) {
        super(tileMaterials, audio);
        this.#tile = tile;
    }

    added(x, y, z) {
        for(let i = x - 2; i <= x + 2; ++i) {
            for(let j = y - 2; j <= y + 2; ++j) {
                for(let k = z - 2; k <= z + 2; ++k) {
                    if(global.level.getTile(i, j, k) == this.#tile) {
                        global.level.setTile(i, j, k, global.tile.void);
                    }
                }
            }
        }
    }
}

class TileGlass extends Tile {
    constructor(tileMaterials, audio, tile) {
        super(tileMaterials, audio);
        this.opaque = false;
    } 
}

class TileCarpet extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.culling = false;
        this.opaque = false;
        this.viscosity = 0;
        this.breakable = false;
        this.hasCustomFaceVertices = true;
        this.hasCustomFaceUVs = true;
        this.customFaceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 1 / 16, 1, 0, 1 / 16, 1, // front
            1, 0, 0, 0, 0, 0, 0, 1 / 16, 0, 1, 1 / 16, 0, // back
            0, 1 / 16, 1, 1, 1 / 16, 1, 1, 1 / 16, 0, 0, 1 / 16, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 1 / 16, 0, 1, 1 / 16, 1, // right
            0, 0, 0, 0, 0, 1, 0, 1 / 16, 1, 0, 1 / 16, 0  // left
        ]);
        this.customFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // front
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // right
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // left
        ]);
    }

    update(x, y, z) {
        if(global.tile.tiles[global.level.getTile(x, y - 1, z)].breakable != 1) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
        }
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileMusic extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    interact(x, y, z) {
        const audio = global.audio[global.tile.tiles[global.level.getTile(x, y - 1, z)].audio].cloneNode();
        audio.play();
    }
}

