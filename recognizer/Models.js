
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
        this.preload()
    }

    preload() {
        const preloadNames = ["Hg_carrier.obj", "carrier.obj", "Recognizer.obj"];
        preloadNames.forEach((name) => this.objectNamed(name))
    }

    objectNamed(aName) {
        console.log(this.type() + " objectNamed '" + aName + "'")

        let proto = this.dict()[aName]
        if (!proto) {
            proto = this.loadObjectNamed(aName)
        } 
        
        if (proto._isLoaded) {
            return proto.clone(true)
        } 
        
        const newInstance = new THREE.Group()
        proto._waitingClones.push(newInstance)
        return newInstance
    }

    loadObjectNamed(aName) {
        const path = "./models/" + aName;
        const model = Model.clone().setPath(path).setDelegate(this).load();
        const group = new THREE.Group();
        group._isLoaded = false
        group._waitingClones = []
        model.setInfo(group) // so we can fill it in when loaded
        this.dict()[aName] = group
        return group
    }

    didLoadModel(aModel) {
        if (this.isDebugging()) {
            console.log(this.type() + " loaded '" + aModel.path() + "'")
        }
        const group = aModel.info()
        group.add(aModel.object())
        group._waitingClones.forEach((waitingClone) => { 
            waitingClone.add(group.clone(true))
        })
    }
}

export { Models }