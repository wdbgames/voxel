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
    inWater = false;
    inLeaves = false;
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
            if(tilesAABBs[0].includes(global.tile.water)) {
                this.inWater = true;
                const viscosity = global.tile.tiles[global.tile.water].viscosity;
                this.velocityX *= viscosity;
                this.velocityY *= viscosity;
                this.velocityZ *= viscosity;
            } else {
                this.inWater = false;
            }

            if(tilesAABBs[0].includes(global.tile.leaves)) {
                this.inLeaves = true;
                const viscosity = global.tile.tiles[global.tile.leaves].viscosity;
                this.velocityX *= viscosity;
                this.velocityY *= viscosity;
                this.velocityZ *= viscosity;
            } else {
                this.inLeaves = false;
            }   
        
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
