import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { Player } from "./entity/Player.js";
import { Level } from "./Level.js";
import { Tile } from "./level/Tile.js";
import { Renderer } from "./Renderer.js";
import { Gui } from "./Gui.js";

export const global = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),

	renderer: null,
	player: null,
	level: null,
	tile: null,
	gui: null,

	materialCount: 27,
	materials: [],
	audioCount: 7,
	audio: [],
	
	debug: false,
	debugUpdate: true,

	tick: {
		tickRate: 1000 / 16,
		tickAccumulator: 0
	},

	// move to renderer
	UI: {
		scene: new THREE.Scene(),
		camera: new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000),
		ctx: null,
		texture: null,
		tile: null,
		tileRotation: 0,
	},

	version: {
		major: 0,
		minor: 3,
		patch: 1
	},

	DT: {
		delta: 0,
		deltaTemp: performance.now(),
	}
}

// COMBINE =
window.addEventListener("keydown", function(event) {
	global.player.keys[event.key] = true; 
	if(!event.repeat) {
		global.player.keysOnce[event.key] = true;
	}
});

window.addEventListener("keyup", function(event) {
	global.player.keys[event.key] = false;
});

window.addEventListener('mousedown', (event) => {
	if(document.pointerLockElement) {
		global.player.mouse[event.button] = true;
		global.player.mouseOnce[event.button] = true;
	}
});

window.addEventListener('mouseup', (event) => {
    global.player.mouse[event.button] = false;
	global.player.mouseOnce[event.button] = false;
});

window.addEventListener("mousemove", function(event) {
	if (document.pointerLockElement) {
		global.player.updateRotation(event.movementX, event.movementY);
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

	global.renderer.updateUITile();
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
	// TODO
	global.gui = new Gui();
	global.gui.createElement("title", "title", "Voxel", 0, 0);
	global.gui.createElement("create-new-level", "button", "Create New Level", 0, 0, createNewLevel);
	global.gui.createElement("load-level", "button", "Load Level", 0, 0);
	global.gui.createElement("settings", "button", "Settings", 0, 0);
	global.gui.disableElement("load-level", 0, 0);
	global.gui.disableElement("settings", 0, 0);

	global.tile = new Tile();
	global.tile.initializeTiles();
}

function createNewLevel() {
	global.level = new Level(128, 64, 128, 0, 0);
	global.level.generate();

	global.player = new Player(global.level.spawnX, global.level.spawnY, global.level.spawnZ);
	
	global.renderer = new Renderer();

	loop();
}

function loadLevel() {
}

function settings() {
}

async function loadAssets() {
	const alphaTest = [11, 22];
	const transparent = [10];

	const loader = new THREE.TextureLoader();
	const promises = [];
	
	for(let i = 0; i < global.materialCount; ++i) {
		global.materials[i] = new THREE.MeshStandardMaterial();
		promises.push(new Promise((resolve, reject) => {
			loader.load(`./assets/tile/${i}.png`, (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.magFilter = THREE.NearestFilter;
				global.materials[i].map = texture;
				global.materials[i].needsUpdate = true;
				global.materials[i].vertexColors = true;
				if(alphaTest.includes(i)) {
					global.materials[i].alphaTest = 0.5;
				}

				if(transparent.includes(i)) {
					global.materials[i].transparent = true;
				}

				resolve();
			}, undefined, reject);
		}));
	}

	for(let i = 0; i < global.audioCount; ++i) {
		promises.push(new Promise((resolve, reject) => {
			global.audio[i] = new Audio(`./assets/audio/${i}.mp3`)
			global.audio[i].addEventListener("canplaythrough", () => resolve(), {
				once: true 
			});
			global.audio[i].addEventListener("error", reject, {
				once: true
			})
		}));
	}

	await Promise.all(promises)
}

await loadAssets();
start();
//document.getElementById("in-game").hidden = true;

