import { global } from "../main.js";

export class Tile {
    tileMaterials = [0, 0, 0, 0, 0, 0];
    culling = true;
    opaque = true;
    breakable = true;
    viscosity = 1;
    audio = 0;
    hasCustomBoundingBox = false;
    hasCustomFaceVertices = false;
    hasCustomFaceUVs = false;
    customBoundingBox = [0, 0, 0, 1, 1, 1];
    customFaceVertices = new Float32Array(72);
    customFaceUVs = new Float32Array(8);

    constructor(tileMaterials, audio) {
        if(Array.isArray(tileMaterials)) {
            this.tileMaterials = tileMaterials;
        } else {
            this.tileMaterials= new Array(6).fill(tileMaterials);
        }
        this.audio = audio;
    }

    tick() { 
    }

    update(x, y, z) {
        ++global.level.tileUpdates;
    }

    added(x, y, z) { 
    }

    removed(x, y, z) {  
    }

    interact(x, y, z) {
    }
}
