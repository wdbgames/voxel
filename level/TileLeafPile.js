import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileLeafPile extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.culling = false;
        this.opaque = false;
        this.viscosity = 0;
        this.breakable = false;
        this.hasCustomFaceVertices = true;
        this.hasCustomFaceUVs = true;
        this.customFaceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 1 / 16, 1, 0, 1 / 16, 1, // front
            1, 0, 0, 0, 0, 0, 0, 1 / 16, 0, 1, 1 / 16, 0, // back
            0, 1 / 16, 1, 1, 1 / 16, 1, 1, 1 / 16, 0, 0, 1 / 16, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 1 / 16, 0, 1, 1 / 16, 1, // right
            0, 0, 0, 0, 0, 1, 0, 1 / 16, 1, 0, 1 / 16, 0  // left
        ]);
        this.customFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // front
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // right
            0, 0, 1, 0, 1, 1 / 16, 0, 1 / 16, // left
        ]);
    }

    update(x, y, z) {
        if(global.tile.tiles[global.level.getTile(x, y - 1, z)].breakable != 1) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
        }
    }

    added(x, y, z) { 
        this.update(x, y, z);
    }
}
