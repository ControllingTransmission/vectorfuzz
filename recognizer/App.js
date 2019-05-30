
"use strict"

import { BaseObject } from './BaseObject.js';
import defaultExport0 from './models/_Imports.js';
import defaultExport1 from './grids/_Imports.js';
import defaultExport2 from './fonts/_Imports.js'
import { ThreeBSP } from './external_libraries/ThreeCSG.js'


class App extends BaseObject {

    init() {
        super.init()
        this.newSlot("container", null);
        // subclasses should override to initialize

        this.newSlot("camera", null);
        this.newSlot("scene", null);
        this.newSlot("renderer", null);
        //this.newSlot("composer", null);

        this.newSlot("time", null);
        this.newSlot("mainObject", null);
        this.newSlot("spotlight", null);

        this.newSlot("grid", TypeGrid.clone());
        this.newSlot("floorGrid", FloorGrid.clone());
        //this.newSlot("tunnelGrid", TunnelGrid.clone());
        
        this.newSlot("keyboard", {});
        this.newSlot("shouldOrbit", false);

        this.setup()


        //this.newSlot("font", Fonts.shared().fontNamed("Hyperspace_Bold.json"));
        //this.scene().add(this.font().objectForText("CONTROLLING TRANSMISSION"))
    }

    newSpotlight() {
        const light = new THREE.SpotLight(0xaaaaaa);
        light.position.set(1500, 3500, 1500);
        light.castShadow = true;

        const detail = 4
        light.shadow.mapSize.width  = 512 * detail;
        light.shadow.mapSize.height = 512 * detail;
        //light.shadowCameraVisible = true;
        return light       
    }

    onKeyUp(event) {
        const char = String.fromCharCode(event.keyCode)
        //console.log("onKeyUp '" + char + "'")
        this.keyboard()[char] = false
    }

    onKeyDown(event) {
        const char = String.fromCharCode(event.keyCode)
        //console.log("onKeyDown '" + char + "'")
        if (!this.keyboard()[char]) {
            this.onFirstCharDown(char)
        }
        this.keyboard()[char] = true
    }

    onFirstCharDown(char) {
        if (char === " ") {
            this.chooseCameraTargetPosition()
        }

        if (char === "R") {
            //this.rotateAroundObject()
        }
    }

    updateKeyActions() {
        //this.chooseCameraTargetPosition()

        const cam = this.camera();

        if (this.keyboard()["S"]) { // rotate left
            cam.rotationalVelocity.y -= 0.01
        }

        if (this.keyboard()["F"]) { // rotate right
            cam.rotationalVelocity.y += 0.01
        }

        const v = new THREE.Vector3()
        cam.getWorldDirection(v)

        let r = 100
        if (this.keyboard()["E"]) { // move forward
            cam.velocity.x += r * v.x
            cam.velocity.z += r * v.z
            this.camera().targetObject = null
    }

        if (this.keyboard()["D"]) { // move backward
            cam.velocity.x -= r * v.x
            cam.velocity.z -= r * v.z
        }

        r = 10
        if (this.keyboard()["A"]) { // strafe left
            cam.velocity.x += r * v.z
            cam.velocity.z -= r * v.x
        }

        if (this.keyboard()["G"]) { // strafe right
            cam.velocity.x -= r * v.z
            cam.velocity.z += r * v.x
        }

        if (this.keyboard()["O"]) {
            this.setShouldOrbit(true)
        } else {
            this.setShouldOrbit(false)
        }
    }

    setupScene() {
        this.setScene(new THREE.Scene());
        this.scene().background = new THREE.Color( 0, 0, 0 );
        //this.scene().fog = new THREE.Fog( 0x000000, .1, 5000);
        //this.scene().fog = new THREE.Fog( 0x000000, 0, 15000);
    }

    chooseCameraTargetPosition() {
        const obj = this.grid().pickObject()

        if (!obj) {
            console.log("no object picked")
            return this
        }
        
        const cam = this.camera()
        cam.targetObject = obj
        cam.targetPosition = new THREE.Vector3()
        cam.targetPosition.copy(obj.position)
        cam.targetDistance = 3000

        const max = 100000
        cam.position.x += Math.random() * max - max/2;
        cam.position.y = Math.random() * max / 2;
        cam.position.z += Math.random() * max - max/2;

        cam.lookAt(cam.targetPosition)
        // pick a target rotation facing the target position
    }

    setupCamera() {
        this.setCamera(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 1000000));
        this.camera().velocity = new THREE.Vector3(0,0,0)
        this.camera().friction = 0.9

        this.camera().position.y = 0
        this.camera().position.z = -6000
        this.lookForward()

