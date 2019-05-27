"use strict"

import { BaseObject } from './BaseObject.js';
import { Grid } from './Grid.js';
import { App } from './App.js';
import { Models } from './Models.js';

class Chunk extends BaseObject {
    init() {
        super.init()
        this.newSlot("grid", null);
        this.newSlot("key", null);
        this.newSlot("gridPosition", null);
        this.newSlot("position", null);
        this.newSlot("objects", []);
    }

    chunkSize() {
        return this.grid().chunkSize()
    }

    generate() {
        //console.log("generating chunk " + this.key())
        const pos = this.position()
        
        const lineCount = 3
        const chunkSize = this.chunkSize()
        for (let i = 0; i < lineCount; i ++) {
            const line = this.newFloorLine()
            line.position.z = pos.z + i * chunkSize / lineCount
            line.position.y = -100
            //console.log("line.position.z = ", line.position.z)
            this.add(line)
        }
        
        
        
        let obj = null
        
        if (Math.random() < 0.05) {
            obj = Models.shared().objectNamed("Recognizer.obj")
            const s = .01
            //obj.scale.set(s, s, s)
        } else {
            //obj = this.newCube()
        }


        if (obj) {
            obj.position.x = pos.x
            obj.position.y = pos.y 
            obj.position.z = pos.z //+ 6000
            console.log(" chunk pos: ", pos.z)
            console.log("camera pos: ", App.shared().camera().position.z)
            console.log("---")
            this.add(obj)
        }
        
    }

    add(obj) {
        this.objects().push(obj)
        App.shared().scene().add(obj)
    }


    newCube() {
        const size = 300
        const geometry = new THREE.CubeGeometry(size, size, size);
        const material = new THREE.LineBasicMaterial( { color: 0xff6600, opacity: 1, linewidth: 8 } );
        const object = new THREE.Mesh(geometry, material);
        const outline = object.asEdgesObject(0xff0000, 5, 1)
        outline.rotation.z = this.position().z/4000
        return outline
    }

    retireIfNeeded() {
        
        const maxDist = this.chunkSize() * 100
        const d = App.shared().camera().position.distanceTo(this.position())
        if (d > maxDist) {
            console.log("removing chunk ", this.key())
            this.objects().forEach((obj) => {
                App.shared().scene().remove(obj)
            })
            return true
        }
        
        return false
    }

    floorSize() {
        return 30000
    }

    newFloorLine() {
        const size = this.floorSize()
        const geometry = new THREE.Geometry();
        const f = 10

        geometry.vertices.push(new THREE.Vector3(- f*size/2, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3(  f*size/2, 0, 0 ) );

        const color = 0x0000ff;
        const linesMaterial = new THREE.LineBasicMaterial( { color: color, opacity: 1, linewidth: 3 } );
        const line = new THREE.Line( geometry, linesMaterial );
        return line
    }

}

export { Chunk }