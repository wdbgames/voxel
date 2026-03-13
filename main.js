import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { Player } from "./entity/Player.js";
import { Level } from "./Level.js";
import { Tile } from "./level/Tile.js";

export const global = {
	// TODO: sort better
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),
	renderer: new THREE.WebGLRenderer({canvas: document.getElementById("canvas")}),

	player: null,
	level: null,
	tile: null,

	materials: [],
	assetCount: 14,
	chunkSize: 16,
	DEBUG: false,

	UI: {
		scene: new THREE.Scene(),
		camera: new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000),
		ctx: null,
		texture: null,
		tile: null
	},

	other: {
		versionMajor: 0,
		versionMinor: 1,
		versionPatch: 2
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

window.addEventListener("mousemove", function(event) {
	if (document.pointerLockElement) {
		const sensitivity = 0.004;
		global.player.rotationY -= event.movementX * sensitivity;
		global.player.rotationX -= event.movementY * sensitivity;
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

	global.level.renderUITile();
});

canvas.addEventListener("click", async () => {
	if(!document.pointerLockElement) {
		await canvas.requestPointerLock();
	}
});

function update() {
	global.player.update();
    global.UI.tile.rotation.x += 0.01;
    global.UI.tile.rotation.y += 0.01;
}

function render() {
	global.renderer.clear();
    global.renderer.render(global.scene, global.camera);

	global.renderer.clearDepth();
	global.renderer.render(global.UI.scene, global.UI.camera);
}

function loop() {
	update();
	render();
	requestAnimationFrame(loop);
}

function start() {
	global.UI.camera.position.z = 10;
	const UICanvas = document.createElement("canvas");
	UICanvas.width = window.innerWidth;
	UICanvas.height = window.innerHeight;
	global.UI.ctx = UICanvas.getContext("2d");
	global.UI.texture = new THREE.CanvasTexture(UICanvas);
	const UIMaterial = new THREE.MeshBasicMaterial({ map: global.UI.texture, transparent: true });
	const UIPlane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), UIMaterial);
	global.UI.scene.add(UIPlane);

	global.renderer.autoClear = false;
	global.camera.rotation.order = 'YXZ';
	global.renderer.setSize(window.innerWidth, window.innerHeight);

	const ambientLight = new THREE.AmbientLight(0x87CEEB, 2);
	global.scene.add(ambientLight);

	global.scene.background = new THREE.Color(0xa0d9ef);

	global.tile = new Tile();
	global.tile.initializeTiles();
	global.level = new Level(128, 64, 128);
	global.level.generate();
	global.player = new Player(global.level.spawnX, global.level.spawnY, global.level.spawnZ);
	global.level.renderUI();
	loop();
}

function loadAssets() {
	const alphaTest = [11];
	const opacity = [10];
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
				if(opacity.includes(i)) {
					global.materials[i].transparent = true;
					global.materials[i].opacity = 0.5;
				}
			});
		}
		resolve();
	});
}

Promise.all([loadAssets()]).then(() => {
	start();
});

