export class Entity {
    positionX;
    positionY;
    positionZ;
    rotationX = 0;
    rotationY = 0;

    constructor(x, y, z) {
        this.positionX = x;
        this.positionY = y;
        this.positionZ = z;
    }

    update() {
    }

    render() {
    }
}
