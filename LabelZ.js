
"use strict"

import { BaseObject } from './BaseObject.js';
import { App } from './App.js';

class LabelZ extends BaseObject {

    init() {
        super.init()
        this.newSlot("object", new THREE.Object3D());
        this.newSlot("depth", 2)

        this.object().update = function() {
            const camera = App.shared().camera()
            this.rotation.y = Math.atan2( ( camera.position.x - this.position.x ), ( camera.position.z - this.position.z ) );
            //this.recursiveSetColor(0x0000FF)
            //this.vibrateColor()
            THREE.Object3D.prototype.update.apply(this)
        }
        this.object().position.y = 300
    }

    setText(text) {

        let z = 0
        for (let i = 0; i < this.depth(); i++) {
            const font = Fonts.shared().fontNamed("G-Type_Regular.json")
            font.setColor(new THREE.Color().pickRainbowColor())
            const t = font.objectForText(text)
            t.position.z = z;
            z += 100;
            this.object().add(t)
            //this.object().recursiveSetColor(0x0000FF)
        }

        return this
    }

    update() {
        this.object().update()
    }
}

window.LabelZ = LabelZ

export { LabelZ }