
"use strict"

import { BaseObject } from './BaseObject.js';
import { App } from './App.js';

class Font extends BaseObject {

    init() {
        super.init()
        this.newSlot("path", "fonts/helvetiker_bold.typeface.json");
        this.newSlot("font", null);
    }

    meshForText(text) {
        //var loader = new THREE.FontLoader(); 
        //var font = loader.parse(helveticaRegular); 
        var textGeometry = new THREE.TextGeometry( 'Hello three.js!', { font: this.font(), size: 1, height: 0.1, curveSegments: 20 } ); 
        var textMaterial = new THREE.MeshBasicMaterial( { color: 0xFF0000 } ); 
        var textMesh = new THREE.Mesh( textGeometry, textMaterial );
        
        return textMesh
    }

    load() {
        const loader = new THREE.FontLoader();
        const font = loader.load(
            this.path(),
            ( font )  => { this.onLoad(font) },
            ( xhr )   => { this.onProgress(xhr) }, 
            ( error ) => { this.onError(error) }
        );
        this.setFont(font)
    }

    onProgress(xhr) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    }

    onLoad(font) {
        this.setFont(font)
        const fontMesh = this.meshForText("Hello world!")
        App.shared().scene().add( fontMesh );
    }

    onError(error) {
        console.log("Font error:", error );

    }

}

        // Do some optional calculations. This is only if you need to get the
        // width of the generated text
        //textGeom.computeBoundingBox();
        //textGeom.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;



export { Font }