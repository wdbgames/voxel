import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileLog extends Tile {
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
