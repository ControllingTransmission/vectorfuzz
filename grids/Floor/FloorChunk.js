"use strict"

//import { Grid } from '../Grid.js';
//import { App } from '../../App.js';
//import { Models } from '../../Models.js';
//import { Chunk } from '../Chunk.js';

class FloorChunk extends Chunk {
    init() {
        super.init()
        this.newSlot("lineCount", 30)
        this.setRange(4)
    }

    generate() {
        //console.log(" generating chunk " + this.key())
        const pos = this.position()
        const lineCount = this.lineCount()
        const chunkSize = this.chunkSize()

        for (let i = 0; i < lineCount; i ++) {
            const line = this.newFloorLine()
            line.position.x = pos.x
            line.position.y = -400
            line.position.z = pos.z + i * chunkSize / lineCount - chunkSize/2
            //console.log("line.position.z = ", line.position.z)
            this.add(line)
        }

        /*
        for (let i = 0; i < lineCount; i ++) {
            const line = this.newFloorLine()
            line.position.x = pos.x + i * chunkSize / lineCount - chunkSize/2
            line.position.y = 0
            line.position.z = pos.z

            line.rotation.y = Math.PI/2
            //console.log("line.position.z = ", line.position.z)
            this.add(line)
        }
        */
        
    }

    newFloorLine() {
        const size = this.chunkSize()
        const geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(- size/2, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3(  size/2, 0, 0 ) );

        const color = 0x0000ff;
        const linesMaterial = new THREE.LineBasicMaterial( { color: color, opacity: 1, linewidth: 4 } );
        const line = new THREE.Line( geometry, linesMaterial );
        return line
    }

}

window.FloorChunk = FloorChunk

export { FloorChunk }