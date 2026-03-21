import { global } from "../main.js";
import { Tile } from "./Tile.js";

export class TileBush extends Tile {
    hasBerries;

    constructor(tileMaterials, audio, hasBerries) {
        super(tileMaterials, audio);
        this.hasBerries = hasBerries;
        this.culling = false;
        this.opaque = false;
        this.viscosity = 0.2;
        this.breakable = true;
        this.hasCustomBoundingBox = true;
        this.customBoundingBox = [1 / 16, 1 / 16, 1 / 16, 15 / 16, 15 / 16, 15 / 16];
        this.hasCustomFaceVertices = true;
        this.hasCustomFaceUVs = true;
        const min = 1 / 16;
        const max = 15 / 16;
        this.customFaceVertices = new Float32Array([
            0, 0, max, 1, 0, max, 1, 1, max, 0, 1, max, // front
            1, 0, min, 0, 0, min, 0, 1, min, 1, 1, min, // back
            0, max, 1, 1, max, 1, 1, max, 0, 0, max, 0, // top
            0, min, 0, 1, min, 0, 1, min, 1, 0, min, 1, // bottom
            max, 0, 1, max, 0, 0, max, 1, 0, max, 1, 1, // right
            min, 0, 0, min, 0, 1, min, 1, 1, min, 1, 0 // left
            
        ]);
        this.customFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 1, 0, 1, // front
            0, 0, 1, 0, 1, 1, 0, 1, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 1, 0, 1, // right
            0, 0, 1, 0, 1, 1, 0, 1, // left
        ]);
    }

    interact(x, y, z) {
        if(this.hasBerries) {
            global.level.setTileWithUpdate(x, y, z, global.tile.bush)
        }
    }
}
