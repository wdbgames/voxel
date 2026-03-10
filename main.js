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
	materials: [],
	chunkSize: 16,
	tile: null
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

	Promise.all([loadAssets()]).then(() => {
		global.level = new Level(64, 64, 64);
		global.level.generate();
		global.player = new Player(global.level.width / 2, global.level.height + 1.5, global.level.depth / 2);
		loop();
	});
}

function loadAssets() {
	return new Promise((resolve) => {
		for(let i = 0; i < 5; ++i) {
			global.materials[i] = new THREE.MeshStandardMaterial();
			const loader = new THREE.TextureLoader();
			loader.load(`./asset/${i}.png`, (texture) => {
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.magFilter = THREE.NearestFilter;
				global.materials[i].map = texture;
				global.materials[i].needsUpdate = true;
			});
		}
		resolve();
	});
}

start();
