import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileLeaves extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.culling = false;
        this.opaque = false;
        this.viscosity = 0.6;
        this.breakable = false;
        this.hasCustomBoundingBox = true;
        this.customBoundingBox = [1 / 16, 1 / 16, 1 / 16, 15 / 16, 15 / 16, 15 / 16];
    }

    tick(x, y, z) {
        let logCheck = false;

        for(let i = x - 1; i < x + 2; ++i) {
            for(let j = y - 1; j < y + 2; ++j) {
                for(let k = z - 1; k < z + 2; ++k) {
                    if(global.level.getTile(i, j, k) == global.tile.log) {
                        logCheck = true;
                    }
                }
            }
        }

        if(!logCheck) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
        }

        global.level.scheduleTick(x, y, z, 256 + Math.floor(Math.random() * 257));
    }

    update(x, y, z) {
        global.level.scheduleTick(x, y, z, 16 + Math.floor(Math.random() * 17));
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}
