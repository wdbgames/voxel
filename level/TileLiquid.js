import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileLiquid extends Tile {
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
