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

	constructor(x, y, z) {
		super(x, y, z);
		this.sizeX = 0.75;
		this.sizeY = 1.75;
		this.sizeZ = 0.75;
	}

	#clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	#rayTrace(positionX, positionY, positionZ, directionX, directionY, directionZ, limit) {
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
			if(global.tile.tiles[global.level.getTile(floorX, floorY, floorZ)].opaque) {
				return [floorX, floorY, floorZ, previousX, previousY, previousZ];
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

	update() {
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
			const rayTrace = this.#rayTrace(this.positionX,
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
			const rayTrace = this.#rayTrace(this.positionX,
						   this.positionY - this.sizeY / 2 + this.cameraHeight,
						   this.positionZ,
						   -Math.sin(this.rotationY) * Math.cos(this.rotationX),
						   Math.sin(this.rotationX),
						   -Math.cos(this.rotationY) * Math.cos(this.rotationX),
						   this.reach
			);
			if(rayTrace != -1) {
				global.level.setTileWithUpdate(rayTrace[3], rayTrace[4], rayTrace[5], this.selectedTile);
			}
		}

		if (this.keys[" "]) {
			if(this.inWater) {
				this.velocityY += 0.01;
			} else if(this.velocityY == 0) {
				this.velocityY += 0.1;
			}
		}

		this.velocityX = this.#clamp(this.velocityX, -this.maxSpeed, this.maxSpeed);
		this.velocityY = this.#clamp(this.velocityY, -0.4, 0.4);
		this.velocityZ = this.#clamp(this.velocityZ, -this.maxSpeed, this.maxSpeed);

		this.velocityY -= 0.004;
		if(global.level.getTile(Math.floor(this.positionX), Math.floor(this.positionY - 1), Math.floor(this.positionZ)) == 0) {
			this.velocityX *= 0.6;
			this.velocityZ *= 0.6;
		} else {
			this.velocityX *= 0.5;
			this.velocityZ *= 0.5;
		}

		this.move(this.velocityX, this.velocityY, this.velocityZ);

		global.camera.position.x = this.positionX;
		global.camera.position.y = this.positionY - this.sizeY / 2 + this.cameraHeight;
		global.camera.position.z = this.positionZ;

		global.camera.rotation.x = this.rotationX;
		global.camera.rotation.y = this.rotationY;
	}

}
