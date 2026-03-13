// REVIEW, use intersect

export class AABB {
    x0;
    y0;
    z0;
    x1;
    y1;
    z1;
    epsilon = 0;

    constructor(x0, y0, z0, x1, y1, z1) {
        this.x0 = x0;
        this.y0 = y0;
        this.z0 = z0;
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
    }

    intersect(a, b) {
        return (
            a.minX <= b.maxX &&
            a.maxX >= b.minX &&
            a.minY <= b.maxY &&
            a.maxY >= b.minY &&
            a.minZ <= b.maxZ &&
            a.maxZ >= b.minZ
        );
    }

    move(xa, ya, za) {
        this.x0 += xa;
        this.y0 += ya;
        this.z0 += za;
        this.x1 += xa;
        this.y1 += ya;
        this.z1 += za;
    }

	expand(x, y, z) {
		let _x0 = this.x0;
		let _y0 = this.y0;
		let _z0 = this.z0;
		let _x1 = this.x1;
		let _y1 = this.y1;
		let _z1 = this.z1;
		if(x < 0) {
			_x0 += x;
		}

		if(x > 0) {
			_x1 += x;
		}

		if(y < 0) {
			_y0 += y;
		}

		if(y > 0) {
			_y1 += y;
		}

		if(z < 0) {
			_z0 += z;
		}

		if(z > 0) {
			_z1 += z;
		}

		return new AABB(_x0, _y0, _z0, _x1, _y1, _z1);
	}

    clipXCollide(box, x) {
        if(box.y1 <= this.y0 || box.y0 >= this.y1 || box.z1 <= this.z0 || box.z0 >= this.z1) {
            return x;
        }

        if(x > 0 && box.x0 >= this.x1) {
            const max = box.x0 - this.x1 - this.epsilon;
            if(max < x) {
                x = max;
            }
        }

        if(x < 0 && box.x1 <= this.x0) {
            const max = box.x1 - this.x0 + this.epsilon;
            if(max > x) {
                x = max;
            } 
        }

        return x;
    }

    clipYCollide(box, y) {
        if(box.x1 <= this.x0 || box.x0 >= this.x1 || box.z1 <= this.z0 || box.z0 >= this.z1) {
            return y;
        } 

        if(y > 0 && box.y0 >= this.y1) {
            let max = box.y0 - this.y1 - this.epsilon;
            if(max < y) {
                y = max;
            }
        }

        if(y < 0 && box.y1 <= this.y0) {
            let max = box.y1 - this.y0 + this.epsilon;
            if(max > y) {
                y = max;
            }
        }

        return y;
    }

    clipZCollide(box, z) {
        if(box.x1 <= this.x0 || box.x0 >= this.x1 || box.y1 <= this.y0 || box.y0 >= this.y1) {
            return z;
        }

        if(z > 0 && box.z0 >= this.z1) {
            let max = box.z0 - this.z1 - this.epsilon;
            if(max < z) {
                z = max;
            }
        }

        if(z < 0 && box.z1 <= this.z0) {
            let max = box.z1 - this.z0 + this.epsilon;
            if(max > z) {
                z = max;
            }
        }

        return z;
    }
}
