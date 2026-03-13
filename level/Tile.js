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

    // REPLACE TILEINDICES WITH TILEMATERIALS
    constructor(tileIndices) {
        this.tileIndices = tileIndices;
        if(Array.isArray(tileIndices)) {
            this.tileIndices = tileIndices;
        } else {
            this.tileIndices= new Array(6).fill(tileIndices);
        }
    }

    initializeTiles() {
        this.tileAmount = 13;

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

        // tile classes
        this.tiles[this.void] = new TileVoid(0, false, 0);
        this.tiles[this.stone] = new Tile(5);
        this.tiles[this.dirt] = new Tile(2);
        this.tiles[this.grass] = new Tile([6, 6, 3, 2, 6, 6]);
        this.tiles[this.wood] = new Tile(4);
        this.tiles[this.stoneDeep] = new Tile(1);
        this.tiles[this.sand] = new Tile(7);
        this.tiles[this.mud] = new Tile(8);
        this.tiles[this.negeritre] = new Tile(9);
        this.tiles[this.water] = new TileWater(10, false, 0.8);
        this.tiles[this.leaves] = new TileLeaves(11, false, false, 0.6);
        this.tiles[this.log] = new Tile([12, 12, 13, 13, 12, 12]);
        this.tiles[this.flesh] = new Tile(14);
    }
}

class TileVoid extends Tile {
    constructor(tileIndices, opaque, viscosity) {
        super(tileIndices);
        this.opaque = opaque;
        this.viscosity = viscosity;
    }
}

class TileWater extends Tile {
    constructor(tileIndices, opaque, viscosity) {
        super(tileIndices);
        this.opaque = opaque;
        this.viscosity = viscosity;
    }
}

class TileLeaves extends Tile {
    constructor(tileIndices, culling, opaque, viscosity) {
        super(tileIndices);
        this.culling = culling;
        this.opaque = opaque;
        this.viscosity = viscosity;
    }
}
