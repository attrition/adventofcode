// aborted
namespace day3 {

    class Point {
        x: number;
        y: number;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        distanceBetween(other: Point): number {
            return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
        }
    }

    class Wire {
        points: Point[] = [];

        constructor(origin: Point) {
            this.points.push(origin);
        }

        route(route: string[]): void {
            this.points.push(new Point(1, 0));
            this.points.push(new Point(2, 0));
            this.points.push(new Point(2, 1));
            this.points.push(new Point(2, 2));
        }
    }

    class Grid {
        points: Point[] = new Array();

        offset: number = 10000;
        maxSize: number = this.offset * 2 + 1;

        addWire(wire: Wire) {
            wire.points.forEach(p => {
                // check intersections as we place the wire
                let x = p.x + this.offset;
                let y = p.y + this.offset;
                this.points[x * this.maxSize + y] = p;
            });
        }
    }

    let shortestIntersection = Number.MAX_SAFE_INTEGER;

    let origin = new Point(0, 0);
    let wire = new Wire(origin);
    wire.route([""]);

    let grid = new Grid();
    grid.addWire(wire);

    console.log("okay");
}