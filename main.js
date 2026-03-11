import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";
// import { Entity } from "./entity/Entity.js";
import { Player } from "./entity/Player.js";
import { Level } from "./Level.js";
import { Tile } from "./tile/Tile.js";

export const global = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),
	renderer: new THREE.WebGLRenderer({canvas: document.getElementById("canvas")}),
	player: null,
	level: null,
	tile: null,
	materials: [],
	chunkSize: 16,
	DEBUG: false
}

window.addEventListener("keydown", function(event) {
	global.player.keys[event.key] = true; 
});

window.addEventListener("keyup", function(event) {
	global.player.keys[event.key] = false;
});

window.addEventListener("mousemove", function(event) {
	if (document.pointerLockElement) {
		const sensitivity = 0.01;
		global.player.rotationY -= event.movementX * sensitivity;
		global.player.rotationX -= event.movementY * sensitivity;
	}
});

canvas.addEventListener("click", async () => {
	await canvas.requestPointerLock();
});

function update() {
	global.player.update();
}

function render() {
    global.renderer.render(global.scene, global.camera);
}

function loop() {
	update();
	render();
	requestAnimationFrame(loop);
}

function start() {
	global.camera.rotation.order = 'YXZ';
	global.renderer.setSize(window.innerWidth, window.innerHeight);

	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	global.scene.add(ambientLight);

	global.tile = new Tile();
	global.tile.initializeTiles();

	global.level = new Level(128, 64, 128);
	global.level.generate();
	global.player = new Player(global.level.spawnX, global.level.spawnY, global.level.spawnZ);
	loop();
}

function loadAssets() {
	const assetCount = 12;
	const alphaTest = [11];
	const opacity = [10];
	return new Promise((resolve) => {
		for(let i = 0; i < assetCount + 1; ++i) {
			global.materials[i] = new THREE.MeshStandardMaterial();
			const loader = new THREE.TextureLoader();
			loader.load(`./asset/${i}.png`, (texture) => {
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

