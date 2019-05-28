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

    update() {
        this.objects().forEach((obj) => {
            obj.recursiveSetColor(new THREE.Color().rainbowHexColor())
        })
    }

    generateFrame() {     
        const pos = this.position()
        const cube = this.newCube()
        cube.name = this.key()

        cube.position.x = pos.x
        cube.position.y = pos.y + this.chunkSize()/2
        cube.position.z = pos.z //+ 6000
        cube.recursiveSetColor(0x00ff00) // not working in SVG mode
        this.add(cube)
    }

    generate() {
        //console.log("generating chunk " + this.key())
        const pos = this.position()
        
        /*
        const lineCount = 3
        const chunkSize = this.chunkSize()
        for (let i = 0; i < lineCount; i ++) {
            const line = this.newFloorLine()
            line.position.x = pos.x
            line.position.y = -100
            line.position.z = pos.z + i * chunkSize / lineCount - chunkSize/2
            //console.log("line.position.z = ", line.position.z)
            this.add(line)
        }
        */
        
        this.generateFrame()

        let obj = null;
        /*
        if (Math.random() < 0.02) {
            obj = Models.shared().objectNamed("Recognizer.obj")
            const s = .01
            //obj.scale.set(s, s, s)
        } else {
            //obj = this.newCube()
        }
        */

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

    isOutOfRange() {
        const maxDist = this.chunkSize() * 10
        const d = App.shared().camera().position.distanceTo(this.position())
        return (d > maxDist);
    }

    shutdown() {
        this.objects().forEach((obj) => {
            App.shared().scene().remove(obj)
        })
        this.setObjects([])
    }

    // -----------------------------------------------------


    newCube() {
        const size = this.chunkSize()
        const geometry = new THREE.CubeGeometry(size, size, size);
        const material = new THREE.LineBasicMaterial( { color: 0xff6600, opacity: 1, linewidth: 8 } );
        const object = new THREE.Mesh(geometry, material);
        const outline = object.asEdgesObject(0xff0000, 5, 1)
        return outline
    }
}

export { Chunk }