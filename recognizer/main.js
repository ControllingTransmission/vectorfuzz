
if (!String.prototype.capitalized) {
    String.prototype.capitalized = function () {
        return this.replace(/\b[a-z]/g, function (match) {
            return match.toUpperCase();
        });
    }
}

// ----------------------------------------------------------------------------------

class BaseObject {
    static shared() {
        if (!this._shared) {
            this._shared = this.clone()
        }
        return this._shared
    }
  
    type() {
        return this.constructor.name
    }
  
    static clone() {
        const obj = new this()
        obj.init()
        return obj
    }
  
    init() {
        // subclasses should override to initialize
    }
  
    newSlot(slotName, initialValue) {
        if (typeof(slotName) !== "string") {
            throw new Error("slot name must be a string"); 
        }
  
        if (initialValue === undefined) { 
            initialValue = null 
        };
  
        const privateName = "_" + slotName;
        this[privateName] = initialValue;
  
        if (!this[slotName]) {
            this[slotName] = function () {
                return this[privateName];
            }
        }
  
        const setterName = "set" + slotName.capitalized()
  
        if (!this[setterName]) {
            this[setterName] = function (newValue) {
                this[privateName] = newValue;
                //this.updateSlot(slotName, privateName, newValue);
                return this;
            }
        }
  
        return this;
    }
  }

  // ----------------------------------------------------------------------------------

class App extends BaseObject {
    init() {
        super.init()
        this.newSlot("container", null);
        this.newSlot("controls", null);
        // subclasses should override to initialize

        this.newSlot("camera", null);
        this.newSlot("scene", null);
        this.newSlot("renderer", null);

        this.newSlot("time", null);
        this.newSlot("mainObject", null);
        this.newSlot("spotlight", null);

        this.setup()
    }

    newSpotlight() {
        const light = new THREE.SpotLight(0xaaaaaa);
        light.position.set(1500, 3500, 1500);
        light.castShadow = true;

        const detail = 4
        light.shadowMapWidth  = 512 * detail;
        light.shadowMapHeight = 512 * detail;
        //light.shadowCameraVisible = true;
        return light       
    }

    setup() {            

        this.setCamera(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 10000));
        this.setScene(new THREE.Scene());
        //this.scene().fog = new THREE.Fog( 0x000000, .1, 10000);
        //this.scene().fog = new THREE.Fog( 0x000000, 0, 15000);
        //this.setControls(new THREE.OrbitControls(this.camera()));
        //this.controls().addEventListener("change", render );

        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene().add(ambientLight);

        const mainObject = new THREE.Object3D();
        this.setMainObject(mainObject)
        mainObject.position.set(0,52,0)
        mainObject.position.set(0,152,0)
        this.scene().add(mainObject)
        
        this.setSpotlight(this.newSpotlight())
        this.scene().add(this.spotlight());    
        this.spotlight().target = this.mainObject()

        this.setupTestSquare()
        //this.setupTestObject()     
        //this.loadModel("Hg_carrier")           
        //this.loadModel("Recognizer")

        this.setupFloor()
        this.setupRenderer()

