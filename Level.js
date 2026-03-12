import { global } from "./main.js";
import { Chunk } from "./level/Chunk.js";
import { AABB } from "./AABB.js";

export class Level {
    chunkWidth;
    chunkHeight;
    chunkDepth;
    width;
    height;
    depth;
    chunks;
    seed;
    spawnX;
    spawnY;
    spawnZ;

    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth; 
        this.chunkWidth = Math.ceil(this.width / global.chunkSize);
        this.chunkHeight = Math.ceil(this.height / global.chunkSize);
        this.chunkDepth = Math.ceil(this.depth / global.chunkSize);
        this.widthCeil = this.chunkWidth * global.chunkSize;
        this.heightCeil = this.chunkHeight * global.chunkSize;
        this.depthCeil = this.chunkDepth * global.chunkSize; 
        this.chunks = new Array(this.chunkWidth * this.chunkHeight * this.chunkDepth);
        this.seed = Math.random();
    }

    seedRandom(seed) {
        let x = seed % 2147483647;
        if(x <= 0) {
            x += 2147483646;
        }
        return function() {
            x ^= x << 13;
            x ^= x >> 17;
            x ^= x << 5;
            return Math.abs((x % 2147483647) / 2147483647);
        };
    }

    generate() {
        const random = this.seedRandom(Math.floor(this.seed * 65535));
        if(global.DEBUG) {
            console.log("Random test: " + random());
        }

        // per chunk generation
        for(let x = 0; x < this.chunkWidth; ++x) {
            for(let z = 0; z < this.chunkDepth; ++z) {
                for(let y = 0; y < this.chunkHeight; ++y) {
                    this.chunks[x + this.chunkWidth * z + this.chunkWidth * this.chunkDepth * y] = new Chunk(x, y, z);
                }
            }
        }

        // blobs
        if(global.DEBUG) {
            console.log("Blob amount: " + Math.floor(this.width * this.height * this.depth / 2048));
        }
        for(let i = 0; i < Math.floor(this.width * this.height * this.depth / 2048); ++i) {
            const x = Math.floor(random() * this.width);
            const y = Math.floor(random() * this.height);
            const z = Math.floor(random() * this.depth);
        }

        // trees
        if(global.DEBUG) {
            console.log("Tree amount: " + Math.floor(this.width * this.depth / 128));
        }
        for(let amount = 0; amount < Math.floor(this.width * this.depth / 128); ++amount) {
            const x = Math.floor(random() * this.width);
            const z = Math.floor(random() * this.depth);
            let y = 0;
            while(this.getTile(x, y, z) != 0) {
                ++y;
            }
            if(this.getTile(x, y - 1, z) == global.tile.grass) {
                this.setTile(x, y - 1, z, global.tile.dirt);
                for(let i = 0; i < 3; ++i) {
                    for(let j = 0; j < 3; ++j) {
                        for(let k = 0; k < 3; ++k) {
                            this.setTile(x + i - 1, y + k + 3, z + j - 1, global.tile.leaves);
                        }
                    }
                }
                for(let i = 0; i < 5; ++i) {
                    this.setTile(x, y + i, z, global.tile.log);
                }
            }
        }

        // house
        if(this.width > 15 && this.depth > 15) {
            const houseX = this.width / 2 - 3;
            const houseZ = this.depth / 2 - 3;

            let i = 0;
            while(this.getTile(houseX, i, houseZ) != 0) {
                ++i;
            }

            const houseY = i - 1;
            this.spawnX = houseX + 3.5;
            this.spawnY = houseY + 2.5;
            this.spawnZ = houseZ + 3.5;

            for (let x = 0; x < 7; ++x) {
                for (let y = 0; y < 4; ++y) {
                    for (let z = 0; z < 7; ++z) {
                        this.setTile(houseX + x, houseY + 1 + y, houseZ + z, global.tile.wood);
                    }
                }
            }

            for (let x = 0; x < 7; ++x) {
                for (let z = 0; z < 7; ++z) {
                    this.setTile(houseX + x, houseY, houseZ + z, global.tile.stoneDeep);
                }
            }

            for (let x = 0; x < 5; ++x) {
                for (let y = 0; y < 3; ++y) {
                    for (let z = 0; z < 5; ++z) {
                        this.setTile(houseX + 1 + x, houseY + 1 + y, houseZ + 1 + z, global.tile.void);
                    }
                }
            }

            this.setTile(houseX + 3, houseY + 1, houseZ, global.tile.void);
            this.setTile(houseX + 3, houseY + 2, houseZ, global.tile.void);
        } else {
            this.spawnX = this.width / 2;
            this.spawnZ = this.depth / 2;

            let i = 0;
            while(this.getTile(this.spawnX, i, this.spawnZ) != 0) {
                ++i;
            }

            this.spawnY = i + 1.5;
        }

        // geometry
        for(let i = 0; i < this.chunks.length; ++i) {
            this.chunks[i].generateGeometry();
        }

        if(global.DEBUG) {
            const size = this.width * this.height * this.depth;
            console.log(this.width + ", " + this.height + ", " + this.depth);
            console.log(Math.round(size) + " bytes");
            console.log(Math.round(size / 1000) + " kilobytes");
            console.log(Math.round(size / 1000000) + " megabytes");
        }
    }

    getTile(x, y, z) {
        if (x < 0 || x >= this.widthCeil || y < 0 || y >= this.heightCeil || z < 0 || z >= this.depthCeil) {
            return 0;
        }

        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(z / global.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / global.chunkSize)];
        return chunk.tiles[(y % global.chunkSize) + ((z % global.chunkSize) * global.chunkSize) + ((x % global.chunkSize) * global.chunkSize * global.chunkSize)];
    }

    setTile(x, y, z, tileId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return -1;
        }

        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(z / global.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / global.chunkSize)];
        chunk.tiles[(y % global.chunkSize) + ((z % global.chunkSize) * global.chunkSize) + ((x % global.chunkSize) * global.chunkSize * global.chunkSize)] = tileId;
    }

    setTileWithUpdate(x, y, z, tileId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return -1;
        }

        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(z / global.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / global.chunkSize)];
        chunk.tiles[(y % global.chunkSize) + ((z % global.chunkSize) * global.chunkSize) + ((x % global.chunkSize) * global.chunkSize * global.chunkSize)] = tileId;
        chunk.updateGeometry();
    }

    update(x, y, z) {
        if (x < 0 || x >= this.widthCeil || y < 0 || y >= this.heightCeil || z < 0 || z >= this.depthCeil) {
            return -1;
        }

        const chunk = this.chunks[Math.floor(x / global.chunkSize) + this.chunkWidth * Math.floor(z / global.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / global.chunkSize)];
        chunk.updateGeometry();
    }

    getTileAABBs(box) {
        const tilesAABBs = [];
        const tiles = [];
        const AABBs = [];

        let x0 = Math.floor(box.x0);
        let y0 = Math.floor(box.y0);
        let z0 = Math.floor(box.z0);
        let x1 = Math.ceil(box.x1);
        let y1 = Math.ceil(box.y1);
        let z1 = Math.ceil(box.z1);

        x0 = Math.max(0, x0);
        y0 = Math.max(0, y0);
        z0 = Math.max(0, z0);
        x1 = Math.min(this.width, x1);
        y1 = Math.min(this.height, y1);
        z1 = Math.min(this.depth, z1);

        for (let x = x0; x < x1; ++x) {
            for (let y = y0; y < y1; ++y) {
                for (let z = z0; z < z1; ++z) {
                    const tile = this.getTile(x, y, z);
                    if (global.tile.tiles[tile].viscosity == 1) {
                        AABBs.push(new AABB(x, y, z, x + 1, y + 1, z + 1));
                    }
                    tiles.push(tile);
                }
            }
        }

        tilesAABBs[0] = tiles;
        tilesAABBs[1] = AABBs;

        return tilesAABBs;
    }
}
