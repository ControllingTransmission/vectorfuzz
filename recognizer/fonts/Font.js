
"use strict"

//import { BaseObject } from './BaseObject.js';
//import { App } from './App.js';

class Font extends BaseObject {

    init() {
        super.init()
        this.newSlot("path", "fonts/helvetiker_bold.typeface.json");
        this.newSlot("loader", null);
        this.newSlot("isLoaded", false);
        this.newSlot("font", null);
        this.newSlot("size", 400);
        this.newSlot("height", 1);
        this.newSlot("curveSegments", 0);
        this.newSlot("color", new THREE.Color(0xFFFF00));
        this.newSlot("opacity",  0.9);
        this.newSlot("waitingObjects",  []);
    }


    load() {
        const loader = new THREE.FontLoader();
        this.setLoader(loader)
        loader.load(
            "./fonts/data/" + this.path(),
            ( font )  => { this.onLoad(font) },
            ( xhr )   => { this.onProgress(xhr) }, 
            ( error ) => { this.onError(error) }
        );
        return this
    }

    onProgress(xhr) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    }

    onLoad(font) {
        this.setIsLoaded(true)
        this.setFont(font)
        this.waitingObjects().forEach((obj) => { this.finishObject(obj) })
    }

    onError(error) {
        console.log("Font error:", error );
    }

    // --------------------------------

    objectForText(text) {
        const obj = new THREE.Object3D()
        obj._text = text

        if (this.isLoaded()) {
            this.finishObject(obj)
        } else {
            this.waitingObjects().push(obj)
        }

        // use obj.getWidth() to get width of text once loaded
        return obj
    }

    finishObject(obj) {
        obj.add(this.meshForText(obj._text))
    }

    meshForText(text) {
        const textGeometry = new THREE.TextGeometry( text, { 
            font: this.font(), 
            size: this.size(), 
            height: this.height(), 
            curveSegments: this.curveSegments()
        } ); 
        const textMaterial = new THREE.MeshBasicMaterial( { color: this.color(), opacity: this.opacity() } ); 
        const textMesh = new THREE.Mesh( textGeometry, textMaterial );
        textMesh.rotation.y = Math.PI
        return textMesh
    }
}

window.Font = Font

export { Font }