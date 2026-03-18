import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileMusic extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    interact(x, y, z) {
        let data = global.level.getTileData(x, y - 1, z);
        if(data >= global.audioCount) {
            data = 0;
        }
        
        global.level.playSound(x, y, z, data)
    }
}
