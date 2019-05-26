"use strict"

import { BaseObject } from './BaseObject.js';
import { Grid } from './Grid.js';
import { App } from './App.js';

class Chunk extends BaseObject {
    init() {
        super.init()
        this.newSlot("grid", null);
        this.newSlot("key", null);
        this.newSlot("position", null);
        this.newSlot("objects", []);
    }

    chunkSize() {
        return Grid.shared().chunkSize()
    }

    generate() {
        console.log("generating chunk " + this.key())
        
        /*
        const lineCount = 10
        const chunkSize = this.chunkSize()
        for (let i = 0; i < 10; i ++) {
            const line = this.newFloorLine()
            line.position.z = pos.z + 6000 + i * chunkSize / lineCount
            //console.log("line.position.z = ", line.position.z)
            chunk.objects.push(line)
            this.scene().add(line)
        }
        */
        //const obj = Models.shared().objectNamed("Recognizer.obj")

        const obj = this.newCube()
        const pos = this.position()

        obj.position.x = pos.x
        obj.position.y = pos.y
        obj.position.z = pos.z + 6000

        this.objects().push(obj)
        App.shared().scene().add(obj)
    }

    newCube() {
        const size = this.chunkSize()/10
        const geometry = new THREE.CubeGeometry(size, size, size);
        const material = new THREE.LineBasicMaterial( { color: 0xff6600, opacity: 1, linewidth: 8 } );
        const object = new THREE.Mesh(geometry, material);
        const outline = object.asEdgesObject(0xff0000, 5, 1)

        return outline
    }

    retireIfNeeded() {
        const maxDist = this.chunkSize() * 100
        const d = App.shared().camera().position.distanceTo(this.position())
        if (d > maxDist) {
            console.log("removing chunk ", this.key())
            chunk.objects.forEach((obj) => {
                App.shared().scene().remove(obj)
            })
            delete Grid.shared().grid()[this.key()]
            //console.log("scene.children.length = ", this.scene().children.length)
        }
    }

}

export { Chunk }