"use strict"

import { BaseObject } from './BaseObject.js';
import { App } from './App.js';
import { Chunk } from './Chunk.js';


THREE.Vector3.prototype.key = function() {
    return this.x + "," + this.y + "," + this.z
}

THREE.Vector3.prototype.surroundingPoints = function() {
    const points = [];
    const size = 2
    for (let x = -size; x <= size; x++) {
        for (let z = -size; z <= size; z++) {
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
        this.newSlot("chunkSize", 16000);
        this.newSlot("oldGrid", {});
    }

    floorSize() {
        return App.shared().floorSize()
    }

    // --- points ---

    currentGridPoint() {
        return this.gridPointForRealPoint(App.shared().camera().position)
    }

    gridPointForRealPoint(p) {
        const cs = this.chunkSize()
        return p.clone().multiplyScalar(1/cs).floor()
    }

    realPointForGridPoint(p) {
        const cs = this.chunkSize()
        return p.clone().multiplyScalar(cs)
    }

    // --- update ---

    update() {
        const gp = this.currentGridPoint()
        //console.log("gp = ", gp.key())

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
        if (this.oldGrid()[k]) {
            console.warn("attempt to recreate retired grid key")
        }
        const pos = this.realPointForGridPoint(gp)
        const chunk = Chunk.clone()
        chunk.setPosition(pos)
        chunk.setKey(k)
        chunk.generate()
        return chunk
    }


    retireGridPointsIfNeeded() {
        let didChange = false
        const grid = this.grid()
        for (let k in grid) {
            if (grid.hasOwnProperty(k)) {
                const chunk = grid[k]
                const didRetire = chunk.retireIfNeeded()
                if (didRetire) {
                    this.oldGrid()[k] = true
                    didChange = true
                }
            }
        }
        if (didChange) {
            //console.log("scene size: ", App.shared().scene().children.length)
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


}

export { Grid }