        window.addEventListener("resize", (event) => { this.onWindowResize(event) }, false);
        this.onWindowResize()
    }

    setupRenderer() {
        this.setRenderer(new THREE.WebGLRenderer());
        this.renderer().setClearColor(0x000000, 1.0);
        this.renderer().setSize(window.innerWidth, window.innerHeight);
        this.renderer().shadowMapEnabled = true;
        this.renderer().shadowMapSoft = true;

        this.setContainer(document.createElement("div"))
        document.body.appendChild(this.container());
        this.container().appendChild( this.renderer().domElement );
    }

    setupTestSquare() {
        // square
        var geometry = new THREE.PlaneGeometry( 200, 200, 1, 1);
        var material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
        plane.addOutline()
        this.mainObject().add( plane );
    }

    setupTestObject() {
        const geometry = new THREE.CubeGeometry(100,100,100);
        //var geometry = new THREE.IcosahedronGeometry(100, 0)
        //var geometry = new THREE.OctahedronGeometry(100, 0)
        //var geometry = new THREE.TetrahedronGeometry(100, 0)
        //var geometry = new THREE.DodecahedronGeometry(100, 0)

        const material = new THREE.MeshPhongMaterial( { 
                ambient: 0x111111, 
                color: 0xdddddd, 
                specular: 0x333300, 
                shininess: 30, 
                shading: THREE.FlatShading 
        }) 
        
        const object = new THREE.Mesh(geometry, material);
        object.position.set(0,0,0)
        object.makeCastShadow()
        object.recursiveSetColor(0x111111)
        //object.recursiveSetColor(0x000000)
        object.addOutline()

        this.mainObject().add( object );
    }

    setupFloor() {
        this.setupFloorPlane()
        this.setupFloorWire()
    }

    setupFloorPlane() {
        const floorGeometry = new THREE.CubeGeometry(100000,.5,100000);
        //var floorMaterial = new THREE.MeshLambertMaterial({ color: 0x3d518b });
        //var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        //var floorGeometry = new THREE.PlaneBufferGeometry( 20000, 20000, 30, 30 );
        var material = new THREE.MeshLambertMaterial( {
            //color: 0x0000ff, 
            ambient: 0x0000ff, 
            wireframe: false, 
            //wireframeLinewidth: 4,
            //fog:true,
            side: THREE.DoubleSide
        } );
        
        const floor = new THREE.Mesh(floorGeometry, material);
        //floor.rotation.x = 3.14159/2
        floor.position.x = 0;
        floor.position.y = 0;
        floor.position.z = 0;
        floor.receiveShadow = true;
        this.scene().add( floor );

    }

    setupFloorWire() {
        const floorWireGeometry = new THREE.PlaneGeometry( 20000, 20000, 30, 30 );
        const material = new THREE.MeshLambertMaterial( {
            color: 0xffffff, 
            ambient: 0x0000ff, 
            wireframe: true, 
            wireframeLinewidth: 1,
            fog:true,
            //transparent: true,
            //opacity:.5,
            side: THREE.DoubleSide
            } );
        const floorWire = new THREE.Mesh( floorWireGeometry, material );
        //floorWire.rotation.z += -3.14159/4
        floorWire.rotation.x = -3.14159/2
        floorWire.position.y += 1
        //floorWire.receiveShadow = true;
        this.scene().add( floorWire );
    }

    loadModel(modelName) {
        console.log("loading...")
        const loader = new THREE.OBJMTLLoader();
        //const loader = new THREE.ObjectLoader();
        loader.load("models/" + modelName + ".obj", "models/" + modelName +".mtl");    
        loader.addEventListener("load", (event) => { this.didFinishLoadModel(event) } );
    }

    didFinishLoadModel(event) {
        console.log("loaded")

        const object = event.content
        //object.makeCastShadow()
        //object.makeDoubleSided()
        //object.recursiveSetColor(0x004400)
        //object.recursiveSetColor(0x552222)
        object.recursiveSetColor(0x000000)
        object.makeCastShadow()

        //const group = new THREE.Object3D();
        //group.add(object)
        
        object.addOutline(0xff6600, 3, 1)
        //object.addOutline(0xff6600, 10, .5) // glow

        this.mainObject().add(object);
        
        const ms = 100 / this.mainObject().radius()
        this.mainObject().scale.set(ms, ms, ms)

        this.spotlight().target = object
    }

    updateCamera() {
        const speed = 1 / 500
        //this.camera().position.y += .01
        const r = this.mainObject().radius() * 15
        this.camera().position.x = r * Math.cos(speed * this.time())
        this.camera().position.y = this.mainObject().radius() * 20 + r * Math.cos(speed * this.time() * 1.5)
        this.camera().position.z = r * Math.sin(speed * this.time())
        
        //this.mainObject().rotation.y += .05
        
        const p = this.mainObject().position.clone()
        //p.y *= 6
        this.camera().lookAt(p)
    }

    render() {
        if (this.mainObject()) {
            this.setTime(this.time() + 6)

            this.updateCamera()

            if (this.mainObject().step) {
                this.mainObject().step()
                /*
                this.mainObject().step = function() {
                    this.rotation.x += .005
                    this.rotation.y += .005   
                }
                */
            }
        }

        this.renderer().render(this.scene(), this.camera());
    }


    animate() {
        requestAnimationFrame( () => { this.animate() } );
        this.render();
    }

    onWindowResize() {
        const f = 1
        this.camera().aspect = window.innerWidth / window.innerHeight;
        this.camera().updateProjectionMatrix();
        const w = Math.floor(window.innerWidth / f);
        const h = Math.floor(window.innerHeight / f);
        this.renderer().setSize(w, h);
    }

    run() {
        this.animate();
    }
}

app = App.clone()

window.onload = function() {
    app.run()
}

