
"use strict"

import { BaseObject } from './BaseObject.js';
import defaultExport0 from './models/_Imports.js';
import defaultExport1 from './grids/_Imports.js';
import defaultExport2 from './fonts/_Imports.js'
import { ThreeBSP } from './external_libraries/ThreeCSG.js'
import CSG from './external_libraries/THREE-CSGMesh-master/CSGMesh.js'
import { Mutant } from './Mutant.js'
import { Label } from './Label.js'
import { LabelZ } from './LabelZ.js'
import { PlatonicSolid } from './PlatonicSolid.js'

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

        this.newSlot("grid", Grid.clone());
        this.newSlot("floorGrid", FloorGrid.clone());
        this.floorGrid().setIsEnabled(false)
        this.newSlot("starGrid", StarFieldGrid.clone());
        this.newSlot("tunnelGrid", TunnelGrid.clone());
        this.newSlot("showTunnel", true);
        
        this.newSlot("keyboard", {});
        this.newSlot("shouldOrbit", false);
        this.newSlot("objects", []);

        this.setup()
    }

    /*

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
    */

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
            //this.chooseCameraTargetPosition()
        }

        if (char === "R") {
            //this.rotateAroundObject()
        }

        if (char === "O") {
            this.setShouldOrbit(!this.shouldOrbit())
        }

        if (char === "C") {
            const to = this.camera().targetObject
            if (to) {
                to._shouldVibrateColor = !to._shouldVibrateColor
            }
        }


        if (char === "X") {
            const to = this.camera().targetObject
            if (to) {
                to._shouldVibrateScale = !to._shouldVibrateScale
            }
        }

        if (char === "V") {
            const to = this.camera().targetObject
            if (to) {
                to._shouldVibrateLineWidth = !to._shouldVibrateLineWidth
            }
        }

        if (char === "M") {
            const to = this.camera().targetObject
            if (to && to._owner && to._owner.mutate) {
                to._owner.mutate()
            }
        }
    
        if (char === "N") {
            const to = this.camera().targetObject
            if(to) {
                to._shouldVibrateColor = !to._shouldVibrateColor
                to._shouldVibrateScale = !to._shouldVibrateScale
                to._shouldVibrateLineWidth = !to._shouldVibrateLineWidth
            }
        }

        //console.log("char = '" + char + "'")

        if (char === "½") {
            this.camera().targetDistance = 0
        }

        if (char === "»") {
            this.camera().targetDistance = 3000
        }

        
        const n = Number.parseInt(char)
        if (!isNaN(n)) {
            //console.log("n = ", n)
            if (n < this.objects().length) {
                this.camera().targetObject = this.objects()[n].object()
                if (!this.tunnelGrid().isEnabled()) {
                    this.chooseRandomCameraPosition()
                }
            }
        }

        if (char === "J") {
            this.tunnelGrid().toggleEnabled()
            if (this.tunnelGrid().isEnabled()) {
                const cam = this.camera()
                const y = 500
                cam.position.set(0, y, 10000)
                cam.lookAt(new THREE.Vector3(0,y,10000))
            }

            this.starGrid().setIsEnabled(this.tunnelGrid().isEnabled())
            this.floorGrid().setIsEnabled(!this.tunnelGrid().isEnabled())
        }


        if (char === "G") {
            this.starGrid().setIsEnabled(false)
            this.floorGrid().setIsEnabled(false)
            this.tunnelGrid().setIsEnabled(false)
        }

        if (char === "H") {
            this.floorGrid().setIsEnabled(true)
            this.starGrid().setIsEnabled(false)
            this.tunnelGrid().setIsEnabled(false)
        }

    
        /*
        if (char === "T") {
            const to = this.camera().targetObject
            if(to && to.toggleSimple) {
                to.toggleSimple()
            }
        }
        */
        
    }

    updateKeyActions() {
        //this.chooseCameraTargetPosition()

        const cam = this.camera();

        /*
        if (this.keyboard()["S"]) { // rotate left
            cam.rotationalVelocity.y -= 0.01
        }

        if (this.keyboard()["F"]) { // rotate right
            cam.rotationalVelocity.y += 0.01
        }
        */

        const v = new THREE.Vector3()
        cam.getWorldDirection(v)

        let r = 100
        if (this.keyboard()["E"]) { // move forward
            const f = 0.6
            cam.velocity.x += r * v.x * f
            cam.velocity.z += r * v.z * f 
            this.camera().targetObject = null
    }

        if (this.keyboard()["D"]) { // move backward
            cam.velocity.x -= r * v.x
            cam.velocity.z -= r * v.z
        }

        /*
        r = 10
        if (this.keyboard()["A"]) { // strafe left
            cam.velocity.x += r * v.z
            cam.velocity.z -= r * v.x
        }

        if (this.keyboard()["G"]) { // strafe right
            cam.velocity.x -= r * v.z
            cam.velocity.z += r * v.x
        }
        */



        /*
        if (this.keyboard()["O"]) {
            this.setShouldOrbit(true)
        } else {
            this.setShouldOrbit(false)
        }
        */
    }

    setupScene() {
        this.setScene(new THREE.Scene());
        this.scene().background = new THREE.Color( 0, 0, 0 );
        //this.scene().fog = new THREE.Fog( 0x000000, .1, 5000);
        //this.scene().fog = new THREE.Fog( 0x000000, 0, 15000);
    }

    randomPlanePosition() {
        const max = 100000
        const p = new THREE.Vector3();
        p.x += Math.random() * max - max/2;
        p.y = 0;
        p.z += Math.random() * max - max/2;
        return p
    }

    chooseRandomCameraPosition() {
        const cam = this.camera()
        const to = cam.targetObject
        if (to) {
            cam.position.copy(to.position)
        }
        cam.position.add(this.randomPlanePosition())
        const max = 100000
        cam.position.y = Math.random() * max / 2;

        if (this.tunnelGrid().isEnabled()) {
            cam.position.y = 300
            cam.position.x = 0
        }
    }

    chooseCameraTargetPosition() {
        const obj = this.objects().pick().object()

        if (!obj) {
            console.log("no object picked")
            return this
        }
        
        const cam = this.camera()
        cam.targetObject = obj

        this.chooseRandomCameraPosition()



        cam.lookAt(cam.targetObject.position)
    }

    setupCamera() {
        this.setCamera(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 1000000));
        this.camera().velocity = new THREE.Vector3(0,0,0)
        this.camera().friction = 0.9

        this.camera().position.y = 500
        this.camera().position.z = -6000
        this.lookForward()

        this.camera().rotationalVelocity = new THREE.Vector3()
        this.camera().rotationalFriction = 0.9

        this.camera().targetDistance = 3000
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
        this.setupOjects()
    }

    setupEvents() {
        window.addEventListener("resize", (event) => { this.onWindowResize(event) }, false);
        this.onWindowResize()

        document.body.addEventListener("keydown", (event) => this.onKeyDown(event), false);
        document.body.addEventListener("keyup", (event) => this.onKeyUp(event), false);
    }

    addTextObject(text) {
        const p = this.randomPlanePosition()
        let label = Label.clone().setText(text)
        label.object().position.x = p.x
        label.object().position.z = p.z
        this.addObject(label)
        return label
    }

    setupOjects() {
        const mutant = Mutant.clone()
        mutant.object().position.z = -100000
        mutant.object().position.y = 500
        this.addObject(mutant)

        const cs = this.tunnelGrid().chunkSize()
        const offset = -cs/2

        let label = this.addTextObject("DONT BLINK")
        label.object().position.x = 0
        label.object().position.z = cs + offset

        label = this.addTextObject("OR")
        label.object().position.x = 0
        label.object().position.z = cs*2 + offset

        label = this.addTextObject("YOULL DIE")
        label.object().position.x = 0
        label.object().position.z = cs*3 + offset
        label.object()._shouldVibrateColor = true
        label.object()._shouldVibrateScale = true
        
        /*
        const obj = Models.shared().objectNamed("Recognizer.obj")
        obj.object = function() { return this }
        const s = 0.75
        obj.scale.set(s, s, s)
        obj.position.y -= 100
        this.addObject(obj)
        */

        /*
        this.addTextObject("DONT")
        this.addTextObject("BLINK")
        this.addTextObject("YOULL")
        this.addTextObject("DIE")
        */


        let zz = -2100000
        for (let i = 0; i < 5; i++) {
            const solid = PlatonicSolid.clone().setNumber(i)
            solid.object().position.z = zz
            zz += cs
            this.addObject(solid)
        }
    

    }

    addObject(obj) {
        this.objects().push(obj)
        this.scene().add(obj.object())
    }

    removeObject(obj) {
        this.objects().remove(obj)
        this.scene().remove(obj.object())
    }

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
        //this.container().style.filter = "url(#glow);"
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
            const tp = cam.targetObject.position;
            const diff = tp.clone().add(cam.position.clone().negate())
            const d = diff.length()

            if (this.shouldOrbit()) {
                const dx = diff.x;
                const dz = diff.z;
                const d = Math.sqrt((dx*dx) + (dz*dz));
                let angle = Math.atan2(dz, dx);
                angle += 0.01 + Math.PI;
                cam.position.x = tp.x + d * Math.cos(angle);
                cam.position.z = tp.z + d * Math.sin(angle);
            } 
            
            if (d > cam.targetDistance * 1.1) {
                const td = cam.targetDistance;
                const f = (d - td) / d;
                const r = 0.085;
                cam.position.x += f * diff.x * r;
                cam.position.y += f * diff.y * r;
                cam.position.z += f * diff.z * r;
            } 

            /*
            if (d < cam.targetDistance ) {
                const td = cam.targetDistance;
                const f = (d - td) / d;
                const r = 1;
                cam.position.x -= f * diff.x * r;
                cam.position.y -= f * diff.y * r;
                cam.position.z -= f * diff.z * r;
            } 
            */

            cam.lookAt(tp)
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
        //this.grid().update()
        this.tunnelGrid().update()
        this.floorGrid().update()
        this.starGrid().update()

        this.objects().forEach((obj) => { obj.update() })

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