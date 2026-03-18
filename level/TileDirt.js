import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileDirt extends Tile {
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
