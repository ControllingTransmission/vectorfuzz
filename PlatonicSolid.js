"use strict"

import { BaseObject } from '../BaseObject.js';

class PlatonicSolid extends BaseObject {
    init() {
        super.init()
        this.newSlot("number", 0)
        this.newSlot("object", new THREE.Object3D());
        this.newSlot("size", 1500);

        this.newSlot("materialDict", { color: 0xff6600, opacity: 1, linewidth: 8 })
    }

    update() {
        this.object().update()
    }

    setNumber(n) {
        n = Math.floor(n)
        if (n < -1 && n > this.geometries().length - 1) {
            throw new Error("number out of range")
        }
        this._number = n
        this.setupShape()
        return this
    }

    geometry() {
        return this.geometries()[this.number()]
    }

    setupShape() {
        const md = this.materialDict()
        const material = new THREE.LineBasicMaterial( md );
        const mesh = new THREE.Mesh(this.geometry(), material);
        const outline = mesh.asEdgesObject(md.color, md.linewidth, md.opacity)
        this.object().removeChildren()

        //const s = this.size()
        //outline.scale.set(s, s, s)
        this.object().add(outline)
    }

    pickNumber() {
        const min = 0;
        const max = this.geometries().length - 1;
        const n = Math.floor(Math.random() * (max - min) + min);
        //console.log("solid number:", n)
        this.setNumber(n)
        return this
    }

    geometries() {
        const size = this.size()
        return [
            new THREE.TetrahedronGeometry(size, 0), // 4
            //new THREE.CubeGeometry(size, size, size), // 6
            new THREE.BoxGeometry(size, size, size), // 6
            new THREE.OctahedronGeometry(size, 0), // 8
            new THREE.DodecahedronGeometry(size*.8, 0), // 12
            new THREE.IcosahedronGeometry(size*.8, 0), // 20
        ]
    }

    cachedGeometries() {
        const proto = PlatonicSolid
        if (!proto._geometries) {
            proto._geometries = this.geometries()
        }
        return proto._geometries
    }
}

window.PlatonicSolid = PlatonicSolid

export { PlatonicSolid }