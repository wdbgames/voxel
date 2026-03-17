import { global } from "../main.js";
import { AABB } from "../AABB.js";

export class Entity {
    positionX;
    positionY;
    positionZ;
    velocityX = 0;
    velocityY = 0;
    velocityZ = 0;
    rotationX = 0;
    rotationY = 0;
    sizeX = 0.5;
    sizeY = 0.5;
    sizeZ = 0.5;
    inViscous = [];
    box = new AABB(0, 0, 0, 0, 0, 0); // RENAME TO AABB
    noclip = true;
    onGround = true;

    constructor(x, y, z) {
        this.positionX = x;
        this.positionY = y;
        this.positionZ = z;
        this.updateBox();
    }

    update() {
    }

    render() {
    }

    updateBox() {
        this.box.x0 = this.positionX - this.sizeX / 2;
        this.box.y0 = this.positionY - this.sizeY / 2;
        this.box.z0 = this.positionZ - this.sizeZ / 2;

        this.box.x1 = this.positionX + this.sizeX / 2;
        this.box.y1 = this.positionY + this.sizeY / 2;
        this.box.z1 = this.positionZ + this.sizeZ / 2;
    }

    #handleViscous(tiles, AABBs, tile) {
        this.inViscous[tile] = false;
        for (let i = 0; i < tiles.length; ++i) {
            if (tiles[i] == tile && AABBs[i].intersect(this.box)) {
                this.inViscous[tile] = true;
                break;
            }
        }

        if(this.inViscous[tile]) {
            const viscosity = global.tile.tiles[tile].viscosity;
            this.velocityX *= viscosity;
            this.velocityY *= viscosity;
            this.velocityZ *= viscosity;
        }
    }

    // IMPLEMENT BETTER CACHING (viscosity AND AABBs.length)
    move(x, y, z) {
        if(this.noclip) {
            this.positionX += x;
            this.positionY += y;
            this.positionZ += z;
        } else {
            let xa = x;
            let ya = y;
            let za = z;

            const tilesAABBs = global.level.getTileAABBs(this.box.expand(x, y, z));
            const tiles = tilesAABBs[0];
            const AABBs = tilesAABBs[1];

            for (let i = 0; i < AABBs.length; ++i) {
                if(global.tile.tiles[tiles[i]].viscosity == 1) {
                    xa = this.box.clipXCollide(AABBs[i], xa);
                }
            }

            this.positionX += xa;
            this.box.move(xa, 0, 0);

            for (let i = 0; i < AABBs.length; ++i) {
                if(global.tile.tiles[tiles[i]].viscosity == 1) {
                    ya = this.box.clipYCollide(AABBs[i], ya);
                }
            }

            this.onGround = y < 0 && ya !== y;

            this.positionY += ya;
            this.box.move(0, ya, 0);

            for (let i = 0; i < AABBs.length; ++i) {
                if(global.tile.tiles[tiles[i]].viscosity == 1) {
                    za = this.box.clipZCollide(AABBs[i], za);
                }
            }

            this.positionZ += za;
            this.box.move(0, 0, za);

            // COMBINE TO ARRAY, REMOVE HELPER FUNCTION
            this.#handleViscous(tiles, AABBs, global.tile.water);
            this.#handleViscous(tiles, AABBs, global.tile.lava);
            this.#handleViscous(tiles, AABBs, global.tile.leaves);
        
            if(xa != x) {
                this.velocityX = 0;
            }

            if(ya != y) {
                this.velocityY = 0;
            }

            if(za != z) {
                this.velocityZ = 0;
            }
        }

        this.updateBox();
    }
}
