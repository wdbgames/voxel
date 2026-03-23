import { global } from "./main.js";

export class Input {
    keys = [];
	keysOnce = [];
	mouse = [];
	mouseOnce = [];

    constructor() {
        this.addEventListeners();
    }

    addEventListeners() {
        document.addEventListener("keydown", (event) => {
            this.keys[event.key] = true; 
            if(!event.repeat) {
                this.keysOnce[event.key] = true;
            }
        });

        document.addEventListener("keyup", (event) => {
            this.keys[event.key] = false;
        });

        document.addEventListener('mousedown', (event) => {
            if(document.pointerLockElement) {
                this.mouse[event.button] = this.mouseOnce[event.button] = true;
            }
        });

        document.addEventListener('mouseup', (event) => {
            this.mouse[event.button] = this.mouseOnce[event.button] = false;
        });

        document.addEventListener("mousemove", function(event) {
            if (document.pointerLockElement && global.player) {
                global.player.updateRotation(event.movementX, event.movementY);
            }
        });

        document.addEventListener("wheel", function(event) {
            if(global.player) {
                global.player.updateSelectedTile(Math.floor(event.deltaY / 100));
            }
        });

        canvas.addEventListener("click", async () => {
            if(!document.pointerLockElement) {
                await canvas.requestPointerLock();
            }
        });
    }
}
