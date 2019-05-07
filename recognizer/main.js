
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

        this.setupTestObject()
                
        this.loadModel()
        this.setupFloor()
        this.setupRenderer()
        this.camera().position.y = mainObject.radius() * 10;

        window.addEventListener("resize", (event) => { this.onWindowResize() }, false);
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

    setupTestObject() {
        const geometry = new THREE.CubeGeometry(100,100,100);
        //var geometry = new THREE.IcosahedronGeometry(100, 0)


        //var geometry = new THREE.OctahedronGeometry(100, 0)
        //var geometry = new THREE.TetrahedronGeometry(100, 0)
        //var geometry = new THREE.DodecahedronGeometry(100, 0)

        const material = new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0xdddddd, specular: 0x333300, shininess: 30, shading: THREE.FlatShading } ) 

        //console.log("THREE.Mesh = ", THREE.Mesh)
        //console.log("THREE.Mesh.prototype.castShadow = ", THREE.Mesh.prototype.castShadow)
        
        const object = new THREE.Mesh(geometry, material);
        object.position.set(0,0,0)
        this.mainObject().add( object );

        var geoLines = object.asLineObject(0xff6600, 3, 1)
        const s = 1.005
        geoLines.scale.set(s, s, s)
        this.mainObject().add( geoLines );
        
        object.makeCastShadow()

        object.recursiveSetColor(0x111111)
        /*
        const objectOutline = object.asLineObject(0xff6600, 3, 1)

        const s = 1.005
        objectOutline.scale.set(s, s, s)
        this.mainObject().add( objectOutline );
        */

        this.spotlight().target = object
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

    loadModel() {
        console.log("loading...")
        const loader = new THREE.OBJMTLLoader();
        //const loader = new THREE.ObjectLoader();
        loader.load("models/Recognizer.obj", "models/Recognizer.mtl");    
        loader.addEventListener("load", (event) => { this.didFinishLoadModel(event) } );
    }

    didFinishLoadModel(event) {
        const object = event.content
        console.log("loaded")
        //object.makeCastShadow()
        //object.makeDoubleSided()
        //object.recursiveSetColor(0x004400)
        object.recursiveSetColor(0x552222)
        object.makeCastShadow()

        const carrier = new THREE.Object3D();
        carrier.add(object)
        
        //const s = 1/10
        //carrier.scale.set(s, s, s)
        
        const carrierOutline = object.asLineObject(0xff6600, 3, 1)
        //const s = 1.001
        //carrierOutline.scale.set(s, s, s);
        carrier.add(carrierOutline)
            
        //carrier.scale.set(s,s,s)

        /*
        const glow = object.asLineObject(0xffff00, 20, .1)
        glow.recursiveSetColor(0xffffff)
        //glow.recursiveSetOpacity(.5)
        //glow.recursiveSetLineWidth(10)
            glow.scale.set(s, s, s);
            carrier.add(glow)
        */
        
        /*
        const m = carrierOutline.children[0].material
        m.wireframeLinewidth = 50
        m.needsUpdate = true
        */
        
        this.mainObject().add( carrier );
        
        this.spotlight().target = carrier
        
        carrier.maxz =  1500
        carrier.minz = -1500
        //carrier.position.set(0,3,0);
        //carrier.position.set(0,300,0);

        const radius = this.mainObject().radius()
        const s = 100 / radius
        this.mainObject().scale.set(s, s, s)
        console.log("carrier loaded radius: ", this.mainObject().radius())
    }

    render() {
        if (this.mainObject()) {
            this.setTime(this.time() + 6)
            const speed = 1 / 500
            //this.camera().position.y += .01
            const r = this.mainObject().radius() * 14
            this.camera().position.x = r * Math.cos(speed * this.time())
            this.camera().position.y = this.mainObject().radius() * 20 + r * Math.cos(speed * this.time() * 1.5)
            this.camera().position.z = r * Math.sin(speed * this.time())
            
            //this.mainObject().rotation.y += .05
            
            const p = this.mainObject().position.clone()
            //p.y *= 1/2
            this.camera().lookAt(p)
            
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
        this.renderer().setSize( window.innerWidth / f, window.innerHeight / f );
    }

    run() {
        this.animate();
    }
}

app = App.clone()

window.onload = function() {
    app.run()
}

