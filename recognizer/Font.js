
"use strict"

import { BaseObject } from './BaseObject.js';
import { App } from './App.js';

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
    }


    load() {
        const loader = new THREE.FontLoader();
        this.setLoader(loader)
        loader.load(
            this.path(),
            ( font )  => { this.onLoad(font) },
            ( xhr )   => { this.onProgress(xhr) }, 
            ( error ) => { this.onError(error) }
        );
    }

    onProgress(xhr) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    }

    onLoad(font) {
        this.setIsLoaded(true)
        this.setFont(font)
        const fontMesh = this.meshForText("DON'T BLINK OR YOU'LL DIE!")
        fontMesh.rotation.y = Math.PI

    }

    onError(error) {
        console.log("Font error:", error );
    }

    meshForText(text) {
        //var loader = new THREE.FontLoader(); 
        //var font = loader.parse(helveticaRegular); 
        const textGeometry = new THREE.TextGeometry( text, { 
            font: this.font(), 
            size: this.size(), 
            height: this.height(), 
            curveSegments: this.curveSegments()
        } ); 
        const textMaterial = new THREE.MeshBasicMaterial( { color: this.color(), opacity: this.opacity() } ); 
        const textMesh = new THREE.Mesh( textGeometry, textMaterial );
        textMesh.rotation.y = Math.PI

        /*
        fontMesh.geometry.computeBoundingBox();
        const boundingBox = fontMesh.geometry.boundingBox.clone();
        console.log('font bounding box coordinates: ' + 
            '(' + boundingBox.min.x + ', ' + boundingBox.min.y + ', ' + boundingBox.min.z + '), ' + 
            '(' + boundingBox.max.x + ', ' + boundingBox.max.y + ', ' + boundingBox.max.z + ')' );
        App.shared().scene().add( fontMesh );
        */

        return textMesh
    }
}

        // Do some optional calculations. This is only if you need to get the
        // width of the generated text
        //textGeom.computeBoundingBox();
        //textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;



export { Font }