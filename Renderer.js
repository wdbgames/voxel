import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { global } from "./main.js";

export class Renderer {
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas")});
    ambientLight = new THREE.AmbientLight(0xffffff, 2);
    // waterOverlay;
    // lavaOverlay;

    axesHelper = new THREE.AxesHelper(64);

    info = {
        info: document.getElementById("info"),
        debug: document.getElementById("debug"),

        version: document.getElementById("version"),

        positionX: document.getElementById("positionX"),
        positionY: document.getElementById("positionY"),
        positionZ: document.getElementById("positionZ"),

        onGround: document.getElementById("onGround"),
        fly: document.getElementById("fly"),
        noclip: document.getElementById("noclip"),

        chunkUpdates: document.getElementById("chunkUpdates"),
        tileUpdates: document.getElementById("tileUpdates")
    }

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

        // version (not debug)
        version.innerText = `Voxel ${global.version.major}.${global.version.minor}.${global.version.patch}`;
    }

    update(dt) {
        global.UI.tileRotation += 0.01 * dt;
        global.UI.tile.rotation.x = global.UI.tileRotation;
        global.UI.tile.rotation.y = global.UI.tileRotation;

        global.UI.ctx.clearRect(0, 0, 256, 128)

        if(global.debugUpdate) {
            if(global.debug) {
                this.axesHelper = new THREE.AxesHelper(64);
                global.UI.scene.add(this.axesHelper);

                this.info.debug.hidden = false;
            } else {
                if (this.axesHelper) {
                    global.UI.scene.remove(this.axesHelper);
                    this.axesHelper.geometry.dispose();
                    this.axesHelper = null;
                }

                this.info.debug.hidden = true;
            }
        }

        console.log("Check positionX:", info.positionX);
        if(global.debug) {
            this.info.positionX.textContent = `positionX: ${global.player.positionX.toFixed(3)}`;
            this.info.positionY.textContent = `positionY: ${global.player.positionY.toFixed(3)}`;
            this.info.positionZ.textContent = `positionZ: ${global.player.positionZ.toFixed(3)}`;
            
            this.info.onGround.textContent = `onGround: ${global.player.onGround}`;
            this.info.fly.textContent = `fly: ${global.player.fly}`;
            this.info.noclip.textContent = `noclip: ${global.player.noclip}`;
            
            this.info.chunkUpdates.textContent = `chunkUpdates: ${global.level.chunkUpdates}`;
            this.info.tileUpdates.textContent = `tileUpdates: ${global.level.tileUpdates}`;
        }

        global.UI.texture.needsUpdate = false;

        for(const chunk of global.level.chunks) {
            if(chunk.needsUpdate) {
                chunk.needsUpdate = false;
                chunk.updateGeometry();
            }   
        }

        if(global.debugUpdate) {
            global.debugUpdate = false;
        }
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

        // crosshair
        const size = 0.01;
        const x0 = window.innerWidth / 2 - window.innerWidth / 2 * size;
        const y0 = window.innerHeight / 2 - window.innerHeight / 2 * size;
        const x1 = window.innerHeight * size;
        const y1 = window.innerHeight * size;
        global.UI.ctx.fillRect(x0, y0, x1, y1);
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
        const colors = [];

        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
       });

        let vertexOffset = 0;
        for (let f = 0; f < 6; ++f) {
            for(let j = 0; j < 4; ++j) {
                colors.push(1, 1, 1);
            }

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

        // CHANGE TO THREE.Float32BufferAttribute
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        if(global.player.selectedTile == global.tile.void || global.player.selectedTile == global.tile.voidWall) {
            global.UI.tile = new THREE.Mesh(geometry, material);
        } else {
            global.UI.tile = new THREE.Mesh(geometry, global.materials);
        }
        
        global.UI.tile.position.set(window.innerWidth / 2 - tileSize / 2 - 16, window.innerHeight / 2 - tileSize / 2 - 16, -64);
        global.UI.scene.add(global.UI.tile);
    }
}
