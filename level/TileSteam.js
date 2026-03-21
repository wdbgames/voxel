import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileSteam extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
        this.viscosity = 0;
        this.breakable = false;
    }

    
    tick(x, y, z) {
        if(global.level.getTile(x, y + 1, z) == global.tile.void) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y + 1, z, global.tile.steam);
            return;
        }
    }

    update(x, y, z) {
        global.level.scheduleTick(x, y, z, 4);
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
    
}
