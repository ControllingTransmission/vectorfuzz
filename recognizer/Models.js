
"use strict"

import { BaseObject } from './BaseObject.js';
import { Model } from './Model.js';

class Models extends BaseObject {
    shared() {
        if (!window["models"]) {
            window.models = Models.clone()
        }
        return window.models
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
        }
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