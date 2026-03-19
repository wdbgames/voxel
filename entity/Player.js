import { global } from "../main.js";
import { Entity } from "./Entity.js";
import { AABB } from "../AABB.js";

export class Player extends Entity {
    keys = [];
	keysOnce = [];
	mouse = [];
	mouseOnce = [];
	cameraHeight = 1.5;

	inventory = [0, 1, 2, 3, 4];
	selectedTile = 0;

	jumpCooldown = 0;
	sensitivity = 0.004;
	acceleration = 0.05;
	maxSpeed = 0.1;
	reach = 4;
	fly = false;
	stepHeight = 0.5;

	constructor(x, y, z) {
		super(x, y, z);
		// console.log("Spawned player at: " + x + ", " + y + ", " + z);
		this.sizeX = 0.75;
		this.sizeY = 1.75;
		this.sizeZ = 0.75;
		this.noclip = false;
	}

	#clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	update(dt) {
		if(this.keys["f"]) {
			// debug
			if(this.keysOnce["1"]) {
				this.keysOnce["1"] = false;
				global.debug = !global.debug;
				global.debugUpdate = true;
			}

			// fly
			if(this.keysOnce["2"]) {
				this.keysOnce["2"] = false;
				this.fly = !this.fly;
			}

			// noclip
			if(this.keysOnce["3"]) {
				this.keysOnce["3"] = false;
				this.noclip = !this.noclip;
			}
		}

		if(this.keysOnce["ArrowLeft"]) {
			this.keysOnce["ArrowLeft"] = false;
			this.updateSelectedTile(-1);
		}

		if(this.keysOnce["ArrowRight"]) {
			this.keysOnce["ArrowRight"] = false;
			this.updateSelectedTile(1);
		}

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
				const x = rayTrace[0];
				const y = rayTrace[1];
				const z = rayTrace[2];
				global.level.playSound(x, y, z, global.tile.tiles[global.level.getTile(x, y, z)].audio);
				global.level.setTileWithUpdate(x, y, z, 0);
			}
		}

		if(this.mouseOnce[1]) {
			this.mouseOnce[1] = false;
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
				console.log(global.level.getTile(rayTrace[0], rayTrace[1], rayTrace[2]));
				this.selectedTile = global.level.getTile(rayTrace[0], rayTrace[1], rayTrace[2]);
				global.renderer.updateUITile();
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
				if(this.selectedTile == global.tile.void) {
					global.tile.tiles[global.level.getTile(rayTrace[0], rayTrace[1], rayTrace[2])].interact(rayTrace[0], rayTrace[1], rayTrace[2]);
				} else {
					const x = rayTrace[3];
					const y = rayTrace[4];
					const z = rayTrace[5];
					const bb = global.tile.tiles[this.selectedTile].hasCustomBoundingBox ? global.tile.tiles[this.selectedTile].customBoundingBox : [0, 0, 0, 1, 1, 1];
					const tileAABB = new AABB(x + bb[0], y + bb[1], z + bb[2], x + bb[3], y + bb[4], z + bb[5]);
					if(this.noclip || !tileAABB.intersect(this.box)) {
						global.level.setTileWithUpdate(x, y, z, this.selectedTile);
						global.level.playSound(x, y, z, global.tile.tiles[this.selectedTile].audio);
					}
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
			if(this.jumpCooldown > 0) {
				this.jumpCooldown -= dt;
			}

			// MAKE PROPERTY IN TILE
			if (this.keys[" "]) {
				if((this.inViscous[global.tile.water] || this.inViscous[global.tile.lava])) {
					if(this.jumpCooldown <= 0) {
						this.velocityY += 0.01;
					}	
				} else if(this.onGround) {
					this.velocityY += 0.1;
				} else {
					this.jumpCooldown = 4;
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

	updateRotation(movementX, movementY) {
		this.rotationY -= movementX * this.sensitivity * (global.DT.delta / 14);
		this.rotationX -= movementY * this.sensitivity * (global.DT.delta / 14);
	}

	updateSelectedTile(x) {
		this.selectedTile += x;

		if(this.selectedTile < 0) {
			this.selectedTile = global.tile.tileAmount - 1;
		}

		if(this.selectedTile > global.tile.tileAmount - 1) {
			this.selectedTile = 0;
		}

		global.renderer.updateUITile();
	}
}
