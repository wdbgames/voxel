import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileData extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
    }

    interact(x, y, z) {
        let data = global.level.getTileData(x, y, z) + 1;
        if(data == 16) {
            data = 0;
        }
        
        global.level.setTileData(x, y, z, data);
        console.log(data);
    }
}
