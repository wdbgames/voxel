import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileGrass extends Tile {
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
