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
    time;
    tickQueue = [];
    type;
    theme;
    chunkSize;
    chunkUpdates;
    tileUpdates;

    constructor(width, height, depth, type, theme) {
        this.width = width;
        this.height = height;
        this.depth = depth; 
        this.type = type;
        this.theme = theme;
        this.chunkSize = 16;
        this.chunkWidth = Math.ceil(this.width / this.chunkSize);
        this.chunkHeight = Math.ceil(this.height / this.chunkSize);
        this.chunkDepth = Math.ceil(this.depth / this.chunkSize);
        this.widthCeil = this.chunkWidth * this.chunkSize;
        this.heightCeil = this.chunkHeight * this.chunkSize;
        this.depthCeil = this.chunkDepth * this.chunkSize; 
        this.chunks = new Array(this.chunkWidth * this.chunkHeight * this.chunkDepth);
        this.seed = Math.random();
        this.time = 6000;
        this.chunkUpdates = 0;
        this.tileUpdates = 0;
    }

    update() {
    }

    tick() {
        const cycleLength = 24000;

        let brightness;
        if(this.theme == 1) {
            brightness = 0;
        } else {
            brightness = Math.max(Math.min(Math.sin((this.time / cycleLength) * 2 * Math.PI), 0.8), 0);
        }

        const r = 0x87 / 255 * brightness;
        const g = 0xCE / 255 * brightness;
        const b = 0xEB / 255 * brightness;
        global.scene.background.setRGB(r, g, b);

        // global.renderer.ambientLight.intensity = (brightness + 0.08) * 2;

        ++this.time;
        if(this.time > cycleLength) {
            this.time = 0;
        }

        // ticking
        for(let i = this.tickQueue.length - 1; i >= 0; --i) {
            const tick = this.tickQueue[i];
            if (!tick) continue;
            --tick[3];
            if(tick[3] <= 0) {
                this.tickQueue.splice(i, 1);
                global.tile.tiles[this.getTile(tick[0], tick[1], tick[2])].tick(tick[0], tick[1], tick[2]);
            }
        }

        // LIGHT UPDATES
    }

    scheduleTick(x, y, z, delay) {
        this.tickQueue.push([x, y, z, delay]);
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

        // per chunk generation
        for(let x = 0; x < this.chunkWidth; ++x) {
            for(let z = 0; z < this.chunkDepth; ++z) {
                for(let y = 0; y < this.chunkHeight; ++y) {
                    this.chunks[x + this.chunkWidth * z + this.chunkWidth * this.chunkDepth * y] = new Chunk(x, y, z);
                }
            }
        }

        let grass = global.tile.grass;
        if(this.theme == 1) {
            grass = global.tile.dirt;
        }

        // house
        // FIX CUTOFF & TREES...
        if(this.width > 15 && this.height > 15 && this.depth > 15) {
            let stone = global.tile.stone;
            if(this.theme == 1) {
                stone = global.tile.stoneDeep;
            }

            const houseX =  Math.floor(this.width / 2 - 3);
            const houseZ =  Math.floor(this.depth / 2 - 3);

            let houseY = 0;
            if(global.level.type == 2) {
                houseY = Math.floor(this.height / 2);
            } else {
                let i = Math.floor(global.level.height / 2);
                while(this.getTile(houseX, i, houseZ) != 0) {
                    ++i;
                }
                houseY = i - 1;
            }
            
            this.spawnX = houseX + 3.5;
            this.spawnY = houseY + 3.5;
            this.spawnZ = houseZ + 3.5;

            for (let x = 0; x < 7; ++x) {
                for (let z = 0; z < 7; ++z) {
                    this.setTile(houseX + x, houseY, houseZ + z, stone);
                }
            }

            if(global.level.type != 2) {
                for (let x = 0; x < 7; ++x) {
                    for (let y = 0; y < 4; ++y) {
                        for (let z = 0; z < 7; ++z) {
                            this.setTile(houseX + x, houseY + 1 + y, houseZ + z, global.tile.wood);
                        }
                    }
                }

                for (let x = 0; x < 5; ++x) {
                    for (let y = 0; y < 3; ++y) {
                        for (let z = 0; z < 5; ++z) {
                            this.setTile(houseX + 1 + x, houseY + 1 + y, houseZ + 1 + z, global.tile.void);
                        }
                    }
                }
            }

            this.setTile(houseX + 3, houseY + 1, houseZ, global.tile.void);
            this.setTile(houseX + 3, houseY + 2, houseZ, global.tile.void);

            this.setTile(houseX + 2, houseY + 2, houseZ + 6, global.tile.glass);
            this.setTile(houseX + 3, houseY + 2, houseZ + 6, global.tile.glass);
            this.setTile(houseX + 4, houseY + 2, houseZ + 6, global.tile.glass);

            this.setTile(houseX, houseY + 2, houseZ + 2, global.tile.glass);
            this.setTile(houseX, houseY + 2, houseZ + 3, global.tile.glass);
            this.setTile(houseX, houseY + 2, houseZ + 4, global.tile.glass);

            this.setTile(houseX + 6, houseY + 2, houseZ + 2, global.tile.glass);
            this.setTile(houseX + 6, houseY + 2, houseZ + 3, global.tile.glass);
            this.setTile(houseX + 6, houseY + 2, houseZ + 4, global.tile.glass);
        } else {
            this.spawnX = this.width / 2;
            this.spawnZ = this.depth / 2;

            let i = 0;
            while(this.getTile(this.spawnX, i, this.spawnZ) != 0) {
                ++i;
            }

            this.spawnY = i + 3.5;
        }

        if(global.debug) {
            console.log("Blob amount: " + Math.floor(this.width * this.height * this.depth / 2048));
        }
        for(let i = 0; i < Math.floor(this.width * this.height * this.depth / 2048); ++i) {
            const x = Math.floor(random() * this.width);
            const y = Math.floor(random() * this.height);
            const z = Math.floor(random() * this.depth);
        }

        // trees
        // FIX CUTOFF
        if(global.level.type != 2) {
            if(global.debug) {
                console.log("Tree amount: " + Math.floor(this.width * this.depth / 128));
            }
            for(let amount = 0; amount < Math.floor(this.width * this.depth / 128); ++amount) {
                const x = Math.floor(random() * this.width);
                const z = Math.floor(random() * this.depth);
                let y = 0;
                while(this.getTile(x, y, z) != 0) {
                    ++y;
                }
                if(this.getTile(x, y - 1, z) == grass) {
                    let logCheck = false;
                    for(let i = x - 1; i <= x + 1; ++i) {
                        for(let j = z - 1; j <= z + 1; ++j) {
                            if(this.getTile(i, y, j) == global.tile.log) {
                                logCheck = true;
                            }
                        }
                    }
                    if(!logCheck) {
                        // this.setTile(x, y - 1, z, global.tile.roots);
                        this.setTile(x, y - 1, z, global.tile.dirt);
                        for(let i = x - 1; i <= x + 1; ++i) {
                            for(let j = z - 1; j <= z + 1; ++j) {
                                for(let k = y + 3; k <= y + 5; ++k) {
                                    this.setTile(i, k , j, global.tile.leaves);
                                }
                            }
                        }
                        for(let i = y; i < y + 5; ++i) {
                            this.setTile(x, i, z, global.tile.log);
                        }
                    }
                }
            }
        }
        
        // SKYLIGHT

        // geometry
        for(let i = 0; i < this.chunks.length; ++i) {
            this.chunks[i].generateGeometry();
        }

        if(global.debug) {
            const size = this.width * this.height * this.depth * 4;
            console.log(this.width + ", " + this.height + ", " + this.depth);
            console.log(Math.round(size) + " bytes");
            console.log(Math.round(size / 1000) + " kilobytes");
            console.log(Math.round(size / 1000000) + " megabytes");
        }
    }

    getTile(x, y, z) {
        // side void wall
        if (x < 0 || x >= this.width || z < 0 || z >= this.depth) {
            return global.tile.voidWall;
            
        }

        // so bottom faces render
        if(y < 0 || y >= this.height) {
            return global.tile.void;
        }

        const chunk = this.chunks[Math.floor(x / this.chunkSize) + this.chunkWidth * Math.floor(z / this.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / this.chunkSize)];
        return chunk.tiles[(y % this.chunkSize) + ((z % this.chunkSize) * this.chunkSize) + ((x % this.chunkSize) * this.chunkSize * this.chunkSize)];
    }

    setTile(x, y, z, tileId) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return -1;
        }

        const chunk = this.chunks[Math.floor(x / this.chunkSize) + this.chunkWidth * Math.floor(z / this.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / this.chunkSize)];
        chunk.tiles[(y % this.chunkSize) + ((z % this.chunkSize) * this.chunkSize) + ((x % this.chunkSize) * this.chunkSize * this.chunkSize)] = tileId;
    }

    setTileWithoutUpdate(x, y, z, tileId) {
        // check bounds
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return -1;
        }

        // find chunk
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const chunkY = Math.floor(y / this.chunkSize);
        const chunk = this.chunks[chunkX + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * chunkY];
        
        // find tile
        const tileX = x % this.chunkSize;
        const tileY = y % this.chunkSize;
        const tileZ = z % this.chunkSize;
        const tileIndex = tileY + (tileZ * this.chunkSize) + (tileX * this.chunkSize * this.chunkSize);
        
        // update tile
        const previousTile = chunk.tiles[tileIndex];
        chunk.tiles[tileIndex] = tileId;
        global.tile.tiles[previousTile].removed(x, y, z);
        global.tile.tiles[tileId].added(x, y, z);

        // update chunk
        chunk.needsUpdate = true;
        
        // update neighbor chunks
        if(tileX == 0 && x != 0) {
            this.chunks[(chunkX - 1) + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
        if(tileX == 15 && x != this.width - 1) {
            this.chunks[(chunkX + 1) + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
        if(tileY == 0 && y != 0) {
            this.chunks[chunkX + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * (chunkY - 1)].needsUpdate = true;;
        }
        if(tileY == 15 && y != this.height - 1) {
            this.chunks[chunkX + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * (chunkY + 1)].needsUpdate = true;;
        }
        if(tileZ == 0 && z != 0) {
            this.chunks[chunkX + this.chunkWidth * (chunkZ - 1) + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
        if(tileZ == 15 && z != this.depth - 1) {
            this.chunks[chunkX + this.chunkWidth * (chunkZ + 1) + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
    }

    setTileWithUpdate(x, y, z, tileId) {
        // check bounds
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return -1;
        }

        // find chunk
        const chunkX = Math.floor(x / this.chunkSize);
        const chunkZ = Math.floor(z / this.chunkSize);
        const chunkY = Math.floor(y / this.chunkSize);
        const chunk = this.chunks[chunkX + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * chunkY];
        
        // find tile
        const tileX = x % this.chunkSize;
        const tileY = y % this.chunkSize;
        const tileZ = z % this.chunkSize;
        const tileIndex = tileY + (tileZ * this.chunkSize) + (tileX * this.chunkSize * this.chunkSize);
        
        // update tile
        const previousTile = chunk.tiles[tileIndex];
        chunk.tiles[tileIndex] = tileId;
        global.tile.tiles[previousTile].removed(x, y, z);
        global.tile.tiles[tileId].added(x, y, z);

        // update neighbor tiles
        this.updateTile(x - 1, y, z);
        this.updateTile(x + 1, y, z);
        this.updateTile(x, y - 1, z);
        this.updateTile(x, y + 1, z);
        this.updateTile(x, y, z - 1);
        this.updateTile(x, y, z + 1);

        // update chunk
        chunk.needsUpdate = true;
        
        // update neighbor chunks
        if(tileX == 0 && x != 0) {
            this.chunks[(chunkX - 1) + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
        if(tileX == 15 && x != this.width - 1) {
            this.chunks[(chunkX + 1) + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
        if(tileY == 0 && y != 0) {
            this.chunks[chunkX + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * (chunkY - 1)].needsUpdate = true;;
        }
        if(tileY == 15 && y != this.height - 1) {
            this.chunks[chunkX + this.chunkWidth * chunkZ + this.chunkWidth * this.chunkDepth * (chunkY + 1)].needsUpdate = true;;
        }
        if(tileZ == 0 && z != 0) {
            this.chunks[chunkX + this.chunkWidth * (chunkZ - 1) + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
        if(tileZ == 15 && z != this.depth - 1) {
            this.chunks[chunkX + this.chunkWidth * (chunkZ + 1) + this.chunkWidth * this.chunkDepth * chunkY].needsUpdate = true;;
        }
    }

    updateTile(x, y, z) {
        global.tile.tiles[this.getTile(x, y, z)].update(x, y, z);
    }

    getTileData(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return 0;  
        }

        const chunk = this.chunks[Math.floor(x / this.chunkSize) + this.chunkWidth * Math.floor(z / this.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / this.chunkSize)];
        return chunk.tileData[(y % this.chunkSize) + ((z % this.chunkSize) * this.chunkSize) + ((x % this.chunkSize) * this.chunkSize * this.chunkSize)];
    }

    setTileData(x, y, z, data) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return -1;
        }

        const chunk = this.chunks[Math.floor(x / this.chunkSize) + this.chunkWidth * Math.floor(z / this.chunkSize) + this.chunkWidth * this.chunkDepth * Math.floor(y / this.chunkSize)];
        chunk.tileData[(y % this.chunkSize) + ((z % this.chunkSize) * this.chunkSize) + ((x % this.chunkSize) * this.chunkSize * this.chunkSize)] = data;
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

        y0 = Math.max(0, y0);
        y1 = Math.min(this.height, y1);

        for (let x = x0; x < x1; ++x) {
            for (let y = y0; y < y1; ++y) {
                for (let z = z0; z < z1; ++z) {
                    const tile = this.getTile(x, y, z);
                    if(global.tile.tiles[tile].hasCustomBoundingBox) {
                        const bb = global.tile.tiles[tile].customBoundingBox;
                        AABBs.push(new AABB(x + bb[0], y + bb[1], z + bb[2], x + bb[3], y + bb[4], z + bb[5]));
                    } else {
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

    // UPDATE FOR CUSTOM BOUNDS
	rayTraceTiles(positionX, positionY, positionZ, directionX, directionY, directionZ, limit) {
		let floorX = Math.floor(positionX);
		let floorY = Math.floor(positionY);
		let floorZ = Math.floor(positionZ);

		let previousX = floorX;
		let previousY = floorY;
		let previousZ = floorZ;

		const stepX = Math.sign(directionX);
		const stepY = Math.sign(directionY);
		const stepZ = Math.sign(directionZ);

		const tDeltaX = Math.abs(1 / directionX);
		const tDeltaY = Math.abs(1 / directionY);
		const tDeltaZ = Math.abs(1 / directionZ);

		let tMaxX;
		if(stepX > 0) {
			tMaxX = (floorX + 1 - positionX) * tDeltaX;
		} else {
			tMaxX = (positionX - floorX) * tDeltaX
		}

		let tMaxY;
		if(stepY > 0) {
			tMaxY = (floorY + 1 - positionY) * tDeltaY;
		} else {
			tMaxY = (positionY - floorY) * tDeltaY;
		}
	
		let tMaxZ;
		if(stepZ > 0) {
			tMaxZ = (floorZ + 1 - positionZ) * tDeltaZ;
		} else {
			tMaxZ = (positionZ - floorZ) * tDeltaZ;
		}

		for(let i = 0; i < limit * 3; ++i) {
            const tileId = global.level.getTile(floorX, floorY, floorZ);
            const tile = global.tile.tiles[tileId];

            if (tile.breakable) {
                const bb = tile.hasCustomBoundingBox ? tile.customBoundingBox : [0, 0, 0, 1, 1, 1];
                
                const minX = floorX + bb[0];
                const minY = floorY + bb[1];
                const minZ = floorZ + bb[2];
                const maxX = floorX + bb[3];
                const maxY = floorY + bb[4];
                const maxZ = floorZ + bb[5];

                // REVIEW
                const tx1 = (minX - positionX) / directionX;
                const tx2 = (maxX - positionX) / directionX;
                let tmin = Math.min(tx1, tx2);
                let tmax = Math.max(tx1, tx2);

                const ty1 = (minY - positionY) / directionY;
                const ty2 = (maxY - positionY) / directionY;
                tmin = Math.max(tmin, Math.min(ty1, ty2));
                tmax = Math.min(tmax, Math.max(ty1, ty2));

                const tz1 = (minZ - positionZ) / directionZ;
                const tz2 = (maxZ - positionZ) / directionZ;
                tmin = Math.max(tmin, Math.min(tz1, tz2));
                tmax = Math.min(tmax, Math.max(tz1, tz2));

                if(tmax >= tmin && tmax > 0) {
                    return [floorX, floorY, floorZ, previousX, previousY, previousZ]
                }
            }

			previousX = floorX;
			previousY = floorY;
			previousZ = floorZ;

			if(tMaxX < tMaxY) {
				if (tMaxX < tMaxZ) {
					floorX += stepX;
					tMaxX += tDeltaX;
				} else {
					floorZ += stepZ;
					tMaxZ += tDeltaZ;
				}
			} else {
				if (tMaxY < tMaxZ) {
					floorY += stepY;
					tMaxY += tDeltaY;
				} else {
					floorZ += stepZ;
					tMaxZ += tDeltaZ;
				}
			}
		}
		return -1;
	}

    playSound(x, y, z, audio) {
       const distanceX = Math.pow(Math.abs(global.player.positionX - x), 2);
       const distanceY = Math.pow(Math.abs(global.player.positionY - y), 2);
       const distanceZ = Math.pow(Math.abs(global.player.positionZ - z), 2);
       const distance = Math.sqrt(distanceX + distanceY + distanceZ);
       
       const sound = global.audio[audio].cloneNode();
       sound.volume = Math.max(1 / (distance + 1), 0);
       sound.play();
    }
}
