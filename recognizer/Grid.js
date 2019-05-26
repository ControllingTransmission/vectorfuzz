"use strict"

import { BaseObject } from './BaseObject.js';

class Grid extends BaseObject {
    init() {
        super.init()
        this.newSlot("chunks", null);
        this.newSlot("grid", {});
    }

    scene() {
        return window.app.scene()
    }

    chunkSize() {
        return 10000
    }
    
    // --- location ---
    camera() {
        return window.app.camera()
    }

    currentGridPoint() {
        const p = this.camera().position
        const gp = p.clone().multiplyScalar(1/this.chunkSize()).floor()
        return gp
    }

    currentGridPosition() {
        const p = this.camera().position
        const gp = p.clone().multiplyScalar(1/this.chunkSize()).floor().multiplyScalar(this.chunkSize())
        return gp
    }

    currentGridPointName() {
        const gp = this.currentGridPoint()
        const name = gp.x + "@" + gp.y + "@" + gp.z 
        return name
    }

    // --- update ---

    update() {
        const k = this.currentGridPointName()
        
        this.retireGridPointsIfNeeded()

        if (!this.grid()[k]) {
            this.grid()[k] = this.generateCurrentGridPoint()
        }
    }

    generateCurrentGridPoint() {
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

    // --- objects ---

    newCube() {
        const size = this.chunkSize()/10
        const geometry = new THREE.CubeGeometry(size, size, size);
        const material = new THREE.LineBasicMaterial( { color: 0xff6600, opacity: 1, linewidth: 8 } );
        const object = new THREE.Mesh(geometry, material);
        const outline = object.asEdgesObject(0xff0000, 5, 1)

        return outline
    }

    floorSize() {
        return 10000
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