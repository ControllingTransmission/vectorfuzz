"use strict"

import { BaseObject } from './BaseObject.js';
import { App } from './App.js';
import { Chunk } from './Chunk.js';
import { Models } from './Models.js';


THREE.Vector3.prototype.key = function() {
    return this.x + "," + this.y + "," + this.z
}

THREE.Vector3.prototype.surroundingPoints = function() {
    const points = [];
    for (let x = -1; x < 2; x++) {
        for (let z = -1; z < 2; z++) {
            //const isCenter = (x === 0 && z === 0);
            //if (!isCenter) {
                const point = new THREE.Vector3(this.x + x, this.y + 0, this.z + z);
                points.push(point);
            //}
        }
    }
    return points;
}

class Grid extends BaseObject {
    init() {
        super.init()
        this.newSlot("chunks", null);
        this.newSlot("grid", {});
        this.newSlot("chunkSize", 1000);
    }

    scene() {
        return App.shared().scene()
    }
    
    // --- location ---
    camera() {
        return App.shared().camera()
    }

    // --- points ---

    currentGridPoint() {
        return this.gridPointForRealPoint(this.camera().position)
    }

    gridPointForRealPoint(p) {
        const cs = this.chunkSize()
        return p.clone().multiplyScalar(1/cs).floor()
    }

    realPointForGridPoint(p) {
        const cs = this.chunkSize()
        return p.clone().multiplyScalar(cs)
    }

    /*
    keyForPoint(p) {
        return p.x + "," + p.y + "," + p.z
    }
    */

    // --- update ---

    update() {
        let gp = this.currentGridPoint()
        //console.log("this.camera().position = ", this.camera().position)
        //console.log("gp = ", gp.key())
        //this.generateChunkForGridPointIfNeeded(gp)

        gp.surroundingPoints().forEach((p) => {
            this.generateChunkForGridPointIfNeeded(p)
        })
        //console.log("---")
        this.retireGridPointsIfNeeded()
    }

    generateChunkForGridPointIfNeeded(gp) {
        const k = gp.key()
        if (!this.grid()[k]) {
            this.grid()[k] = this.generateChunk(gp)
        }  
    }

    generateChunk(gp) {
        const k = gp.key()
        const pos = this.realPointForGridPoint(gp)
        const chunk = Chunk.clone()
        chunk.setPosition(pos)
        chunk.setKey(k)
        chunk.generate()
        return chunk
    }


    retireGridPointsIfNeeded() {
        const grid = this.grid()
        for (let k in grid) {
            if (grid.hasOwnProperty(k)) {
                const chunk = grid[k]
                chunk.retireIfNeeded()
            }
          }
    }

    // --- objects ---

    newCube() {
        const size = 100
        const geometry = new THREE.CubeGeometry(size, size, size);
        const material = new THREE.LineBasicMaterial( { color: 0xff6600, opacity: 1, linewidth: 8 } );
        const object = new THREE.Mesh(geometry, material);
        const outline = object.asEdgesObject(0xff0000, 5, 1)
        return outline
    }

    floorSize() {
        return App.shared().floorSize()
    }

    newFloorLine() {
        const size = this.floorSize()
        const geometry = new THREE.Geometry();
        const f = 10

        geometry.vertices.push(new THREE.Vector3(- f*size/2, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3(  f*size/2, 0, 0 ) );

        const color = 0x0000ff;
        const linesMaterial = new THREE.LineBasicMaterial( { color: color, opacity: .2, linewidth: 3 } );
        const line = new THREE.Line( geometry, linesMaterial );
        //line.position.z = i * (size/max);
        line.position.y = 0
        return line
    }

}

export { Grid }