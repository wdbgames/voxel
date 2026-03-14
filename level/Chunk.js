import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { global } from "../main.js";
import noise from "../libraries/perlin.js"

export class Chunk {
    x;
    y;
    z;
    chunkX;
    chunkY;
    chunkZ;
    tiles;
    mesh;

    constructor(x, y, z) {
        this.x = x * global.chunkSize;
        this.y = y * global.chunkSize;
        this.z = z * global.chunkSize;
        this.chunkX = x;
        this.chunkY = y;
        this.chunkZ = z;
        this.tiles = new Uint8Array(global.chunkSize * global.chunkSize * global.chunkSize);
        this.mesh = null;
        this.generate();
    }

    generate() {
        noise.seed(global.level.seed);
        let i = 0;
        const levelWidth = global.level.width;
        const levelDepth = global.level.depth;
        const levelHeight = global.level.height;

        let water = global.tile.water;
        let grass = global.tile.grass;
        let sand = global.tile.sand;
        if(global.level.theme == 1) {
            water = global.tile.lava;
            grass = global.tile.dirt;
            sand = global.tile.grass;

        }

        for(let x = this.x; x < this.x + global.chunkSize; ++x) {
            for(let z = this.z; z < this.z + global.chunkSize; ++z) {
                const island = Math.cos(Math.sqrt(Math.pow(x - (levelWidth >> 1), 2) + Math.pow(z - (levelDepth >> 1), 2)) / levelWidth * Math.PI)
                let height = Math.floor(noise.perlin2(x / 64, z / 64) * 8 + (levelHeight >> 1));
                height += Math.floor(island * 4);
                height += Math.floor(noise.perlin2(x / 48, z / 48) * 4);
                height += Math.floor(noise.perlin2(x / 32, z / 32)) * 4;
                height += Math.floor(noise.perlin2(x / 16, z / 16) * 2);
                
                for(let y = this.y; y < this.y + global.chunkSize; ++y) {
                    if(x >= levelWidth || z >= levelDepth || y >= levelHeight) {
                        this.tiles[i] = global.tile.void;
                    } else if(y >= height + 1) {
                        if(y > (levelHeight >> 1) - 1) {
                            this.tiles[i] = global.tile.void;
                        } else {
                            this.tiles[i] = water;
                        }
                        
                    } else if(y >= height) {
                        if(y > (levelHeight >> 1)) {
                            this.tiles[i] = grass;
                        } else {
                            if(this.tiles[i - 1] == global.tile.mud) {
                                this.tiles[i - 1] = global.tile.sand;
                            }
                            this.tiles[i] = sand;   
                        }

                    } else if(y >= height - 2) {
                        if (height > (levelHeight >> 1)) {
                            this.tiles[i] = global.tile.dirt;
                        } else {
                            this.tiles[i] = global.tile.mud;
                        }
                        
                    } else if(y >= height - 4 && Math.floor(Math.random() * 3) <= y - (height - 4)) {
                        if (height > (levelHeight >> 1)) {
                            this.tiles[i] = global.tile.dirt;
                        } else {
                            this.tiles[i] = global.tile.mud;
                        }
                        
                    } else if(y >= height - ((levelHeight >> 2) - 2)) {
                        this.tiles[i] = global.tile.stone;
                    } else if(y >= height - ((levelHeight >> 2) + 2) && Math.floor(Math.random() * 5) <= y - (height - ((levelHeight >> 2) + 2))) {
                        this.tiles[i] = global.tile.stone;
                    } else if(y >= ((levelHeight >> 4) + 2)) {
                        this.tiles[i] = global.tile.stoneDeep;
                    } else if(y >= ((levelHeight >> 4) - 2) && Math.floor(Math.random() * 5) <= y - ((levelHeight >> 4) - 2)) {
                        this.tiles[i] = global.tile.stoneDeep;
                    } else {
                        this.tiles[i] = global.tile.negeritre;
                    }
                    ++i;
                }
            }
        }
    }

    generateGeometry() {
        const geometry = new THREE.BufferGeometry();

        const positions = [];
        const indices = [];
        const indicesByTexture = [];
        const uvs = [];
        let indexOffset = 0;

        const faceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, // front
            1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, // back
            0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, // right
            0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0  // left
        ]);

        const faceUVs = new Float32Array([
            0, 0, 1, 0, 1, 1, 0, 1, // front, back, top, bottom, right, left
        ]);

        for (let i = 0; i <= global.assetCount; i++) {
            indicesByTexture.push([]);
        }

        let i = 0;
        for(let x = 0; x < global.chunkSize; ++x) {
            for(let z = 0; z < global.chunkSize; ++z) {
                for(let y = 0; y < global.chunkSize; ++y) {
                    let tileMaterials = global.tile.tiles[this.tiles[i]].tileMaterials;
                    let facesRendered = 0;
                    if(this.tiles[i] != 0) {
                        for (let f = 0; f < 6; ++f) {
                            const tile = global.tile.tiles[this.tiles[i]];
                            // OPTIMIZE CULLING
                            if(tile.culling) {
                                let nx = x;
                                let ny = y;
                                let nz = z;

                                switch(f) {
                                    case 0:
                                        nz = z + 1
                                        break;
                                    case 1:
                                        nz = z - 1
                                        break;
                                    case 2:
                                        ny = y + 1
                                        break;
                                    case 3:
                                        ny = y - 1
                                        break;
                                    case 4:
                                        nx = x + 1
                                        break;      
                                    case 5:
                                        nx = x - 1
                                        break;                             
                                }
                                
                                const neighbor = this.getTile(nx, ny, nz);
                                if(tile.opaque) {
                                    if (neighbor !== 0 && global.tile.tiles[neighbor].opaque) {
                                        continue;
                                    }
                                } else {
                                    if (neighbor !== 0 && global.tile.tiles[neighbor].opaque) {
                                        continue;
                                    }
                                    if (neighbor === this.tiles[i]) {
                                        continue;
                                    }
                                }
                            }

                            for (let j = f * 12; j < (f * 12) + 12; j += 3) {
                                positions.push(faceVertices[j] + this.x + x, faceVertices[j + 1] + this.y + y, faceVertices[j + 2] + this.z + z);
                            }

                            // OPTIMIZE THIS
                            for (let j = f << 3; j < (f << 3) + 8; ++j) {
                                uvs.push(faceUVs[j % 8]);
                            }

                            const offset = indexOffset + (facesRendered << 2);
                            indicesByTexture[tileMaterials[f]].push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
                            ++facesRendered;
                        }
                    }

                    indexOffset += facesRendered << 2; 
                    ++i;
                }
            }
        }

        let start = 0;
        for (let i = 0; i < indicesByTexture.length; i++) {
            const array = indicesByTexture[i];

            if (array.length === 0) continue;

            geometry.addGroup(start, array.length, i);
            indices.push(...array);

            start += array.length;
        }

        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        this.mesh = new THREE.Mesh(geometry, global.materials);
        global.scene.add(this.mesh);
    }

    updateGeometry() {
        if (this.mesh) {
            global.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh = null;
        }

        this.generateGeometry();
    }

    getTile(x, y, z) {
        if(x < 0 || y < 0 || z < 0 || x >= global.chunkSize || y >= global.chunkSize || z >= global.chunkSize) {
            return global.level.getTile(this.x + x, this.y + y, this.z + z);
        }

        return this.tiles[y + z * global.chunkSize + x * global.chunkSize * global.chunkSize];
    }
}
