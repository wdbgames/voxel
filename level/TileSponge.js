import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileSponge extends Tile {
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
                        global.level.setTileWithUpdate(i, j, k, global.tile.void);
                    }
                }
            }
        }
    }
}
