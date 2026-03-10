import { global } from "../main.js";
import { Entity } from "./Entity.js";

export class Player extends Entity {
    keys = [];
    mouseDX = 0;
    mouseDY = 0;
	speed = 0.1;

	constructor(x, y, z) {
		super(x, y, z);
	}

	update() {
		const speed = this.speed;
		if (this.keys["w"]) {
			this.positionX -= Math.sin(this.rotationY) * speed;
			this.positionZ -= Math.cos(this.rotationY) * speed;
		}

		if (this.keys["s"]) {
			this.positionX += Math.sin(this.rotationY) * speed;
			this.positionZ += Math.cos(this.rotationY) * speed;
		}

		if (this.keys["a"]) {
			this.positionX -= Math.cos(this.rotationY) * speed;
			this.positionZ += Math.sin(this.rotationY) * speed;
		}

		if (this.keys["d"]) {
			this.positionX += Math.cos(this.rotationY) * speed;
			this.positionZ -= Math.sin(this.rotationY) * speed;
		}

		if (this.keys["q"]) {
			this.positionY -= 1 * speed;
		}

		if (this.keys["e"]) {
			this.positionY += 1 * speed;
		}

		global.camera.position.x = this.positionX;
		global.camera.position.y = this.positionY;
		global.camera.position.z = this.positionZ;

		global.camera.rotation.x = this.rotationX;
		global.camera.rotation.y = this.rotationY;
	}

}
