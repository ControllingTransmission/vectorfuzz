
"use strict"

import { BaseObject } from './BaseObject.js';
import { Models } from './Models.js';
import { Model } from './Model.js';
import { Grid } from './Grid.js';
import { Chunk } from './Chunk.js';

class App extends BaseObject {
    init() {
        super.init()
        this.newSlot("container", null);
        this.newSlot("controls", null);
        // subclasses should override to initialize

        this.newSlot("camera", null);
        this.newSlot("scene", null);
        this.newSlot("renderer", null);
        this.newSlot("composer", null);

        this.newSlot("time", null);
        this.newSlot("mainObject", null);
        this.newSlot("spotlight", null);
        this.newSlot("objects", null);
        this.newSlot("grid", Grid.clone());

        this.setup()
    }

    addObject(obj) {
        this.objects().push(obj)
        this.scene().add(obj)
    }

    removeObject(obj) {
        this.objects().remove(obj)
        this.scene().remove(obj)
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

    onKeydown(event) {
        const char = String.fromCharCode(event.keyCode)
        console.log("onKeydown '" + char + "'")
        if (char === " ") {
            this.chooseCameraTargetPosition()
        }
        //this.camera().
    }

    setupScene() {
        this.setScene(new THREE.Scene());
        this.scene().background = new THREE.Color( 0, 0, 0 );
        //this.scene().fog = new THREE.Fog( 0x000000, .1, 5000);
        //this.scene().fog = new THREE.Fog( 0x000000, 0, 15000);
    }

    chooseCameraTargetPosition() {
        const max = 1000
        this.camera().targetPosition.x = Math.random() * max - max/2;
        this.camera().targetPosition.y = Math.random() * max / 2;
        this.camera().targetPosition.z = Math.random() * max - max/2;
    }

    setupCamera() {
        this.setCamera(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 100000));
        //this.setControls(new THREE.OrbitControls(this.camera()));
        //this.controls().addEventListener("change", render );
        this.camera().targetPosition = new THREE.Vector3()
        this.camera().velocity = new THREE.Vector3()
        this.camera().velocity.x = 0
        this.camera().velocity.z = 50
        this.camera().position.y = 600
        this.camera().position.z = -6000
    }

    setup() {     
        this.setupCamera()
        this.setupScene()

        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene().add(ambientLight);
        
        //this.setupComposer()
        //this.setupCSSRenderer()
        //this.setupRenderer()
        this.setupSVGRenderer()
        //this.setupCanvasRenderer()

        // objects

        //this.setupTestSquare()
        //this.setupTestObject()    
        
        //this.loadModel("Hg_carrier")           
        //this.loadModel("carrier")           
        //this.loadModel("Recognizer")

        const group = Models.shared().objectNamed("Recognizer.obj")

        const modelPath = "models/Recognizer.obj"
        this.didLoadObject(group)
        //Model.clone().setPath(modelPath).setDelegate(this).load()

        //this.setupFloor()

        window.addEventListener("resize", (event) => { this.onWindowResize(event) }, false);
        this.onWindowResize()

        document.body.addEventListener("keydown", (event) => this.onKeydown(event), false);
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

    setupRenderer() {
        const renderer = new THREE.WebGLRenderer();
        this.setRenderer(renderer);
        this.setupRendererOptions()

        const container = document.getElementById("container");
        this.setContainer(document.createElement("div"))
        document.body.appendChild(this.container());
        this.container().appendChild( this.renderer().domElement );
    }

    /*
    setupCSSRenderer() {
        const renderer = new THREE.CSS3DRenderer();
        this.setRenderer(renderer);
        document.body.appendChild(renderer.domElement);
    }
    */

    //

    setupTestSquare() {
        const geometry = new THREE.PlaneGeometry( 200, 200, 1, 1);
        const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
        const plane = new THREE.Mesh( geometry, material );
        //plane.addOutline()
        this.scene().add( plane );
    }

    setupTestObject() {
        const geometry = new THREE.CubeGeometry(100,100,100);
        //geometry.normalize()
        
        //var geometry = new THREE.IcosahedronGeometry(100, 0)
        //var geometry = new THREE.OctahedronGeometry(100, 0)
        //var geometry = new THREE.TetrahedronGeometry(100, 0)
        //var geometry = new THREE.DodecahedronGeometry(100, 0)

        /*
        const material = new THREE.MeshPhongMaterial( { 
                color: 0xffffff, 
                specular: 0x333300, 
                shininess: 30, 
                flatShading: true
        }) 
        */

        const material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.1, linewidth: 1 } );


