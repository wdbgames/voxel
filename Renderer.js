import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { global } from "./main.js";

export class Renderer {
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas")});
    ambientLight = new THREE.AmbientLight(0xffffff, 0);
    waterOverlay;
    lavaOverlay;

    constructor() {
        this.start();
        this.renderUI();
        this.updateUITile();
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
        global.UI.tileRotation += 0.01 * dt;
        global.UI.tile.rotation.x = global.UI.tileRotation;
        global.UI.tile.rotation.y = global.UI.tileRotation;

        global.UI.ctx.clearRect(0, 0, 128, 128)
        global.UI.ctx.fillText(`Voxel ${global.version.major}.${global.version.minor}.${global.version.patch}`, 4, 16);
        
        if(global.DEBUG) {
            global.UI.ctx.fillText(`x: ${global.player.positionX.toFixed(3)}`, 4, 32);
            global.UI.ctx.fillText(`y: ${global.player.positionY.toFixed(3)}`, 4, 48);
            global.UI.ctx.fillText(`z: ${global.player.positionZ.toFixed(3)}`, 4, 64);

            global.UI.ctx.fillText(`On ground: ${global.player.onGround}`, 4, 80);
            
            /*
            global.UI.ctx.fillText(`In water: ${global.player.inViscous[global.tile.water]}`, 4, 80);
            global.UI.ctx.fillText(`In leaves: ${global.player.inViscous[global.tile.leaves]}`, 4, 96);
            global.UI.ctx.fillText(`In lava: ${global.player.inViscous[global.tile.lava]}`, 4, 112);
            */
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
    }

    updateUITile() {
        if (global.UI.tile) {
            global.UI.scene.remove(global.UI.tile);
            global.UI.tile.geometry.dispose();
            global.UI.tile = null;
        }

        const defaultFaceVertices = new Float32Array([
            0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, // front
            1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, // back
            0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, // top
            0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, // bottom
            1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, // right
            0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0  // left
        ]);

        const defaultFaceUVs = new Float32Array([
            0, 0, 1, 0, 1, 1, 0, 1, // front
            0, 0, 1, 0, 1, 1, 0, 1, // back
            0, 0, 1, 0, 1, 1, 0, 1, // top
            0, 0, 1, 0, 1, 1, 0, 1, // bottom
            0, 0, 1, 0, 1, 1, 0, 1, // right
            0, 0, 1, 0, 1, 1, 0, 1, // left
        ]);

        const tileSize = 32;

        const geometry = new THREE.BufferGeometry();

        const tile = global.tile.tiles[global.player.selectedTile];
        const faceVertices = tile.hasCustomFaceVertices ? tile.customFaceVertices : defaultFaceVertices;
        const faceUVs = tile.hasCustomFaceUVs ? tile.customFaceUVs : defaultFaceUVs;

        const positions = [];
        const uvs = [];
        const indices = [];

        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
       });

        let vertexOffset = 0;
        for (let f = 0; f < 6; ++f) {
            for (let j = f * 12; j < (f * 12) + 12; j += 3) {
                positions.push(faceVertices[j] * tileSize - tileSize / 2, faceVertices[j + 1] * tileSize - tileSize / 2, faceVertices[j + 2] * tileSize - tileSize / 2);
            }

            for (let j = f * 8; j < (f * 8) + 8; ++j) {
                uvs.push(faceUVs[j]);
            }

            indices.push(vertexOffset, vertexOffset + 1, vertexOffset + 2, vertexOffset, vertexOffset + 2, vertexOffset + 3);
            geometry.addGroup(indices.length - 6, 6, tile.tileMaterials[f]);
            vertexOffset += 4;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        if(global.player.selectedTile == global.tile.void || global.player.selectedTile == global.tile.voidWall) {
            global.UI.tile = new THREE.Mesh(geometry, material);
        } else {
            global.UI.tile = new THREE.Mesh(geometry, global.materials);
        }
        
        global.UI.tile.position.set(window.innerWidth / 2 - tileSize / 2 - 16, window.innerHeight / 2 - tileSize / 2 - 16, -64);
        global.UI.scene.add(global.UI.tile);

        if(global.DEBUG) {
            const axesHelper = new THREE.AxesHelper(64);
            global.UI.scene.add(axesHelper);
        }
    }
}
