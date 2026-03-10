import { global } from "./main.js";
import { Chunk } from "./tile/Chunk.js";

export class Level {
    chunkWidth;
    chunkHeight;
    chunkDepth;
    width;
    height;
    depth;
    chunks;

    constructor(width, height, depth) {
        // upd for cut chunks
        this.chunkWidth = Math.floor(width / global.chunkSize);
        this.chunkHeight = Math.floor(height / global.chunkSize);
        this.chunkDepth = Math.floor(depth / global.chunkSize);
        this.width = this.chunkWidth * global.chunkSize;
        this.height = this.chunkHeight * global.chunkSize;
        this.depth = this.chunkDepth * global.chunkSize; 
        this.chunks = new Array(this.chunkWidth * this.chunkHeight * this.chunkDepth);
    }

    generate() {
        // ground
        for(let x = 0; x < this.chunkWidth; ++x) {
            for(let y = 0; y < this.chunkHeight; ++y) {
                for(let z = 0; z < this.chunkDepth; ++z) {
                    this.chunks[x + this.chunkWidth * y + this.chunkWidth * this.chunkHeight * z] = new Chunk(x, y, z);
                }
            }
        }

        // house
		for (let x = 0; x < 7; ++x) {
            for (let y = 0; y < 4; ++y) {
                for (let z = 0; z < 7; ++z) {
                    this.setTile(16 + x, 33 + y, 16 + z, global.tile.wood);
                }
            }
		}
		for (let x = 0; x < 7; ++x) {
            for (let z = 0; z < 7; ++z) {
                this.setTile(16 + x, 32, 16 + z, global.tile.stone);
            }
		}
		for (let x = 0; x < 5; ++x) {
            for (let y = 0; y < 3; ++y) {
                for (let z = 0; z < 5; ++z) {
                    this.setTile(17 + x, 33 + y, 17 + z, global.tile.void);
                }
            }
		}
        this.setTile(16 + 3, 33, 16, global.tile.void);
        this.setTile(16 + 3, 34, 16, global.tile.void);

        // geometry
        for(let i = 0; i < this.chunks.length; ++i) {
            this.chunks[i].generateGeometry();
        }
    }



    getTile(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return 0;
        }

        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(y / global.chunkSize) + this.chunkWidth * this.chunkHeight * Math.floor(z / global.chunkSize)];
        return chunk.tiles[(z % global.chunkSize) + ((y % global.chunkSize) * global.chunkSize) + ((x % global.chunkSize) * global.chunkSize * global.chunkSize)];
    }

    setTile(x, y, z, tileId) {
        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(y / global.chunkSize) + this.chunkWidth * this.chunkHeight * Math.floor(z / global.chunkSize)];
        chunk.tiles[(z % global.chunkSize) + ((y % global.chunkSize) * global.chunkSize) + ((x % global.chunkSize) * global.chunkSize * global.chunkSize)] = tileId;
    }

    setTileWithUpdate(x, y, z, tileId) {
        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(y / global.chunkSize) + this.chunkWidth * this.chunkHeight * Math.floor(z / global.chunkSize)];
        chunk.tiles[(z % global.chunkSize) + ((y % global.chunkSize) * global.chunkSize) + ((x % global.chunkSize) * global.chunkSize * global.chunkSize)] = tileId;
        chunk.updateGeometry();
    }

    update(x, y, z) {
        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(y / global.chunkSize) + this.chunkWidth * this.chunkHeight * Math.floor(z / global.chunkSize)];
        chunk.updateGeometry();
    }

    refresh
}

