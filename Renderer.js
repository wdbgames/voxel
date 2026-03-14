import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { global } from "./main.js";

export class Renderer {
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas")});
    ambientLight = new THREE.AmbientLight(0xffffff, 0);
    waterOverlay;
    lavaOverlay;

    constructor() {
    }

    start() {
        global.UI.camera.position.z = 10;
        const UICanvas = document.createElement("canvas");
        UICanvas.width = window.innerWidth;
        UICanvas.height = window.innerHeight;
        global.UI.ctx = UICanvas.getContext("2d");
        global.UI.texture = new THREE.CanvasTexture(UICanvas);
        const UIMaterial = new THREE.MeshBasicMaterial({ map: global.UI.texture, transparent: true });
        const UIPlane = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), UIMaterial);
        global.UI.scene.add(UIPlane);

        this.renderer.autoClear = false;
        global.camera.rotation.order = 'YXZ';
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        global.scene.background = new THREE.Color();
        global.scene.add(this.ambientLight);
    }

    update(dt) {
        global.UI.tile.rotation.x += 0.01 * dt;
        global.UI.tile.rotation.y += 0.01 * dt;

        global.UI.ctx.clearRect(0, 0, 128, 128)
        global.UI.ctx.fillText(`Voxel ${global.version.major}.${global.version.minor}.${global.version.patch}`, 4, 16);
        
        if(global.DEBUG) {
            global.UI.ctx.fillText(`x: ${global.player.positionX.toFixed(2)}`, 4, 32);
            global.UI.ctx.fillText(`y: ${global.player.positionY.toFixed(2)}`, 4, 48);
            global.UI.ctx.fillText(`z: ${global.player.positionZ.toFixed(2)}`, 4, 64);
            
            global.UI.ctx.fillText(`In water: ${global.player.inViscous[global.tile.water]}`, 4, 80);
            global.UI.ctx.fillText(`In lava: ${global.player.inViscous[global.tile.lava]}`, 4, 96);
        }

        global.UI.texture.needsUpdate = true;
    }

    render() {
        this.renderer.clear();
        this.renderer.render(global.scene, global.camera);

        this.renderer.clearDepth();
        this.renderer.render(global.UI.scene, global.UI.camera);
    }

    renderUI() {
        const light = new THREE.AmbientLight(0xffffff, 4);
        global.UI.scene.add(light); 

        const size = 0.01;
        const x0 = window.innerWidth / 2 - window.innerWidth / 2 * size;
        const y0 = window.innerHeight / 2 - window.innerHeight / 2 * size;
        const x1 = window.innerHeight * size;
        const y1 = window.innerHeight * size;
        global.UI.ctx.fillRect(x0, y0, x1, y1);

        global.UI.ctx.font = "16px arial";
        global.UI.ctx.fillText(`Voxel ${global.version.major}.${global.version.minor}.${global.version.patch}`, 4, 16);
        global.UI.texture.needsUpdate = true;

        const tileSize = 32;
        const geometry = new THREE.BoxGeometry(tileSize, tileSize, tileSize);
        const tile = global.player.selectedTile;
        const material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
        global.UI.tile = new THREE.Mesh(geometry, material);
        global.UI.tile.position.set(window.innerWidth / 2 - tileSize / 2 - 16, window.innerHeight / 2 - tileSize / 2 - 16, 0);
        global.UI.tile.position.z = -18;
        global.UI.scene.add(global.UI.tile);
    }

    renderUITile() {
        const tile = global.player.selectedTile;
        if(tile == 0) {
            const material = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
            global.UI.tile.material = material;
        } else {
            const materials = []
            
            for(let i = 0; i < 6; ++i) {
                materials[i] = global.materials[global.tile.tiles[tile].tileMaterials[i]];
            }

            global.UI.tile.material = materials;
        }
        
        global.UI.tile.needsUpdate = true;
    }
}
