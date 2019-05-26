"use strict"

import { BaseObject } from './BaseObject.js';

class Chunk extends BaseObject {
    init() {
        super.init()
        this.newSlot("grid", null);
        this.newSlot("key", null);
        this.newSlot("point", null);
        this.newSlot("objects", null);
    }

    generate() {
        const k = this.currentGridPointName()
        //console.log("generating chunk " + k)
        let chunk = {}
        chunk.key = k
        chunk.position = this.currentGridPosition()
        chunk.objects = []

        const pos = this.currentGridPosition()
        // add chunk objects
        
        const lineCount = 10
        const chunkSize = this.chunkSize()
        for (let i = 0; i < 10; i ++) {
            const line = this.newFloorLine()
            line.position.z = pos.z + 6000 + i * chunkSize / lineCount
            //console.log("line.position.z = ", line.position.z)
            chunk.objects.push(line)
            this.scene().add(line)
        }
        

        /*
        const obj = this.newCube()
        //const pos = this.currentGridPosition()
        obj.position.z = pos.z + 6000 
        chunk.objects.push(obj)
        this.scene().add(obj)
        */

        return chunk
    }

    newCube() {
        const size = this.chunkSize()/10
        const geometry = new THREE.CubeGeometry(size, size, size);
        const material = new THREE.LineBasicMaterial( { color: 0xff6600, opacity: 1, linewidth: 8 } );
        const object = new THREE.Mesh(geometry, material);
        const outline = object.asEdgesObject(0xff0000, 5, 1)

        return outline
    }

    retireGridPointsIfNeeded() {
        const grid = this.grid()
        for (let k in grid) {
            if (grid.hasOwnProperty(k)) {
                const chunk = grid[k]
               this.checkChunk(chunk)
            }
          }
    }

    checkChunk(chunk) {
        const maxDist = this.chunkSize()*3
        const d = this.camera().position.distanceTo(chunk.position)
        if (d > maxDist) {
            chunk.objects.forEach((obj) => {
                this.scene().remove(obj)
            })
            delete this.grid()[chunk.key]
            console.log("scene.children.length = ", this.scene().children.length)
        }
    }

}

export { Chunk }