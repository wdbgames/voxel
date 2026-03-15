import { Tile } from "./Tile.js";

export class TileVoid extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
        this.viscosity = 0;
        this.breakable = false;
        this.hasCustomBoundingBox = true;
        this.customBoundingBox = [0, 0, 0, 0, 0, 0];
    }
}