        const group = new THREE.Object3D()
        group.position.set(0,0,0)

        const object = new THREE.Mesh(geometry, material);
        object.position.set(0,0,0)
        object.scale.multiplyScalar( 0.8 );
        group.add( object );

        /*
        const object2 = new THREE.Mesh(geometry, material);
        object2.position.set(5,0,0)
        object2.scale.multiplyScalar( 1.01 );
        group.add( object2 );
        */

        //group.recursiveSetColor(0x111111)
        //group.recursiveSetOpacity(0)
        const outline = group.asEdgesObject(0x0000ff, 3, 3)
        this.scene().add( outline );
        this.scene().add( group );

        //group.addOutline()
        //this.scene().add( group );
    }

    setupFloor() {
        //this.setupFloorPlane()
        //this.setupFloorWire()
        this.setupFloorLines()
        //this.setupFloorGrid()
    }

    floorSize() {
        return 10000
    }

    setupFloorPlane() {
        const size = this.floorSize()
        //const floorGeometry = new THREE.CubeGeometry(size, .5, size, 10, 10);
        //const floorWireGeometry = new THREE.PlaneGeometry( size, size, 30, 30);
        const floorGeometry = new THREE.PlaneGeometry( size, size, 1, 1);
        //var floorMaterial = new THREE.MeshLambertMaterial({ color: 0x3d518b });
        //var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        //var floorGeometry = new THREE.PlaneBufferGeometry( 20000, 20000, 30, 30 );
        var material = new THREE.MeshLambertMaterial( {
            color: 0x0000ff, 
            wireframe: false, 
            fog:true,
            side: THREE.DoubleSide
        } );


        //floor.recursiveSetColor(0x0000ff)

        const floor = new THREE.Mesh(floorGeometry, material);
        //floorWire.rotation.x = -Math.PI/2

        floor.rotation.x = -Math.PI/2
        floor.position.x = 0;
        floor.position.y = 0;
        floor.position.z = 0;
        floor.receiveShadow = true;
        this.scene().add( floor );
    }

    setupFloorLines() {
        const size = this.floorSize()
        /*
        const geometry = new THREE.Geometry();
        const f = 10
        geometry.vertices.push(new THREE.Vector3(- f*size/2, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3(  f*size/2, 0, 0 ) );

        const color = 0x0000ff;
        //const color = rainbowColor();
        const linesMaterial = new THREE.LineBasicMaterial( { color: color, opacity: .2, linewidth: 3 } );
	    //var linesMaterial = new THREE.MeshBasicMaterial({wireframe:true});
        */
        const max = 40
        for (let i = -max/2; i <= max/2; i ++ ) {
            
            //let line = new THREE.Line( geometry, linesMaterial );

            const line = this.newFloorLine()
            line.position.z = i * (size/max);
            line.position.y = 0
            this.scene().add( line );
        }
        
    }

    setupFloorGrid(dy) {
        if (!dy) { dy = 0; }
        const size = this.floorSize()
        const grid = new THREE.GridHelper( size, 30, 0xffffff, 0xffffff  );
        //grid.scale.multiplyScalar(0.1)
        //grid.setColors( 0xffffff, 0xffffff );
        //grid.rotation.z += -Math.PI/2
        grid.position.y += dy
        this.scene().add( grid );
        grid.recursiveSetLineWidth(10)
    }

    setupFloorWire() {
        const floorWireGeometry = new THREE.PlaneGeometry( 10000, 10000, 30, 30);
        
        const lineMaterial = new THREE.LineBasicMaterial( {
            color: 0xffffff,
            linewidth: 10,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin:  'round' //ignored by WebGLRenderer
        } );

        const meshMaterial = new THREE.MeshLambertMaterial( {
            color: 0xffffff, 
            wireframe: true, 
            wireframeLinewidth: 10,
            fog: true,
        } );
    
        const floorWire = new THREE.Mesh( floorWireGeometry, meshMaterial);
        //floorWire.rotation.z += -Math.PI/4
        floorWire.rotation.x = -Math.PI/2
        floorWire.position.y += 0.01
        floorWire.receiveShadow = true;
        this.scene().add( floorWire );
    }

    didLoadModel(model) {
        const obj = model.object()
        this.didLoadObject(obj)
    }

    didLoadObject(obj) {
        this.scene().add(obj)
        this.lookAtObject(obj)
    }

    updateCameraForTargetPosition() {
        const cam = this.camera()
        const diff = cam.targetPosition.clone().add(cam.position.clone().negate())

        const r = 0.05

        cam.position.x += diff.x * r;
        cam.position.y += diff.y * r;
        cam.position.z += diff.z * r;

        //console.log("diff.length = ", diff.length)
        if (diff.length() < 2) {
            //this.chooseCameraTargetPosition()
        }
    }

    updateCameraToWatchMainObject() {
        const speed = 1 / 500
        
        const mainRadius = 100 //this.mainObject().radius()/4
        const r = mainRadius 
        const t = this.time()
        
        // the x-z horizon plane
        const f = 6
        this.camera().position.x = f * r * Math.cos(speed * t)
        this.camera().position.z = - f * r * Math.sin(speed * t)
        
        // y is height
        this.camera().position.y = 2*r + 0.5 * r * Math.cos(speed * t * 0.5)
        this.lookAtObject(this.mainObject())
    }

    updateCamera() {
        const cam = this.camera()

        cam.position.x += cam.velocity.x
        cam.position.y += cam.velocity.y
        cam.position.z += cam.velocity.z
        
        const p = new THREE.Vector3(cam.position.x, cam.position.y, cam.position.z + 100)
        this.camera().lookAt(p)

    }

    newFloorLine() {
        const size = this.floorSize()
        const geometry = new THREE.Geometry();
        const f = 10

        geometry.vertices.push(new THREE.Vector3(- f*size/2, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3(  f*size/2, 0, 0 ) );

        const color = 0x0000ff;
        const linesMaterial = new THREE.LineBasicMaterial( { color: color, opacity: .2, linewidth: 3 } );
        const line = new THREE.Line( geometry, linesMaterial );
        //line.position.z = i * (size/max);
        line.position.y = 0
        return line
    }

    updateFloor() {
        const line = this.newFloorLine()
        line.position.z = this.camera().position.z + 3000
        this.scene().add( line );
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

        //this.updateFloor()
        this.updateCamera()
        this.grid().update()

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
    }

    addSVGFilters() {
        const svgElements = document.getElementsByTagName("svg");
        const pathElements = svgElements[1].getElementsByTagName("path");
        
        for (let i = 0; i < pathElements.length; i ++) {
            const e = pathElements[i]
            e.style.filter = "url(#glow)";
            //e.style.overflow = "visible"; 
        }
    }

    animate() {
        requestAnimationFrame( () => { this.animate() } );
        this.render();
        this.addSVGFilters()
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

window.onload = function() {
    window.app = App.clone()
    app.run()
}

function rainbowColor() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const color = colors[Math.floor(Math.random() * colors.length)]
    return color
}

export { App }