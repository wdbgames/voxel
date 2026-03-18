import { Tile } from "./Tile.js";

export class TileGlass extends Tile {
    constructor(tileMaterials, audio) {
        super(tileMaterials, audio);
        this.opaque = false;
    } 
}
