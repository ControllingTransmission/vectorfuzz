
"use strict"

//import { BaseObject } from './BaseObject.js';
import { Model } from './Model.js';

class Models extends BaseObject {
    init() {
        super.init()
        this.newSlot("dict", {}); // name to Group of model
        this.newSlot("isDebugging", false);
        this.preload()
    }

    preload() {
        const preloadNames = ["Hg_carrier.obj", "carrier.obj", "Recognizer.obj"];
        preloadNames.forEach((name) => this.objectNamed(name))
    }

    objectNamed(aName) {
        //console.log(this.type() + " objectNamed '" + aName + "'")

        let model = this.dict()[aName]
        if (!model) {
            model = this.loadModelNamed(aName)
        } 
        
        return model.objectClone()
    }

    loadModelNamed(aName) {
        const path = "./models/data/" + aName;
        const model = Model.clone().setPath(path).load();
        this.dict()[aName] = model
        return model
    }
}

window.Models = Models

export { Models }