import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { global } from "./main.js";

export class Renderer {
    renderer = new THREE.WebGLRenderer({canvas: document.getElementById("canvas")});
    ambientLight = new THREE.AmbientLight(0xffffff, 2);
    // waterOverlay;
    // lavaOverlay;

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000);
    ctx = null;
    texture = null;
    tiles = new Array(5);
    #tileRotation = 0;
    #canvasWidth = 0;
    #canvasHeight = 0;
    #mesh = null;
    #material = null;

    axesHelper = new THREE.AxesHelper(64);

    constructor() {
        this.start();
        this.renderUI();
        this.updateUITile();
    }

    start() {
        this.camera.position.z = 10;
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext("2d");
        this.texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), material);
        this.scene.add(mesh);

        this.renderer.autoClear = false;
        global.camera.rotation.order = 'YXZ';
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        global.scene.background = new THREE.Color();
        global.scene.add(this.ambientLight);
    
        const textHeight = 16;
        global.gui.createElement("version", "info", `Voxel ${global.version.major}.${global.version.minor}.${global.version.patch}`, 2, 2);
        global.gui.createElement("positionX", "info", "b", 2, 2 + textHeight * 2);
        global.gui.createElement("positionY", "info", "c", 2, 2 + textHeight * 3);
        global.gui.createElement("positionZ", "info", "d", 2, 2 + textHeight * 4);
        global.gui.createElement("fly", "info", "e", 2, 2 + textHeight * 6);
        global.gui.createElement("noclip", "info", "f", 2, 2 + textHeight * 7);
        global.gui.createElement("chunkUpdates", "info", "g", 2, 2 + textHeight * 9);
        global.gui.createElement("tileUpdates", "info", "h", 2, 2 + textHeight * 10);
    }

    update(dt) {
        
        this.#tileRotation += 0.01 * dt;
        for(let i = 0; i < this.tiles.length; ++i) {
            //this.tiles[i].rotation.x = this.#tileRotation;
            this.tiles[i].rotation.y = this.#tileRotation;
        }
        

        this.ctx.clearRect(0, 0, 256, 128)

        if(global.debugUpdate) {
            if(global.debug) {
                this.axesHelper = new THREE.AxesHelper(512);
                this.scene.add(this.axesHelper);

                global.gui.showElement("positionX");
                global.gui.showElement("positionY");
                global.gui.showElement("positionZ");
                global.gui.showElement("fly");
                global.gui.showElement("noclip");
                global.gui.showElement("chunkUpdates");
                global.gui.showElement("tileUpdates");
            } else {
                if (this.axesHelper) {
                    this.scene.remove(this.axesHelper);
                    this.axesHelper.geometry.dispose();
                    this.axesHelper = null;
                }

                global.gui.hideElement("positionX");
                global.gui.hideElement("positionY");
                global.gui.hideElement("positionZ");
                global.gui.hideElement("fly");
                global.gui.hideElement("noclip");
                global.gui.hideElement("chunkUpdates");
                global.gui.hideElement("tileUpdates");
            }
        }

        if(global.debug) {
            global.gui.updateTextContent("positionX", `positionX: ${global.player.positionX.toFixed(3)}`);
            global.gui.updateTextContent("positionY", `positionY: ${global.player.positionY.toFixed(3)}`);
            global.gui.updateTextContent("positionZ", `positionZ: ${global.player.positionZ.toFixed(3)}`);
            global.gui.updateTextContent("fly", `fly: ${global.player.fly}`);
            global.gui.updateTextContent("noclip", `noclip: ${global.player.noclip}`);
            global.gui.updateTextContent("chunkUpdates", `chunkUpdates: ${global.level.chunkUpdates}`);
            global.gui.updateTextContent("tileUpdates", `tileUpdates: ${global.level.tileUpdates}`);
        }

        this.texture.needsUpdate = false;

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
        this.renderer.render(this.scene, this.camera);
    }

    renderUI() {
        const light = new THREE.AmbientLight(0xffffff, 4);
        this.scene.add(light); 

        // crosshair
        const size = 9;
        const x0 = window.innerWidth / 2 - size / 2;
        const y0 = window.innerHeight / 2 - size / 2;
        const x1 = size;
        const y1 = size;
        this.ctx.fillRect(x0, y0, x1, y1);
    }

    updateUITile() { 
        for(let i = 0; i < this.tiles.length; ++i) {
            if (this.tiles[i]) {
                this.scene.remove(this.tiles[i]);
                this.tiles[i].geometry.dispose();
                this.tiles[i] = null;
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

            const isSelected = i == global.player.selectedSlot;
            const tileSize = 32;

            const geometry = new THREE.BufferGeometry();

            const tile = global.tile.tiles[global.player.inventory[i]];
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
                    if(isSelected) {
                        colors.push(2, 2, 2);
                    } else {
                        colors.push(1, 1, 1);
                    }
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

            if(global.player.inventory[i] == global.tile.void || global.player.inventory[i] == global.tile.voidWall) {
                this.tiles[i] = new THREE.Mesh(geometry, material);
            } else {
                this.tiles[i] = new THREE.Mesh(geometry, global.materials);
            }
            
            //this.tile.position.set(window.innerWidth / 2 - tileSize / 2 - 16, window.innerHeight / 2 - tileSize / 2 - 16, -64);
            this.tiles[i].position.set((i - 2) * tileSize * 2, -window.innerHeight / 2 + tileSize + 16, -64);
            this.tiles[i].rotation.x = 0.5;
            this.tiles[i].rotation.y = 0.5;
            this.scene.add(this.tiles[i]);
        }
    }
}
