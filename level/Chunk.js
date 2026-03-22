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
    tileData;
    tileLight;
    tileSkylight;
    mesh;
    needsUpdate;

    constructor(x, y, z) {
        this.x = x * global.level.chunkSize;
        this.y = y * global.level.chunkSize;
        this.z = z * global.level.chunkSize;
        this.chunkX = x;
        this.chunkY = y;
        this.chunkZ = z;
        this.tiles = new Uint8Array(global.level.chunkSize * global.level.chunkSize * global.level.chunkSize);
        this.tileData = new Uint8Array(global.level.chunkSize * global.level.chunkSize * global.level.chunkSize);
        this.tileLight = new Uint8Array(global.level.chunkSize * global.level.chunkSize * global.level.chunkSize);
        this.tileSkylight = new Uint8Array(global.level.chunkSize * global.level.chunkSize * global.level.chunkSize);
        this.mesh = null;
        this.needsUpdate = false;
        this.generate();
    }

    generate() {
        noise.seed(global.level.seed);
        
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
        if(global.level.type == 3) {
            water = global.tile.void;
        }
    
        let i = 0;
        for(let x = this.x; x < this.x + global.level.chunkSize; ++x) {
            for(let z = this.z; z < this.z + global.level.chunkSize; ++z) {
                    for(let y = this.y; y < this.y + global.level.chunkSize; ++y) {
                        this.tileData[i] = 0;
                        ++i;
                    }
            }
        }

        // ADD LAYERS (MAYBE)

        /*
        const layerAmount = 8;
        const layersX = [];
        const layersZ = [];
        for(i = 0; i < layerAmount; ++i) {
            layersX[i] = levelWidth * i;
            layersZ[i] = levelDepth * i;
        }
        */

        if(global.level.type == 2) { 
           i = 0;
            for(let x = this.x; x < this.x + global.level.chunkSize; ++x) {
                for(let z = this.z; z < this.z + global.level.chunkSize; ++z) {
                        for(let y = this.y; y < this.y + global.level.chunkSize; ++y) {
                            this.tiles[i] = global.tile.void;
                            ++i;
                        }
                }
            }
        } else {
            i = 0;
            // BITSHIFT
            for(let x = this.x; x < this.x + global.level.chunkSize; ++x) {
                for(let z = this.z; z < this.z + global.level.chunkSize; ++z) {
                    const offsetX = x + global.level.width;
                    const offsetZ = z + global.level.depth;

                    const beachNoise = Math.floor(noise.perlin2(x / 16, z / 16) * 2);

                    let height = levelHeight >> 1;
                    let minHeight = 0;
                    if(global.level.type == 1) {
                        height += noise.perlin2(offsetX / 48, offsetZ / 48);
                    } else {
                        const island = Math.cos(Math.sqrt(Math.pow(x - (levelWidth >> 1), 2) + Math.pow(z - (levelDepth >> 1), 2)) / levelWidth * Math.PI)
                        height += Math.floor(island * 4);
                        height += Math.floor(noise.perlin2(x / 64, z / 64) * 10);
                        height += Math.floor(noise.perlin2(offsetX / 48, offsetZ / 48) * 6);
                        height += Math.floor(noise.perlin2(x / 32, z / 32)) * 6;
                        height += Math.floor(noise.perlin2(offsetX / 16, offsetZ / 16) * 4);
                    }

                    if(global.level.type == 3) {
                        let cutoff = Math.floor(Math.abs(noise.perlin2(x / 64, z / 64)) * levelHeight);
                        cutoff += Math.floor(noise.perlin2(offsetX / 32, offsetZ / 32) * (levelHeight / 2));

                        minHeight = cutoff;
                        if(cutoff > 16) {
                            minHeight = levelHeight;
                        }
                    }
                    
                    for(let y = this.y; y < this.y + global.level.chunkSize; ++y) {
                        if(x >= levelWidth || z >= levelDepth || y >= levelHeight || y < minHeight || height == 0) {
                            this.tiles[i] = global.tile.void;
                        } else if(y >= height + 1) {
                            if(y >= levelHeight >> 1) {
                                this.tiles[i] = global.tile.void;
                            } else {
                                this.tiles[i] = water;
                            }
                            
                        } else if(y >= height) {
                            if(y > (levelHeight >> 1)) {
                                this.tiles[i] = grass;
                            } else {
                                if(beachNoise == 0 && y >= (levelHeight >> 1) - 1) {
                                    this.tiles[i] = global.tile.rock;   
                                } else {
                                    this.tiles[i] = sand; 
                                }
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
                            this.tiles[i] = global.tile.stoneDeepDeep;
                        }
                        ++i;
                    }
                }
            }
        }
    }

    generateGeometry() {
        ++global.level.chunkUpdates;

        const geometry = new THREE.BufferGeometry();

        const positions = [];
        const indices = [];
        const indicesByTexture = [];
        const uvs = [];
        const colors = [];
        let indexOffset = 0;

        const defaultFaceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, // front
            1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, // back
            0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, // right
            0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0  // left
        ]);

        const defaultFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 1, 0, 1, // front
            0, 0, 1, 0, 1, 1, 0, 1, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 1, 0, 1, // right
            0, 0, 1, 0, 1, 1, 0, 1, // left
        ]);

        for (let i = 0; i <= global.materialCount; i++) {
            indicesByTexture.push([]);
        }

        // UPDATE FOR DATA BASED MATERIAL
        let i = 0;
        for(let x = 0; x < global.level.chunkSize; ++x) {
            for(let z = 0; z < global.level.chunkSize; ++z) {
                for(let y = 0; y < global.level.chunkSize; ++y) {
                    // ex. getMaterials()
                    let tileMaterials = global.tile.tiles[this.tiles[i]].tileMaterials;
                    let facesRendered = 0;
                    const tile = global.tile.tiles[this.tiles[i]];
                    const faceVertices = tile.hasCustomFaceVertices ? tile.customFaceVertices : defaultFaceVertices;
                    const faceUVs = tile.hasCustomFaceUVs ? tile.customFaceUVs : defaultFaceUVs;
                    if(this.tiles[i] != global.tile.void && this.tiles[i] != global.tile.voidWall) {
                        for (let f = 0; f < 6; ++f) {
                            for(let j = 0; j < 3; ++j) {
                                colors.push(1, 1, 1);
                            }

                            if(tile.culling) {
                                let neighborX = x;
                                let neighborY = y;
                                let neighborZ = z;

                                switch(f) {
                                    case 0:
                                        neighborZ = z + 1
                                        break;
                                    case 1:
                                        neighborZ = z - 1
                                        break;
                                    case 2:
                                        neighborY = y + 1
                                        break;
                                    case 3:
                                        neighborY = y - 1
                                        break;
                                    case 4:
                                        neighborX = x + 1
                                        break;      
                                    case 5:
                                        neighborX = x - 1
                                        break;                             
                                }
                                
                                const neighbor = this.getTile(neighborX, neighborY, neighborZ);
                                if(tile.opaque) {
                                    if (neighbor !== global.tile.void && global.tile.tiles[neighbor].opaque) {
                                        continue;
                                    }
                                } else {
                                    if (neighbor !== global.tile.void && global.tile.tiles[neighbor].opaque) {
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

                            
                            for (let j = f << 3; j < (f << 3) + 8; ++j) {
                                uvs.push(faceUVs[j]);
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

            if(array.length === 0) {
                continue;
            }

            geometry.addGroup(start, array.length, i);
            indices.push(...array);

            start += array.length;
        }

        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        this.mesh = new THREE.Mesh(geometry, global.materials);
        global.renderer.scene.add(this.mesh);
    }

    updateGeometry() {
        if (this.mesh) {
            global.renderer.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh = null;
        }

        this.generateGeometry();
    }

    getTile(x, y, z) {
        if(x < 0 || y < 0 || z < 0 || x >= global.level.chunkSize || y >= global.level.chunkSize || z >= global.level.chunkSize) {
            return global.level.getTile(this.x + x, this.y + y, this.z + z);
        }

        return this.tiles[y + z * global.level.chunkSize + x * global.level.chunkSize * global.level.chunkSize];
    }
}
