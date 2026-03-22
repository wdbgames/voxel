import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
import { Player } from "./entity/Player.js";
import { Level } from "./Level.js";
import { TileRegisterer } from "./level/TileRegisterer.js";
import { Renderer } from "./Renderer.js";
import { Gui } from "./Gui.js";
import { Input } from "./Input.js";

export const global = {
	// IMPLEMENT
	canvasWidth: window.innerWidth,
	canvasHeight: window.innerHeight,

	renderer: null,
	player: null,
	level: null,

	tile: new TileRegisterer(),
	gui: new Gui(),
	input: new Input(),

	selectedType: 0,
	selectedTheme: 0,
	selectedSize: 1,

	materialCount: 30,
	materials: [],
	audioCount: 10,
	audio: [],
	
	debug: false,
	debugUpdate: true,

	tick: {
		tickRate: 1000 / 16,
		tickAccumulator: 0
	},

	version: {
		major: 0,
		minor: 4,
		patch: 2
	},

	// MEH
	DT: {
		delta: 0,
		deltaTemp: performance.now(),
	}
}

function addEventListeners() {
	document.addEventListener("keydown", function(event) {
		global.player.keys[event.key] = true; 
		if(!event.repeat) {
			global.player.keysOnce[event.key] = true;
		}
	});

	document.addEventListener("keyup", function(event) {
		global.player.keys[event.key] = false;
	});

	document.addEventListener('mousedown', (event) => {
		if(document.pointerLockElement) {
			global.player.mouse[event.button] = global.player.mouseOnce[event.button] = true;
		}
	});

	document.addEventListener('mouseup', (event) => {
		global.player.mouse[event.button] = global.player.mouseOnce[event.button] = false;
	});

	document.addEventListener("mousemove", function(event) {
		if (document.pointerLockElement) {
			global.player.updateRotation(event.movementX, event.movementY);
		}
	});

	document.addEventListener("wheel", function(event) {
		global.player.updateSelectedTile(Math.floor(event.deltaY / 100));
	});

	canvas.addEventListener("click", async () => {
		if(!document.pointerLockElement) {
			await canvas.requestPointerLock();
		}
	});
}

function update(dt) {
	// TODO
	if(global.canvasWidth != window.innerWidth || global.canvasHeight != window.innerHeight) {
		global.canvasWidth = window.innerWidth;
		global.canvasHeight = window.innerHeight;
	}

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

// MOVE TO GUI
function start() {
	global.gui.hideElement("canvas");

	global.gui.createElement("voxel", "title", "Voxel", 0, 64);
	global.gui.createElement("create-new-level", "button", "Create New Level", 0, 64, newLevelSettings);
	global.gui.createElement("load-level", "button", "Load Level", 0, 64);
	global.gui.createElement("settings", "button", "Settings", 0, 64);
	global.gui.createElement("quick-new-level", "button", "Quick New Level", 0, 64, quickNewLevel);
	global.gui.disableElement("load-level");
	global.gui.disableElement("settings");
}

function newLevelSettings() {
	global.gui.deleteElement("voxel");
	global.gui.deleteElement("create-new-level");
	global.gui.deleteElement("load-level");
	global.gui.deleteElement("settings");
	global.gui.deleteElement("quick-new-level");

	global.gui.createElement("type", "button", "Type: Default", 0, 64, updateType);
	global.gui.createElement("theme", "button", "Theme: Default", 0, 64, updateTheme);
	global.gui.createElement("size", "button", "Size: Medium", 0, 64, updateSize);
	global.gui.createElement("create-new-level", "button", "Create New Level", 0, 64, createNewLevel);
}

function updateType() {
	const types = ["Default", "Flat", "Void", "Floating"];
	++global.selectedType;
	if(global.selectedType >= 4) {
		global.selectedType = 0;
	}
	global.gui.updateTextContent("type", `Type: ${types[global.selectedType]}`);
}

function updateTheme() {
	const themes = ["Default", "Hell"];
	++global.selectedTheme;
	if(global.selectedTheme >= 2) {
		global.selectedTheme = 0;
	}
	global.gui.updateTextContent("theme", `Theme: ${themes[global.selectedTheme]}`);
}

function updateSize() {
	const sizes = ["Small", "Medium", "Large"];
	++global.selectedSize;
	if(global.selectedSize >= 3) {
		global.selectedSize = 0;
	}
	global.gui.updateTextContent("size", `Size: ${sizes[global.selectedSize]}`);
}

function createNewLevel() {
	global.gui.deleteElement("type");
	global.gui.deleteElement("theme");
	global.gui.deleteElement("size");
	global.gui.deleteElement("create-new-level");

	quickNewLevel();
}

function quickNewLevel() {
	global.gui.showElement("canvas");

	global.renderer = new Renderer();

	global.level = new Level(64 << global.selectedSize, 64, 64 << global.selectedSize, global.selectedType, global.selectedTheme);
	global.level.generate();

	global.player = new Player(global.level.spawnX, global.level.spawnY, global.level.spawnZ);
	
	global.renderer.start();

	addEventListeners()

	loop();
}

function loadLevel() {
	// TODO
}

function settings() {
	// TODO
}

async function loadAssets() {
	// MOVE TO TILE
	const alphaTest = [11, 22];
	const transparent = [10, 24];
	const doubleSide = [26, 27];

	const loader = new THREE.TextureLoader();
	const promises = [];
	
	// SIMPLIFY A BIT
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

				if(doubleSide.includes(i)) {
					global.materials[i].side =  THREE.DoubleSide;
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
