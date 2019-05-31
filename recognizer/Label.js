
"use strict"

import { BaseObject } from './BaseObject.js';
import { App } from './App.js';

class Label extends BaseObject {

    init() {
        super.init()
        this.newSlot("object", null);
    }

    setText(text) {
        const font = Fonts.shared().fontNamed("G-Type_Regular.json")
        const t = font.objectForText(text)
        t.position.y += 300

        t.update = function() {
            const camera = App.shared().camera()
            this.rotation.y = Math.atan2( ( camera.position.x - this.position.x ), ( camera.position.z - this.position.z ) );
            THREE.Object3D.prototype.update.apply(this)
        }

        this.setObject(t)
        return this
    }

    update() {
        this.object().update()
    }
}

window.Label = Label

export { Label }