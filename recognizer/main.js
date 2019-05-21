


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

  class PuzzlePiece extends BaseObject {
      // this class puts several blocks next to each other and then adds
      // a edges wireframe around it
    init() {
        
    

    }
  }


  /*

  class JSScript extends ResourceLoaderBase {
    init() {
        super.init()
        this.newSlot("importer", null);
        this.newSlot("fullPath", null);
        this.newSlot("doneCallback", null);
    }

    run () {
        const script = document.createElement("script")

        //console.log("JSScript loading: '" + this.fullPath() + "'")

        script.src = this.fullPath()

        script.onload = () => {
            //console.log("loaded script src:'" + script.src + "' type:'" + script.type + "' text:[[[" + script.text + "]]]")
            this._doneCallback()
        }

        script.onerror = (error) => {
            this.importer().setError(error)
            throw new Error("missing url " + this.fullPath())
        }

        const parent = document.getElementsByTagName("head")[0] || document.body
        parent.appendChild(script)
    }

    basePath () {
        const parts = this.fullPath().split("/")
        parts.pop()
        const basePath = parts.join("/")
        return basePath
    }
}
*/

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

        
        //THREE.EventDispatcher.prototype.apply( THREE.OBJMTLLoader.prototype ); 

        this.setup()


    }

    newSpotlight() {
        const light = new THREE.SpotLight(0xaaaaaa);
        light.position.set(1500, 3500, 1500);
        light.castShadow = true;

        const detail = 4
        light.shadow.mapSize.width  = 512 * detail;
        light.shadow.mapSize.height  = 512 * detail;
        //light.shadowCameraVisible = true;
        return light       
    }

    setup() {            

        this.setCamera(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 10000));
        this.setScene(new THREE.Scene());
        this.scene().fog = new THREE.Fog( 0x000000, .1, 5000);
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

        //this.setupTestSquare()
        this.setupTestObject()     
        //this.loadModel("Hg_carrier")           
        //this.loadModel("carrier")           
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
        this.renderer().shadowMap.enabled = true;
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
        //plane.addOutline()
        this.scene().add( plane );
    }

    setupTestObject() {
        const geometry = new THREE.CubeGeometry(10,10,10);
        //geometry.normalize()
        
        //var geometry = new THREE.IcosahedronGeometry(100, 0)
        //var geometry = new THREE.OctahedronGeometry(100, 0)
        //var geometry = new THREE.TetrahedronGeometry(100, 0)
        //var geometry = new THREE.DodecahedronGeometry(100, 0)

        const material = new THREE.MeshPhongMaterial( { 
                color: 0xdddddd, 
                specular: 0x333300, 
                shininess: 30, 
                flatShading: true
        }) 

        const group = new THREE.Object3D()
        group.position.set(0,5,0)

        const object = new THREE.Mesh(geometry, material);
        object.position.set(0,0,0)
        group.add( object );

        const object2 = new THREE.Mesh(geometry, material);
        object2.position.set(5,0,0)
        group.add( object2 );

        group.recursiveSetColor(0x111111)
        group.recursiveSetOpacity(0)

        group.addOutline()
        this.scene().add( group );
    }

    setupFloor() {
        //this.setupFloorPlane()
        this.setupFloorWire()
    }

    setupFloorPlane() {
        //const floorGeometry = new THREE.CubeGeometry(100000, .5, 100000, 10, 10);
        const floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 1, 1);
        //var floorMaterial = new THREE.MeshLambertMaterial({ color: 0x3d518b });
        //var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        //var floorGeometry = new THREE.PlaneBufferGeometry( 20000, 20000, 30, 30 );
        var material = new THREE.MeshLambertMaterial( {
            //color: 0x0000ff, 
            ambient: 0x0000ff, 
            wireframe: false, 
            //wireframeLinewidth: 4,
            //linewidth: 4,
            fog:true,
            side: THREE.DoubleSide
        } );
        
        const floor = new THREE.Mesh(floorGeometry, material);
        //floorWire.rotation.x = -Math.PI/2

        //floor.rotation.x = Math.PI/2
        floor.position.x = 0;
        floor.position.y = 0;
        floor.position.z = 0;
        floor.receiveShadow = true;
        this.scene().add( floor );
    }

    setupFloorWire() {
        const floorWireGeometry = new THREE.PlaneGeometry( 10000, 10000, 30, 30);
        
        const material2 = new THREE.LineBasicMaterial( 
            {
                color: 0xffffff, 
                linewidth: 1,
                fog:true,
                //transparent: true,
                //opacity:1,
            }
        );

        const material = new THREE.MeshLambertMaterial( {
            color: 0xffffff, 
            wireframe: true, 
            wireframeLinewidth: 10,
            fog: true,
        } );
    
        const floorWire = new THREE.Mesh( floorWireGeometry, material);
        //floorWire.rotation.z += -Math.PI/4
        floorWire.rotation.x = -Math.PI/2
        floorWire.position.y += 0.00
        floorWire.receiveShadow = true;
        this.scene().add( floorWire );
    }

    loadModel(modelName) {
        console.log("loading '" + modelName + "'...")
        //const loader = new THREE.OBJMTLLoader();
        const loader = new THREE.OBJLoader();
        //const loader = new THREE.ObjectLoader();
        const callback = (event) => { this.didFinishLoadModel(event, modelName) };
        //loader.load("models/" + modelName + ".obj", "models/" + modelName +".mtl", callback, (event) => { this.didFinishLoadModel(event) });    
        loader.load("models/" + modelName + ".obj", callback);    
        //loader.addEventListener("load", callback );
    }

    didFinishLoadModel(object, modelName) {
        console.log("loaded '" + modelName + "'")

        //object.moveToOrigin()
        //object.scaleToUnit()
        
        //object.makeCastShadow()
        //object.makeDoubleSided()
        //object.recursiveSetColor(0x004400)
        object.recursiveSetColor(0x222222)
        //object.recursiveSetColor(0x000000)
        object.makeCastShadow()
        
        object.addOutline(0xff6600, 6, 0.5)
        //object.addOutline(0xff6600, 10, .5) // glow

        const outline = object.asEdgesObject(0xff6600, 10, .5)
        this.mainObject().add(outline);

        //this.mainObject().add(object);
        
        const ms = 100 / this.mainObject().radius()
        this.mainObject().scale.set(ms, ms, ms)

        this.spotlight().target = object
    }

    updateCamera() {
        const speed = 1 / 500
        
        const mainRadius = 100 //this.mainObject().radius()/4
        const r = mainRadius 
        const t = this.time()
        
        // the x-z horizon plane
        const f = 4.5
        this.camera().position.x = f * r * Math.cos(speed * t)
        this.camera().position.z = f * r * Math.sin(speed * t)
        
        // y is height
        this.camera().position.y = 1*r + 3 * r * Math.cos(speed * t * 0.5)
       //this.camera().position.y = 3*r

        /*
        const ymin = 3
        if (this.camera().position.y < ymin) {
            this.camera().position.y = ymin
        }
        */
        //this.mainObject().rotation.y += .05
        
        const p = this.mainObject().position.clone()
        p.y *= 1
        //const p = this.mainObject().centerPoint()
        this.camera().lookAt(p)
    }

    render() {
        this.setTime(this.time() + 2)

        this.updateCamera()
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
        //const w = Math.floor(window.innerWidth / f);
        //const h = Math.floor(window.innerHeight / f);
        const w = window.innerWidth  / f;
        const h = window.innerHeight / f;
        this.renderer().setSize(w, h);
    }

    run() {
        this.animate();
    }
}


window.onload = function() {
    app = App.clone()
    app.run()
}

