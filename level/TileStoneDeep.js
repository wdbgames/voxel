import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileStoneDeep extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    removed(x, y, z) {
        global.level.setTileWithUpdate(x, y, z, global.tile.stone);
    }
}
