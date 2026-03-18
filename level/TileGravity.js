import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileGravity extends Tile {
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
