import { global } from "../main.js";

export class Tile {
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
    tiles = [];
    culling = true;
    opaque = true;
    viscosity = 1;
    tileAmount;

    constructor(tileMaterials) {
        this.tileMaterials = tileMaterials;
        if(Array.isArray(tileMaterials)) {
            this.tileMaterials = tileMaterials;
        } else {
            this.tileMaterials= new Array(6).fill(tileMaterials);
        }
    }

    initializeTiles() {
        this.tileAmount = 16;

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

        // tile classes
        this.tiles[this.void] = new TileVoid(0, false, 0);
        this.tiles[this.stone] = new Tile(5);
        this.tiles[this.dirt] = new TileDirt(2);
        this.tiles[this.grass] = new TileGrass([6, 6, 3, 2, 6, 6]);
        this.tiles[this.wood] = new Tile(4);
        this.tiles[this.stoneDeep] = new TileStoneDeep(1);
        this.tiles[this.sand] = new TileSand(7);
        this.tiles[this.mud] = new Tile(8);
        this.tiles[this.negeritre] = new TileNegeritre(9);
        this.tiles[this.water] = new TileWater(10, false, 0.8);
        this.tiles[this.leaves] = new TileLeaves(11, false, false, 0.6);
        this.tiles[this.log] = new TileLog([12, 12, 13, 13, 12, 12]);
        this.tiles[this.flesh] = new Tile(14);
        this.tiles[this.metal] = new Tile(15);
        this.tiles[this.voidWall] = new Tile(0);
        this.tiles[this.lava] = new TileLava(16, false, 0.8);
    }

    tick() { 
    }

    update(x, y, z) {
    }

    added(x, y, z) { 
    }

    removed(x, y, z) {  
    }
}

class TileVoid extends Tile {
    constructor(tileMaterials, opaque, viscosity) {
        super(tileMaterials);
        this.opaque = opaque;
        this.viscosity = viscosity;
    }
}

class TileDirt extends Tile {
    constructor(tileMaterials) {
        super(tileMaterials);
    }

    update(x, y, z) {
        if(global.level.getTile(x, y + 1, z) == global.tile.void && global.level.theme != 1) {
            global.level.setTileWithUpdate(x, y, z, global.tile.grass);
        }
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileGrass extends Tile {
    constructor(tileMaterials) {
        super(tileMaterials);
    }

    update(x, y, z) {
        if(global.level.getTile(x, y + 1, z) != global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.dirt);
        }
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

class TileStoneDeep extends Tile {
    constructor(tileMaterials) {
        super(tileMaterials);
    }

    removed(x, y, z) {
        global.level.setTileWithUpdate(x, y, z, global.tile.stone);
    }
}

class TileNegeritre extends Tile {
    constructor(tileMaterials) {
        super(tileMaterials);
    }

    removed(x, y, z) {
        global.level.setTileWithUpdate(x, y, z, global.tile.negeritre);
    }
}

class TileWater extends Tile {
    constructor(tileMaterials, opaque, viscosity) {
        super(tileMaterials);
        this.opaque = opaque;
        this.viscosity = viscosity;
    }

    tick(x, y, z) {
        if(global.level.getTile(x, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z, global.tile.water);
            return;
        }
        if(global.level.getTile(x - 1, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x - 1, y - 1, z, global.tile.water);
            return;
        }
        if(global.level.getTile(x + 1, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x + 1, y - 1, z, global.tile.water);
            return;
        }
        if(global.level.getTile(x, y - 1, z - 1) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z - 1, global.tile.water);
            return;
        }
        if(global.level.getTile(x, y - 1, z + 1) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z + 1, global.tile.water);
            return;
        }
    }

    update(x, y, z) {
        global.level.scheduleTick(x, y, z, 4);
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}

// WEIRD CRASH
class TileLeaves extends Tile {
    constructor(tileMaterials, culling, opaque, viscosity) {
        super(tileMaterials);
        this.culling = culling;
        this.opaque = opaque;
        this.viscosity = viscosity;
    }

    tick(x, y, z) {
        let log = false;

        for(let i = x - 1; i < x + 2; ++i) {
            for(let j = y - 1; j < y + 2; ++j) {
                for(let k = z - 1; k < z + 2; ++k) {
                    if(global.level.getTile(i, j, k) == global.tile.log) {
                        log = true;
                    }
                }
            }
        }

        if(!log) {
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

class TileSand extends Tile {
    constructor(tileMaterials) {
        super(tileMaterials);
    }

    update(x, y, z) {
        let i = y;
        while(global.level.getTile(x, i - 1, z) == global.tile.void) {
            --i;
        }
        if(i != y) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, i, z, global.tile.sand);
        }
    }
}

class TileLog extends Tile {
    constructor(tileMaterials) {
        super(tileMaterials);
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

class TileLava extends Tile {
    constructor(tileMaterials, opaque, viscosity) {
        super(tileMaterials);
        this.opaque = opaque;
        this.viscosity = viscosity;
    }

    tick(x, y, z) {
        if(global.level.getTile(x, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z, global.tile.lava);
            return;
        }
        if(global.level.getTile(x - 1, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x - 1, y - 1, z, global.tile.lava);
            return;
        }
        if(global.level.getTile(x + 1, y - 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x + 1, y - 1, z, global.tile.lava);
            return;
        }
        if(global.level.getTile(x, y - 1, z - 1) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z - 1, global.tile.lava);
            return;
        }
        if(global.level.getTile(x, y - 1, z + 1) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z + 1, global.tile.lava);
            return;
        }
    }

    update(x, y, z) {
        global.level.scheduleTick(x, y, z, 8);
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}