        this.camera().rotationalVelocity = new THREE.Vector3()
        this.camera().rotationalFriction = 0.9

    }

    lookForward() {
        const cam = this.camera()
        const p = new THREE.Vector3(cam.position.x, cam.position.y, cam.position.z + 1)
        cam.lookAt(p)
    }

    setup() {     
        this.setupCamera()
        this.setupScene()
        
        //this.setupWebGLRenderer()
        this.setupSVGRenderer()
        //this.setupCanvasRenderer()

        if (!this.isSVG()) {
            const ambientLight = new THREE.AmbientLight(0xffffff);
            this.scene().add(ambientLight);
        }
        
        this.setupEvents()
    }

    setupEvents() {
        window.addEventListener("resize", (event) => { this.onWindowResize(event) }, false);
        this.onWindowResize()

        document.body.addEventListener("keydown", (event) => this.onKeyDown(event), false);
        document.body.addEventListener("keyup", (event) => this.onKeyUp(event), false);
    }

    setupCSG() {
        var cube = CSG.cube();
        var sphere = CSG.sphere({ radius: 1.3 });
        var polygons = cube.subtract(sphere).toPolygons();

        /*
        var a = CSG.cube({ center: [-0.25, -0.25, -0.25] });
        var b = CSG.sphere({ radius: 1.3, center: [0.25, 0.25, 0.25] });

        // ----------------

        var a = CSG.cube();
        var b = CSG.sphere({ radius: 1.35, stacks: 12 });
        var c = CSG.cylinder({ radius: 0.7, start: [-1, 0, 0], end: [1, 0, 0] });
        var d = CSG.cylinder({ radius: 0.7, start: [0, -1, 0], end: [0, 1, 0] });
        var e = CSG.cylinder({ radius: 0.7, start: [0, 0, -1], end: [0, 0, 1] });
        */
    }

    /*
    setupSpotLight() {
        this.setSpotlight(this.newSpotlight())
        this.scene().add(this.spotlight());    
        this.spotlight().target = this.mainObject()
    }
    */

    setupRendererOptions() {
        this.renderer().setSize( window.innerWidth, window.innerHeight );
        this.renderer().setClearColor(0x000000, 1.0);
        this.renderer().setSize(window.innerWidth, window.innerHeight);
        this.renderer().shadowMap.enabled = true;
        this.renderer().shadowMapSoft = true;
    }

    setupSVGRenderer() {
        const renderer = new THREE.SVGRenderer();
        this.setRenderer(renderer);
        document.body.appendChild( renderer.domElement );
        this.setContainer(renderer.domElement)
        this.container().style.filter = "url(#glow);"
    }

    setupCanvasRenderer() {
        const canvas = document.getElementById("canvas");
        this.setContainer(canvas)
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.setRenderer(renderer);
        this.setupRendererOptions()
    }

    setupWebGLRenderer() {
        const renderer = new THREE.WebGLRenderer({antialias:true} );
        this.setRenderer(renderer);
        this.setupRendererOptions()

        const container = document.getElementById("container");
        this.setContainer(document.createElement("div"))
        document.body.appendChild(this.container());
        this.container().appendChild( this.renderer().domElement );
    }

    // ------------------------------------------

    
    updateCameraForTargetPosition() {
        const cam = this.camera()

        if (cam.targetObject) {
            cam.targetPosition = cam.targetObject.position

            const diff = cam.targetPosition.clone().add(cam.position.clone().negate())
            const d = diff.length()
            const td = cam.targetDistance
            const f = (d-td)/d

            const r = 0.085
            cam.position.x += f * diff.x * r;
            cam.position.y += f * diff.y * r;
            cam.position.z += f * diff.z * r;

            cam.lookAt(cam.targetPosition)

            //console.log("diff.length = ", diff.length)
            if (diff.length() < cam.targetDistance*1.1) {
                //this.chooseCameraTargetPosition()
                cam.targetObject = null
            }
        }
    }

    updateCamera() {
        const cam = this.camera()

        if (cam.targetObject) {
            this.updateCameraForTargetPosition()
        } else {
            cam.velocity.multiplyScalar(cam.friction)
            cam.rotationalVelocity.multiplyScalar(cam.rotationalFriction)

            cam.position.add(cam.velocity)
            cam.rotation.x += cam.rotationalVelocity.x
            cam.rotation.y += cam.rotationalVelocity.y
            cam.rotation.z += cam.rotationalVelocity.z
        }
    }

    // -----------------------------

    lookAtObject(obj) {
        const p = obj.position.clone()
        p.y *= 2
        //const p = obj.centerPoint()
        this.camera().lookAt(p)
    }

    render() {
        this.setTime(this.time() + 1)

        this.updateKeyActions()
        this.updateCamera()
        this.grid().update()
        this.floorGrid().update()

        this.renderer().render(this.scene(), this.camera());

        /*
        try {
            if (this.composer()) {
                this.composer().render()
            } else {
                this.renderer().render(this.scene(), this.camera());
            } 
        } catch(e) {
            console.log("render error: ", e)
            console.log("-----------------")
        }
        */
    }

    addSVGFilters() {
        const svgElements = document.getElementsByTagName("svg");
        if (svgElements[1]) {
            const pathElements = svgElements[1].getElementsByTagName("path");
            
            for (let i = 0; i < pathElements.length; i ++) {
                const e = pathElements[i]
                e.style.filter = "url(#glow)";
                //e.style.overflow = "visible"; 
            }
        }
    }

    isSVG() {
        return this.renderer().constructor === THREE.SVGRenderer
    }

    animate() {
        requestAnimationFrame( () => { this.animate() } );
        this.render();
        if (this.isSVG()) {
            this.addSVGFilters()
        }
    }

    onWindowResize() {
        const w = window.innerWidth
        const h = window.innerHeight
        this.camera().aspect = w / h;
        this.camera().updateProjectionMatrix();
        this.renderer().setSize(w, h);
    }

    run() {
        this.animate();
    }


}

window.App = App

export { App }