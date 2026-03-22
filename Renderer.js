import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161/build/three.module.js";

import { global } from "./main.js";

export class Renderer {
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("canvas")
    });

    // ADD FOV SETTING
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    sceneUI = new THREE.Scene();
    cameraUI = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1000);

    overlay = [];
    waterOverlay = null;
    lavaOverlay = null;

    // PRIVATE
    nearDistance = 0.01;
    farDistance = 64;
    
    #tiles = new Array(5);
    #tileRotation = 0;

    #axesHelper = new THREE.AxesHelper(64);
    #crosshair = null;

    #temp = null;

    start() {
        this.cameraUI.position.z = 16;
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.createOverlay(10);
        this.createOverlay(16);

        this.renderer.autoClear = false;
        this.camera.rotation.order = 'YXZ';
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.scene.background = new THREE.Color();
        this.scene.fog = new THREE.Fog(0x000000, 0, 0);
        this.scene.add(new THREE.AmbientLight(0xffffff, 2));
    
        const textHeight = 16;
        global.gui.createElement("version", "info", `Voxel ${global.version.major}.${global.version.minor}.${global.version.patch}`, 2, 2);
        global.gui.createElement("positionX", "info", "b", 2, 2 + textHeight * 2);
        global.gui.createElement("positionY", "info", "c", 2, 2 + textHeight * 3);
        global.gui.createElement("positionZ", "info", "d", 2, 2 + textHeight * 4);
        global.gui.createElement("fly", "info", "e", 2, 2 + textHeight * 6);
        global.gui.createElement("noclip", "info", "f", 2, 2 + textHeight * 7);
        global.gui.createElement("chunkUpdates", "info", "g", 2, 2 + textHeight * 9);
        global.gui.createElement("tileUpdates", "info", "h", 2, 2 + textHeight * 10);
        global.gui.createElement("nearDistance", "info", "i", 2, 2 + textHeight * 12);
        global.gui.createElement("farDistance", "info", "j", 2, 2 + textHeight * 13);
        global.gui.createElement("temp", "info", "k", 2, 2 + textHeight * 15);
        
        const light = new THREE.AmbientLight(0xffffff, 4);
        this.sceneUI.add(light); 

        // size
        this.createCrosshair(9);
        this.createAxesHelper(64);

        this.updateUITile();
        this.updateDistance();
    }

    update(dt) {
        this.#tileRotation += 0.01 * dt;
        for(let i = 0; i < this.#tiles.length; ++i) {
            this.#tiles[i].rotation.y = this.#tileRotation;
        }

        if(global.debugUpdate) {
            if(global.debug) {
                this.#axesHelper.visible = true;

                global.gui.showElement("positionX");
                global.gui.showElement("positionY");
                global.gui.showElement("positionZ");
                global.gui.showElement("fly");
                global.gui.showElement("noclip");
                global.gui.showElement("chunkUpdates");
                global.gui.showElement("tileUpdates");
                global.gui.showElement("nearDistance");
                global.gui.showElement("farDistance");
                global.gui.showElement("temp");
            } else {
                this.#axesHelper.visible = false;

                global.gui.hideElement("positionX");
                global.gui.hideElement("positionY");
                global.gui.hideElement("positionZ");
                global.gui.hideElement("fly");
                global.gui.hideElement("noclip");
                global.gui.hideElement("chunkUpdates");
                global.gui.hideElement("tileUpdates");
                global.gui.hideElement("nearDistance");
                global.gui.hideElement("farDistance");
                global.gui.hideElement("temp");
            }
        }

        // !!!
        this.#temp = null;

        if(global.debug) {
            global.gui.updateTextContent("positionX", `positionX: ${global.player.positionX.toFixed(3)}`);
            global.gui.updateTextContent("positionY", `positionY: ${global.player.positionY.toFixed(3)}`);
            global.gui.updateTextContent("positionZ", `positionZ: ${global.player.positionZ.toFixed(3)}`);
            global.gui.updateTextContent("fly", `fly: ${global.player.fly}`);
            global.gui.updateTextContent("noclip", `noclip: ${global.player.noclip}`);
            global.gui.updateTextContent("chunkUpdates", `chunkUpdates: ${global.level.chunkUpdates}`);
            global.gui.updateTextContent("tileUpdates", `tileUpdates: ${global.level.tileUpdates}`);
            global.gui.updateTextContent("nearDistance", `nearDistance: ${this.nearDistance}`);
            global.gui.updateTextContent("farDistance", `farDistance: ${this.farDistance}`);
            global.gui.updateTextContent("temp", `temp: ${this.#temp}`);
        }

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
        this.renderer.render(this.scene, this.camera);

        this.renderer.clearDepth();
        this.renderer.render(this.sceneUI, this.cameraUI);
    }

    updateUITile() { 
        for(let i = 0; i < this.#tiles.length; ++i) {
            if (this.#tiles[i]) {
                this.sceneUI.remove(this.#tiles[i]);
                this.#tiles[i].geometry.dispose();
                this.#tiles[i] = null;
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

            geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
            geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
            geometry.setIndex(indices);
            geometry.computeVertexNormals();

            if(global.player.inventory[i] == global.tile.void || global.player.inventory[i] == global.tile.voidWall) {
                this.#tiles[i] = new THREE.Mesh(geometry, material);
            } else {
                this.#tiles[i] = new THREE.Mesh(geometry, global.materials);
            }
            
            this.#tiles[i].position.set((i - 2) * tileSize * 2, -window.innerHeight / 2 + tileSize + 16, -64);
            this.#tiles[i].rotation.x = 0.5;
            this.#tiles[i].rotation.y = 0.5;
            this.sceneUI.add(this.#tiles[i]);
        }
    }

    updateDistance() {
        this.scene.fog.near = this.farDistance - 8;
        this.scene.fog.far = this.farDistance - 4;

        this.camera.near = this.nearDistance;
        this.camera.far = this.farDistance;

        this.camera.updateProjectionMatrix();
    }

    createOverlay(materialID) {
        let material = global.materials[materialID];
        material.vertexColors = false;
        this.overlay[materialID] = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), material);
        this.sceneUI.add(this.overlay[materialID]);
        this.overlay[materialID].visible = false;
    }

    createCrosshair(size) {
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
        });
        this.#crosshair = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
        this.sceneUI.add(this.#crosshair);
    }

    createAxesHelper(size) {
        this.#axesHelper = new THREE.AxesHelper(size);
        this.sceneUI.add(this.#axesHelper);
        this.#axesHelper.visible = false;
    }

    incrementNearDistance(x, min, max) {
        this.nearDistance *= x;
        if(this.nearDistance < min) {
            this.nearDistance = max;
        }
        if(this.nearDistance > max) {
            this.nearDistance = min;
        }

        this.updateDistance();
    }

    incrementFarDistance(x, min, max) {
        this.farDistance *= x;
        if(this.farDistance < min) {
            this.farDistance = max;
        }
        if(this.farDistance > max) {
            this.farDistance = min;
        }

        this.updateDistance();
    }
}
