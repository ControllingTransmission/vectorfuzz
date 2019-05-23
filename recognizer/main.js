


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
        this.newSlot("composer", null);

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

        this.setCamera(new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 100000));
        this.setScene(new THREE.Scene());
        this.scene().background = new THREE.Color( 0, 0, 0 );

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

        //this.setupComposer()
        //this.setupCSSRenderer()
        //this.setupRenderer()
        this.setupSVGRenderer()
        //this.setupCanvasRenderer()

        // objects

        //this.setupTestSquare()
        //this.setupTestObject()    
        
        //const tube = aTubeObject()
        //this.scene().add(tube)

        //this.loadModel("Hg_carrier")           
        //this.loadModel("carrier")           
        this.loadModel("Recognizer")

        this.setupFloor()


        window.addEventListener("resize", (event) => { this.onWindowResize(event) }, false);
        this.onWindowResize()
    }

    /*
    setupComposer() {
        this.setupRenderer()

        var targetOpts = { 	
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat
        };
    
        var target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, targetOpts);
        var composer = new THREE.EffectComposer( this.renderer(), target );
    
        // 1st render pass: render regular scene
        var renderPass = new THREE.RenderPass( this.scene(), this.camera() );
        
        // 2nd render pass: apply line thickness effect to the wireframe(horizontal and vertical)
        const lineShader = new THREE.ShaderPass( THREE.ThickLineShader )
        lineShader.uniforms.totalWidth.value = 10;
        lineShader.uniforms.totalHeight.value = 10;
        
    
        // 3nd render pass: apply line thickness diagonally (45 degrees)
        // diagLineShader = new THREE.ShaderPass( THREE.ThickLineShader )
        // diagLineShader.uniforms.totalWidth.value = width;
        // diagLineShader.uniforms.totalHeight.value = height;
        // diagLineShader.uniforms.diagOffset.value = 1;
    
        composer.addPass( renderPass );
        composer.addPass( lineShader );
        // composer.addPass( diagLineShader );
    
        lineShader.renderToScreen = true;
        lineShader.uniforms.edgeWidth.value = 10

        this.setComposer(composer)   
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

    setupCSSRenderer() {
        const renderer = new THREE.CSS3DRenderer();
        this.setRenderer(renderer);
        document.body.appendChild(renderer.domElement);
    }

    //

    setupTestSquare() {
        // square
        var geometry = new THREE.PlaneGeometry( 200, 200, 1, 1);
        var material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
        var plane = new THREE.Mesh( geometry, material );
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
        /*
        var geometry = new THREE.BoxGeometry(5,5,5);
        var material = new THREE.MeshBasicMaterial({wireframe:true});
    
        var cube = new THREE.Mesh( geometry, material );
        cube.position.set(0, 0, -10);
        cube.rotation.x = Math.PI / 4;
        cube.rotation.y = Math.PI / 4;
        this.scene().add( cube );

        */

        
        const size = this.floorSize()
        const geometry = new THREE.Geometry();
        const f = 10
        geometry.vertices.push(new THREE.Vector3(- f*size/2, 0, 0 ) );
        geometry.vertices.push(new THREE.Vector3(  f*size/2, 0, 0 ) );

        const linesMaterial = new THREE.LineBasicMaterial( { color: 0x222222, opacity: .2, linewidth: 3 } );
	    //var linesMaterial = new THREE.MeshBasicMaterial({wireframe:true});

        const max = 40
        for (let i = -max/2; i <= max/2; i ++ ) {

            //const mat1 = new THREE.LineBasicMaterial( { color:  rainbowColor(), opacity: 1, linewidth: 4 } );
            //const mat2 = new THREE.LineBasicMaterial( { color:  rainbowColor(), opacity: 1, linewidth: 4 } );

            let line = new THREE.Line( geometry, linesMaterial );
            line.position.z = i * (size/max);
            line.position.y = 10
            this.scene().add( line );

            line = new THREE.Line( geometry, linesMaterial );
            line.position.x = i * (size/max);
            line.rotation.y = 90 * Math.PI / 180;
            line.position.y = 1
            //this.scene().add( line );
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

    loadModel(modelName) {
        console.log("loading '" + modelName + "'...")
        //const loader = new THREE.OBJMTLLoader();
        const loader = new THREE.OBJLoader();
        //const loader = new THREE.ObjectLoader();
        const callback = (event) => { this.didLoadModel(event, modelName) };
        //loader.load("models/" + modelName + ".obj", "models/" + modelName +".mtl", callback, (event) => { this.didFinishLoadModel(event) });    
        loader.load("models/" + modelName + ".obj", callback);    
        //loader.addEventListener("load", callback );
    }

    didLoadModel(object, modelName) {
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

        //Points( geometry : Geometry, material : Material )

        const outline = object.asEdgesObject(0xff6600, 2, .5)
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
        const f = 6
        this.camera().position.x = f * r * Math.cos(speed * t)
        this.camera().position.z = f * r * Math.sin(speed * t)
        
        // y is height
        this.camera().position.y = 2*r + 0.5 * r * Math.cos(speed * t * 0.5)
       //this.camera().position.y = 3*r

        /*
        const ymin = 3
        if (this.camera().position.y < ymin) {
            this.camera().position.y = ymin
        }
        */
        //this.mainObject().rotation.y += .05
        
        const p = this.mainObject().position.clone()
        p.y *= 2
        //const p = this.mainObject().centerPoint()
        this.camera().lookAt(p)
    }

    render() {
        this.setTime(this.time() + 2)

        this.updateCamera()

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


    animate() {
        requestAnimationFrame( () => { this.animate() } );
        this.render();
    }

    onWindowResize() {
        //const f = 1

        /*
        // need this if it's a canvas
        const container = this.container()
        container.width  = container.clientWidth;
        container.height = container.clientHeight;
        */

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
    app = App.clone()
    app.run()
}

function rainbowColor() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const color = colors[Math.floor(Math.random() * colors.length)]
    return color
}