"use strict"

class TunnelChunk extends Chunk {
    init() {
        super.init()
        this.newSlot("lineCount", 30)
        this.setRange(2)
    }

    randomInt(min, max) { 
        return Math.floor( (max - min) * Math.random() ) + min;
    }

    generate() {
        //console.log("this.position()  = ", this.position())
        if (this.position().x !== 0) {
            return 
        }

        const zz = this.gridPosition().z 

        const size = 500
        const radius = size * 0.5 * 10
        const topRadius = radius
        const bottomRadius = radius
        const height = 10000
        const radialSegments = this.randomInt(3, 15)
        const heightSegments = 1 //this.randomInt(1, 30)
        const openEnded = true

        let rr = Math.random()*.5 + .5
        if (rr > 0.8) { rr = 1 }
        const thetaLength = Math.PI * 2 * rr
        const thetaStart = -thetaLength/2 + Math.PI
        
        const geometry = new THREE.CylinderGeometry( 
            topRadius, 
            bottomRadius, 
            height,
            radialSegments, 
            heightSegments, 
            openEnded,
            thetaStart, 
            thetaLength);

        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        const cylinder = new THREE.Mesh( geometry, material );
 
        const outline = cylinder.asEdgesObject(0xffff00, 3, 3)
        outline.position.copy(this.position())
        outline.position.y = size + 100
        outline.rotation.x = Math.PI/2

        /*
        outline.update = function() {
            this.rotation.x += 0.1
            this.rotation.z += 0.1
        }
        */

        this.add( outline );
    }


}

window.TunnelChunk = TunnelChunk

export { TunnelChunk }