
"use strict"

import { BaseObject } from './BaseObject.js';
import { Model } from './Model.js';

class Models extends BaseObject {
    shared() {
        const name = this.type().toLowerCase()
        if (!window[name]) {
            window[name] = Models.clone()
        }
        return window[name]
    }

    init() {
        super.init()
        this.newSlot("dict", {}); // name to Group of model
        this.newSlot("isDebugging", true); 
    }

    objectNamed(aName) {
        let obj = this.dict()[aName]
        if (!obj) {
            obj = this.loadObjectNamed(aName)
        } else {
            obj = obj.clone(true) // recursive clone
        }
        // TODO: keep first object here and hand clones to callers
        // need to keep a list of returned objects to update when
        // initial is loaded
        
        return obj
    }

    loadObjectNamed(aName) {
        const path = "./models/" + aName;
        const model = Model.clone().setPath(path).setDelegate(this).load();
        const obj = new THREE.Group();
        model.setInfo(obj) // so we can fill it in when loaded
        this.dict()[aName] = obj
        return obj
    }

    didLoadModel(aModel) {
        if (this.isDebugging()) {
            console.log(this.type() + " loaded '" + aModel.path() + "'")
        }
        const group = aModel.info()
        group.add(aModel.object())
    }
}

export { Models }