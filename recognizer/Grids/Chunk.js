"use strict"

import { BaseObject } from '../BaseObject.js';
import { Grid } from './Grid.js';
import { App } from '../App.js';

class Chunk extends BaseObject {
    init() {
        super.init()
        this.newSlot("grid", null);
        this.newSlot("key", null);
        this.newSlot("gridPosition", null);
        this.newSlot("position", null);
        this.newSlot("objects", []);
        this.newSlot("range", 3);
    }

    chunkSize() {
        return this.grid().chunkSize()
    }

    update() {
        this.objects().forEach((obj) => {
            if (obj.update) {
                obj.update()
            }
        })
    }

    generateFrame() {     
        const pos = this.position()
        const cube = this.newCube(this.chunkSize()/2)
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
        
        //this.generateFrame()

        let obj = null;
        
        
        /*
        if (Math.random() < 0.1) {
            obj = Models.shared().objectNamed("Recognizer.obj")
            obj.position.y -= 800
            //obj = Models.shared().objectNamed("Hg_carrier.obj")
            obj.recursizeNormalize()
            obj.rotation.y = Math.PI * Math.random()
            //let s = 400
            //obj.position.y += 800
            //obj.scale.set(s,s,s)
            obj.rotationalVelocity().y = 0.01
            obj.rotationalVelocity().z = 0.01
            obj.update = function() {
                //this.updatePhysics()
            }
        }
        */
        
        
        
        if (Math.random() < 0.1) {
            obj = this.newShape()
            obj.position.y += 400
            const rv = obj.rotationalVelocity()
            rv.x = Math.random()/100
            rv.y = Math.random()/100
            obj.update = function() {
                this.updatePhysics()
                this.vibrateScale()
                this.vibrateLineWidth()
                this.vibrateColor()
            }
        }
        
        

        if (obj) {
            obj.position.x += pos.x
            obj.position.y += pos.y 
            obj.position.z += pos.z 
            //console.log(" chunk pos: ", pos.z)
            //console.log("camera pos: ", App.shared().camera().position.z)
            //console.log("---")
            this.add(obj)
        }
        
    }

    add(obj) {
        this.objects().push(obj)
        App.shared().scene().add(obj)
    }

    isOutOfRange() {
        const maxDist = this.chunkSize() * this.range()
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


    newShape(size) {
        const geometry = this.geometries().pick()
        //const geometry = new THREE.CubeGeometry(size, size, size);
        const material = new THREE.LineBasicMaterial( { color: 0xff6600, opacity: 1, linewidth: 8 } );
        const object = new THREE.Mesh(geometry, material);
        const outline = object.asEdgesObject(0xff0000, 5, 1)
        return outline
    }

    pickObject() {
        return this.objects().pick()
    }

    geometries() {
        if (!this._geometries) {
            const size = 1000
            this._geometries = [
                new THREE.IcosahedronGeometry(size, 0),
                new THREE.OctahedronGeometry(size, 0),
                new THREE.TetrahedronGeometry(size, 0),
                new THREE.DodecahedronGeometry(size, 0)
            ]
        }
        return this._geometries
    }


}

window.Chunk = Chunk

export { Chunk }