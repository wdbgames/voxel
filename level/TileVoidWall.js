import { Tile } from "./Tile.js";

export class TileVoidWall extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
    }
}
