
"use strict"

import { BaseObject } from './BaseObject.js';

class Model extends BaseObject {
    init() {
        super.init()
        this.newSlot("path", null); 
        this.newSlot("loader", null); 
        this.newSlot("object", null); 
        this.newSlot("delegate", null); 
        this.newSlot("isDebugging", false); 
        this.newSlot("info", null); // extra slot for delegate to store info
    }

    load() {
        if (this.isDebugging()) {
            console.log(this.type() + " loading '" + this.path() + "'...")
        }
        const loader = new THREE.OBJLoader();
        //const loader = new THREE.ObjectLoader();
        const callback = (obj) => { this.didLoad(obj) };
        loader.load(this.path(), callback);  
        this.setLoader(loader)  
        //loader.addEventListener("load", callback );
        return this
    }

    didLoad(object) {
        if (this.isDebugging()) {
            console.log(this.type() + " loaded '" + this.path() + "'")
        }
        const outline = object.asEdgesObject(0xff6600, 4, .5)
        this.setObject(outline)
        //App.shared().spotlight().target = object
        this.sendDidLoad()
    }

    sendDidLoad() {
        const d = this.delegate()
        if (d && d.didLoadModel) {
            d.didLoadModel(this)
        }
    }
}

export { Model }