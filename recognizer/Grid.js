"use strict"

import { BaseObject } from './BaseObject.js';
import { App } from './App.js';
import { Chunk } from './Chunk.js';


THREE.Vector3.prototype.key = function() {
    return this.x + "," + this.y + "," + this.z
    //return this.x + "," + this.z
}

THREE.Vector3.prototype.surroundingPoints = function() {
    const points = [];
    const xSize = 1
    const zSize = 1
    for (let x = -xSize; x <= xSize; x++) {
        for (let z = -zSize; z <= zSize; z++) {
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
        this.newSlot("chunkSize", 2500);
        this.newSlot("oldGrid", {});
    }

    floorSize() {
        return App.shared().floorSize()
    }

    // --- points ---

    currentGridPoint() {
        const cp = App.shared().camera().position.clone()
        cp.y = 0
        return this.gridPointForRealPoint(cp)
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
        const chunk = Chunk.clone().setGrid(this)
        chunk.setGridPosition(gp)
        chunk.setPosition(this.realPointForGridPoint(gp))
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
                const shouldRemove = chunk.retireIfNeeded()
                if (shouldRemove) {
                    if (this.oldGrid()[k]) {
                        console.warn("attempt to remove previously retired grid key")
                    }
                    delete grid[k]
                    this.oldGrid()[k] = true
                    didChange = true
                }
            }
        }
        if (didChange) {
            //console.log("scene size: ", App.shared().scene().children.length)
        }
    }
}

export { Grid }