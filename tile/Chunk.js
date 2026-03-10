import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { global } from "../main.js";

export class Chunk {
    x;
    y;
    z;
    tiles;

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
        // console.log("Generated new chunk at: " + this.chunkX + ", " + this.chunkY + ", " + this.chunkZ);
        let i = 0;
        for(let x = this.x; x < this.x + global.chunkSize; ++x) {
            for(let y = this.y; y < this.y + global.chunkSize; ++y) {
                for(let z = this.z; z < this.z + global.chunkSize; ++z) {
                    if(y > 32) {
                        this.tiles[i] = global.tile.void;
                    } else if(y > 31) {
                        this.tiles[i] = global.tile.grass;
                    } else if(y > 28) {
                        this.tiles[i] = global.tile.dirt;
                    } else {
                        this.tiles[i] = global.tile.stone;
                    }
                    // this.tiles[i] = Math.floor(Math.random() * 4);
                    ++i;
                }
            }
        }
    }

    generateGeometry() {
        const geometry = new THREE.BufferGeometry();

        const positions = [];
        const indices = [];
        const uvs = [];
        let indexOffset = 0;
        let groupStart = 0;

        const materials = [
            global.materials[0],
            global.materials[1],
            global.materials[2],
            global.materials[3],
            global.materials[0],
            global.materials[1],
            global.materials[2],
            global.materials[3]
        ];

        const faceVertices = new Float32Array([
            0,0,1,  1,0,1,  1,1,1,  0,1,1, // front
            1,0,0,  0,0,0,  0,1,0,  1,1,0, // back
            0,1,1,  1,1,1,  1,1,0,  0,1,0, // top
            0,0,0,  1,0,0,  1,0,1,  0,0,1, // bottom
            1,0,1,  1,0,0,  1,1,0,  1,1,1, // right
            0,0,0,  0,0,1,  0,1,1,  0,1,0  // left
        ]);

        const faceUvs = new Float32Array([
            0,0, 1,0, 1,1, 0,1, // front
            0,0, 1,0, 1,1, 0,1, // back
            0,0, 1,0, 1,1, 0,1, // top
            0,0, 1,0, 1,1, 0,1, // bottom
            0,0, 1,0, 1,1, 0,1, // right
            0,0, 1,0, 1,1, 0,1  // left
        ]);

        let i = 0;
        for(let x = 0; x < global.chunkSize; ++x) {
            for(let y = 0; y < global.chunkSize; ++y) {
                for(let z = 0; z < global.chunkSize; ++z) {
                    let facesRendered = 0;
                    if(this.tiles[i] != 0) {
                        for (let f = 0; f < 6; ++f) {
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

                            if (this.getTile(nx, ny, nz) !== 0) {
                                continue; 
                            }

                            for (let i = f * 12; i < (f * 12) + 12; i += 3) {
                                positions.push(faceVertices[i] + this.x + x, faceVertices[i + 1] + this.y + y, faceVertices[i + 2] + this.z + z);
                            }

                            for (let i = f << 3; i < (f << 3) + 8; ++i) {
                                uvs.push(faceUvs[i]);
                            }

                            const offset = indexOffset + (facesRendered << 2);
                            indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
                            
                            ++facesRendered;
                        }
                    }


                    if (facesRendered > 0) {
                        geometry.addGroup(groupStart, facesRendered * 6, global.tile.tiles[this.tiles[i]].tileIndex);
                        groupStart += facesRendered * 6;
                        indexOffset += facesRendered << 2; 
                    }
                    ++i;
                }
            }
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
        if (x < 0 || x >= global.chunkSize || y < 0 || y >= global.chunkSize || z < 0 || z >= global.chunkSize) {
            return global.level.getTile(this.x + x, this.y + y, this.z + z);
        }

        return this.tiles[z + (y * global.chunkSize) + (x * global.chunkSize * global.chunkSize)]
    }
}
