
"use strict"

import { BaseObject } from './BaseObject.js';

class Model extends BaseObject {
    init() {
        super.init()
        this.newSlot("path", null); 
        this.newSlot("loader", null); 
        this.newSlot("group", new THREE.Group()); 
        this.newSlot("object", null); 
        this.newSlot("isLoaded", false); 
        this.newSlot("waitingClones", []); 
        this.newSlot("delegate", null); 
        this.newSlot("isDebugging", false); 
    }

    load() {
        if (this.isDebugging()) {
            console.log(this.type() + " loading '" + this.path() + "'...")
        }
        const loader = new THREE.OBJLoader();
        this.setLoader(loader)  
        loader.load(this.path(), (obj) => { this.didLoad(obj) });  
        //loader.addEventListener("load", callback );
        return this
    }

    didLoad(object) {
        this.setIsLoaded(true)

        if (this.isDebugging()) {
            console.log(this.type() + " loaded '" + this.path() + "'")
        }

        const outline = object.asEdgesObject(0xff6600, 4, .5)
        this.setObject(outline)
        this.group().add(this.object())

        outline.recursiveSetColor(this.rainbowColor())


        this.waitingClones().forEach((clone) => {
            clone.add(this.object().clone())
        })

        this.setWaitingClones(null) // don't need these now

        this.sendDidLoad()
    }

    objectClone() {
        const clone = this.group().clone()

        if (!this.isLoaded()) {
            this.waitingClones().push(clone)
        } 
 
        return clone
    }

    sendDidLoad() {
        const d = this.delegate()
        if (d && d.didLoadModel) {
            d.didLoadModel(this)
        }
    }

    rainbowColor() {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
        const color = colors[Math.floor(Math.random() * colors.length)]
        return color
    }
}

export { Model }