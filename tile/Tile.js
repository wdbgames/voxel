export class Tile {
    void;
    stone;
    dirt;
    grass;
    tiles = [];
    tileIndex;

    constructor(tileIndex) {
        this.tileIndex = tileIndex;
    }

    initializeTiles() {
        // tile id
        this.void = 0;
        this.stone = 1;
        this.dirt = 2;
        this.grass = 3;
        this.wood = 4;

        // tile classes
        this.tiles[this.void] = new TileVoid(0);
        this.tiles[this.stone] = new TileStone(1);
        this.tiles[this.dirt] = new TileDirt(2);
        this.tiles[this.grass] = new TileGrass(3);
        this.tiles[this.wood] = new Tile(4);
    }
}

class TileVoid extends Tile {
    constructor(tileIndex) {
        super(tileIndex);
    }
}

class TileStone extends Tile {
    constructor(tileIndex) {
        super(tileIndex);
    }
}

class TileDirt extends Tile {
    constructor(tileIndex) {
        super(tileIndex);
    }
}

class TileGrass extends Tile {
    constructor(tileIndex) {
        super(tileIndex);
    }
}
