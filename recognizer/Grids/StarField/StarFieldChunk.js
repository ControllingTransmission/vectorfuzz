"use strict"

import { Chunk } from '../Chunk.js';

class StarFieldChunk extends Chunk {
    init() {
        super.init()
        this.newSlot("starCount", 40)
        this.setRange(4)
    }

    randomPos() {
        const size = this.chunkSize()
        const p = new THREE.Vector3();
        p.copy(this.position())
        p.x += Math.random()*size - size/2
        p.y += Math.random()*size - size/2
        p.z += Math.random()*size - size/2
        return p
    }

    generate() {
        const pos = this.position()
        const count = this.starCount()
        const chunkSize = this.chunkSize()

        for (let i = 0; i < count; i ++) {
            const obj = this.newStar()
            obj.position.copy(this.randomPos())
            this.add(obj)

            obj.update = function() {
                //this.vibrateLineWidth()
            }
        }
    }

    newStar() {
        const size = 2
        const geometry = new THREE.Geometry();

        geometry.vertices.push(new THREE.Vector3(- size/2, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3(  size/2, 0, 0 ) );

        const color = 0x0000ff;
        const linesMaterial = new THREE.LineBasicMaterial( { color: color, opacity: 1, linewidth: 4 } );
        const line = new THREE.Line( geometry, linesMaterial );
        return line
    }

}

window.StarFieldChunk = StarFieldChunk

export { StarFieldChunk }