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

    #handleViscous(tiles, tile) {
        if(tiles.includes(tile)) {
            this.inViscous[tile] = true;
            const viscosity = global.tile.tiles[tile].viscosity;
            this.velocityX *= viscosity;
            this.velocityY *= viscosity;
            this.velocityZ *= viscosity;
        } else {
            this.inViscous[tile] = false;
        }
    }

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

            for (let i = 0; i < tilesAABBs[1].length; ++i) {
                xa = this.box.clipXCollide(tilesAABBs[1][i], xa);
            }

            this.positionX += xa;
            this.box.move(xa, 0, 0);

            for (let i = 0; i < tilesAABBs[1].length; ++i) {
                ya = this.box.clipYCollide(tilesAABBs[1][i], ya);
            }

            this.positionY += ya;
            this.box.move(0, ya, 0);

            for (let i = 0; i < tilesAABBs[1].length; ++i) {
                za = this.box.clipZCollide(tilesAABBs[1][i], za);
            }

            this.positionZ += za;
            this.box.move(0, 0, za);

            // MAKE EASIER, and improve bounds
            this.#handleViscous(tilesAABBs[0], global.tile.water);
            this.#handleViscous(tilesAABBs[0], global.tile.leaves);
            this.#handleViscous(tilesAABBs[0], global.tile.lava);
        
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
