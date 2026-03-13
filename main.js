import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { Player } from "./entity/Player.js";
import { Level } from "./Level.js";
import { Tile } from "./level/Tile.js";
import { Renderer } from "./Renderer.js";

// TODO:
// ticking
// time
// entities
// make crosshair a CUBE
// debug
// camera limits
// aabb fixes
// water visuals
// blocks in entities
// sand and water void
// dirt, metal, grass side textures  

export const global = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),

	renderer: null,
	player: null,
	level: null,
	tile: null,

	materials: [],
	assetCount: 16,
	chunkSize: 16, // move to level?
	DEBUG: false,

	tick: {
		tickRate: 1000 / 16,
		tickAccumulator: 0
	},

	UI: {
		scene: new THREE.Scene(),
		camera: new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000),
		ctx: null,
		texture: null,
		tile: null
	},

	version: {
		major: 0,
		minor: 1,
		patch: 11
	},

	DT: {
		delta: 0,
		deltaTemp: performance.now(),
	}
}

window.addEventListener("keydown", function(event) {
	global.player.keys[event.key] = true; 
});

window.addEventListener("keyup", function(event) {
	global.player.keys[event.key] = false;
});

window.addEventListener('mousedown', (event) => {
    global.player.mouse[event.button] = true;
	global.player.mouseOnce[event.button] = true;
});

window.addEventListener('mouseup', (event) => {
    global.player.mouse[event.button] = false;
	global.player.mouseOnce[event.button] = false;
});

// bad performance
window.addEventListener("mousemove", function(event) {
	if (document.pointerLockElement) {
		const sensitivity = 0.004;
		global.player.rotationY -= event.movementX * sensitivity * (global.DT.delta / 14);
		global.player.rotationX -= event.movementY * sensitivity * (global.DT.delta / 14);
	}
});

window.addEventListener("wheel", function(event) {
	global.player.selectedTile += Math.floor(event.deltaY / 100);

	if(global.player.selectedTile < 0) {
		global.player.selectedTile = global.tile.tileAmount - 1;
	}

	if(global.player.selectedTile > global.tile.tileAmount - 1) {
		global.player.selectedTile = 0;
	}

	global.renderer.renderUITile();
});

canvas.addEventListener("click", async () => {
	if(!document.pointerLockElement) {
		await canvas.requestPointerLock();
	}
});

function update(dt) {
	global.player.update(dt);
	global.renderer.update(dt);
}

function tick() {
	global.level.tick();
}

function loop() {
    let temp = performance.now();
    global.DT.delta = temp - global.DT.deltaTemp;
    global.DT.deltaTemp = temp;

    global.tick.tickAccumulator += global.DT.delta;
    while(global.tick.tickAccumulator >= global.tick.tickRate) {
        tick();
        global.tick.tickAccumulator -= global.tick.tickRate;
    }

    update(global.DT.delta / 14);
    global.renderer.render();

    requestAnimationFrame(loop);
}

function start() {
	// MOVE FUNCTIONS TO THEIR THINGS
	global.tile = new Tile();
	global.tile.initializeTiles();

	global.level = new Level(128, 64, 128);
	global.level.generate();

	global.player = new Player(global.level.spawnX, global.level.spawnY, global.level.spawnZ);
	
	global.renderer = new Renderer();
	global.renderer.start();
	global.renderer.renderUI();
	global.renderer.renderUITile();

	loop();
}

// REFACTORING NEEDED
function loadAssets() {
	const alphaTest = [11];
	const transparent = [10];
	return new Promise((resolve) => {
		for(let i = 0; i < global.assetCount + 1; ++i) {
			global.materials[i] = new THREE.MeshStandardMaterial();
			const loader = new THREE.TextureLoader();
			loader.load(`./assets/${i}.png`, (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.magFilter = THREE.NearestFilter;
				global.materials[i].map = texture;
				global.materials[i].needsUpdate = true;
				if(alphaTest.includes(i)) {
					global.materials[i].alphaTest = 0.5;
				}
				if(transparent.includes(i)) {
					global.materials[i].transparent = true;
				}
			});
		}
		resolve();
	});
}

Promise.all([loadAssets()]).then(() => {
	start();
});

