import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileStep extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
        this.culling = false;
        this.hasCustomBoundingBox = true;
        this.hasCustomFaceVertices = true;
        this.hasCustomFaceUVs = true;
        this.customBoundingBox = [0, 0, 0, 1, 8 / 16, 1];
        this.customFaceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 0.5, 1, 0, 0.5, 1, // front
            1, 0, 0, 0, 0, 0, 0, 0.5, 0, 1, 0.5, 0, // back
            0, 0.5, 1, 1, 0.5, 1, 1, 0.5, 0, 0, 0.5, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 0.5, 0, 1, 0.5, 1, // right
            0, 0, 0, 0, 0, 1, 0, 0.5, 1, 0, 0.5, 0  // left
        ]);
        this.customFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // front
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // right
            0, 0, 1, 0, 1, 0.5, 0, 0.5, // left
        ]);
    }
    
    added(x, y, z) {
        if(global.level.getTile(x, y - 1, z) == global.tile.step) {
            global.level.setTileWithUpdate(x, y, z, global.tile.void);
            global.level.setTileWithUpdate(x, y - 1, z, global.tile.stone);
        }
    }
}
