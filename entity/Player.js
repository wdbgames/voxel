import { global } from "../main.js";
import { Entity } from "./Entity.js";
import { AABB } from "../AABB.js";

export class Player extends Entity {
    keys = [];
    mouseDX = 0;
    mouseDY = 0;
	cameraHeight = 1.5;
	speed = 0.05;
	maxSpeed = 0.1;

	constructor(x, y, z) {
		super(x, y, z);
		this.sizeX = 0.75;
		this.sizeY = 1.75;
		this.sizeZ = 0.75;
	}

	#clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	update() {
		if (this.keys["w"]) {
			this.velocityX += -Math.sin(this.rotationY) * this.speed;
			this.velocityZ += -Math.cos(this.rotationY) * this.speed;
		}

		if (this.keys["s"]) {
			this.velocityX += Math.sin(this.rotationY) * this.speed;
			this.velocityZ += Math.cos(this.rotationY) * this.speed;
		}

		if (this.keys["a"]) {
			this.velocityX += -Math.cos(this.rotationY) * this.speed;
			this.velocityZ += Math.sin(this.rotationY) * this.speed;
		}

		if (this.keys["d"]) {
			this.velocityX += Math.cos(this.rotationY) * this.speed;
			this.velocityZ += -Math.sin(this.rotationY) * this.speed;
		}

		if (this.keys["e"]) {
			global.level.setTileWithUpdate(Math.floor(this.positionX), Math.floor(this.positionY - 2.5), Math.floor(this.positionZ), 1);
		}

		if (this.keys[" "]) {
			if(this.inWater) {
				this.velocityY += 0.01;
			} else if(this.velocityY == 0) {
				this.velocityY += 0.1;
			}
		}

		this.velocityX = this.#clamp(this.velocityX, -this.maxSpeed, this.maxSpeed);
		this.velocityY = this.#clamp(this.velocityY, -this.maxSpeed * 4, this.maxSpeed * 4);
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
