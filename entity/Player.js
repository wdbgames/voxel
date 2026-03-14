import { global } from "../main.js";
import { Entity } from "./Entity.js";
import { AABB } from "../AABB.js";

export class Player extends Entity {
    keys = [];
	keysOnce = [];
	mouse = [];
	mouseOnce = [];
	cameraHeight = 1.5;
	selectedTile = 0;

	acceleration = 0.05;
	maxSpeed = 0.1;
	reach = 4;
	fly = false;

	constructor(x, y, z) {
		super(x, y, z);
		this.sizeX = 0.75;
		this.sizeY = 1.75;
		this.sizeZ = 0.75;
		this.noclip = false;
	}

	#clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	update(dt) {
		if (this.keys["w"]) {
			this.velocityX += -Math.sin(this.rotationY) * this.acceleration;
			this.velocityZ += -Math.cos(this.rotationY) * this.acceleration;
		}

		if (this.keys["s"]) {
			this.velocityX += Math.sin(this.rotationY) * this.acceleration;
			this.velocityZ += Math.cos(this.rotationY) * this.acceleration;
		}

		if (this.keys["a"]) {
			this.velocityX += -Math.cos(this.rotationY) * this.acceleration;
			this.velocityZ += Math.sin(this.rotationY) * this.acceleration;
		}

		if (this.keys["d"]) {
			this.velocityX += Math.cos(this.rotationY) * this.acceleration;
			this.velocityZ += -Math.sin(this.rotationY) * this.acceleration;
		}

		if(this.mouseOnce[0]) {
			this.mouseOnce[0] = false;
			this.click = false;
			const rayTrace = global.level.rayTraceTiles(this.positionX,
						this.positionY - this.sizeY / 2 + this.cameraHeight,
						this.positionZ,
						-Math.sin(this.rotationY) * Math.cos(this.rotationX),
						Math.sin(this.rotationX),
						-Math.cos(this.rotationY) * Math.cos(this.rotationX),
						this.reach
			);
			if(rayTrace != -1) {
				global.level.setTileWithUpdate(rayTrace[0], rayTrace[1], rayTrace[2], 0);
			}
		}

		if(this.mouseOnce[2]) {
			this.mouseOnce[2] = false;
			this.click = false;
			const rayTrace = global.level.rayTraceTiles(this.positionX,
						this.positionY - this.sizeY / 2 + this.cameraHeight,
						this.positionZ,
						-Math.sin(this.rotationY) * Math.cos(this.rotationX),
						Math.sin(this.rotationX),
						-Math.cos(this.rotationY) * Math.cos(this.rotationX),
						this.reach
			);
			if(rayTrace != -1) {
				const x = rayTrace[3];
				const y = rayTrace[4];
				const z = rayTrace[5];
				const tile = new AABB(x, y, z, x + 1, y + 1, z + 1);
				if(!tile.intersect(this.box)) {
					global.level.setTileWithUpdate(x, y, z, this.selectedTile);
				}
				
			}
		}

		if(this.fly) {
			if (this.keys["q"]) {
				this.velocityY -= this.acceleration;
			}

			if (this.keys["e"]) {
				this.velocityY += this.acceleration;
			}

			this.velocityX *= 0.6;
			this.velocityY *= 0.6;
			this.velocityZ *= 0.6;

			this.velocityY = this.#clamp(this.velocityY, -this.maxSpeed, this.maxSpeed);
		} else {
			// FIX STICK TO CEILINGS
			if (this.keys[" "]) {
				if(this.inViscous[global.tile.water] || this.inViscous[global.tile.lava]) {
					this.velocityY += 0.01;
				} else if(this.velocityY == 0) {
					this.velocityY += 0.1;
				}
			}

			this.velocityY -= 0.004;
			if(global.level.getTile(Math.floor(this.positionX), Math.floor(this.positionY - 1), Math.floor(this.positionZ)) == 0) {
				this.velocityX *= 0.6;
				this.velocityZ *= 0.6;
			} else {
				this.velocityX *= 0.5;
				this.velocityZ *= 0.5;
			}

			this.velocityY = this.#clamp(this.velocityY, -0.4, 0.4);
		}

		this.velocityX = this.#clamp(this.velocityX, -this.maxSpeed, this.maxSpeed);
		this.velocityZ = this.#clamp(this.velocityZ, -this.maxSpeed, this.maxSpeed);

		this.move(this.velocityX * dt, this.velocityY * dt, this.velocityZ * dt);

		global.camera.position.x = this.positionX;
		global.camera.position.y = this.positionY - this.sizeY / 2 + this.cameraHeight;
		global.camera.position.z = this.positionZ;

		global.camera.rotation.x = this.rotationX;
		global.camera.rotation.y = this.rotationY;
	}

}
