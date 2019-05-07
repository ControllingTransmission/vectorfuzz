

var container;
var controls;

var camera, scene, renderer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time = 0
var mainObject = null

function SpotLight_new() {
    const self = new THREE.SpotLight(0xaaaaaa);
    self.position.set(-1500, 3500, 0);
    self.castShadow = true;

    const detail = 4
    self.shadowMapWidth  = 512 * detail;
    self.shadowMapHeight = 512 * detail;
    scene.add(self);    
    //self.shadowCameraVisible = true;
    return self       
}

function init() {            
    container = document.createElement("div");
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 10000);


    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0x000000, .1, 10000);

    //controls = new THREE.OrbitControls( camera );
    //controls.addEventListener( 'change', render );

    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);


    //carrier = null
    carrierSpotlight = SpotLight_new()
    
    mainObject = new THREE.Object3D();
    mainObject.position.set(0,52,0)
    mainObject.position.set(0,152,0)
    scene.add(mainObject)
    
    mainObject.calcRadius = function () {
        /*
        //this.computeBoundingBox()
        const box = this.boundingBox()

        //const box = new THREE.Box3().setFromObject(this)
        const r = box.getBoundingSphere().radius
        this.radius = r
        return r
        */
       this.radius = 100

        return this.radius
    }

    /*
    mainObject.step = function() {
        this.rotation.x += .005
        this.rotation.y += .005   
    }
    */
    
    carrierSpotlight.target = mainObject

    {
        //const geometry = new THREE.CubeGeometry(100,100,100);
        var geometry = new THREE.IcosahedronGeometry(100, 0)


        //var geometry = new THREE.OctahedronGeometry(100, 0)
        //var geometry = new THREE.TetrahedronGeometry(100, 0)
        //var geometry = new THREE.DodecahedronGeometry(100, 0)

        const material = new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0xdddddd, specular: 0x333300, shininess: 30, shading: THREE.FlatShading } ) 

        //console.log("THREE.Mesh = ", THREE.Mesh)
        //console.log("THREE.Mesh.prototype.castShadow = ", THREE.Mesh.prototype.castShadow)
        
        const object = new THREE.Mesh(geometry, material);
        object.position.set(0,0,0)
        mainObject.add( object );

        var geoLines = object.asLineObject(0xff6600, 3, 1)
        mainObject.add( geoLines );
        
        object.makeCastShadow()
        //Object_castShadow(object)

        object.recursiveSetColor(0x111111)
        objectOutline = object.asLineObject()

        const s = 1.005
        objectOutline.scale.set(s, s, s)
        //mainObject.add( objectOutline );
        carrierSpotlight.target = object
    }
    

    console.log("loading...")
    
    const loader = new THREE.OBJMTLLoader();
    //const loader = new THREE.ObjectLoader();
    loader.load("models/Recognizer.obj", "models/Recognizer.mtl");    
    loader.addEventListener("load", finishedObjLoad );
       
    function finishedObjLoad(event) {
        const object = event.content
        console.log("loaded")
        // Object_castShadow(object)
        //Object_makeDoubleSided(object)
        

        //object.recursiveSetColor(0x004400)
        object.recursiveSetColor(0x552222)
        
        const carrier = new THREE.Object3D();
        carrier.add(object)
        
        //const s = 1/10
        //carrier.scale.set(s, s, s)
        
        carrierOutline = object.asLineObject(0xff6600, 3, 1)
        //const s = 1.001
        //carrierOutline.scale.set(s, s, s);
        carrier.add(carrierOutline)
        
        mainObject.calcRadius()
        
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
        
        mainObject.add( carrier );
        
        carrierSpotlight.target = carrier
        
        carrier.maxz = 1500
        carrier.minz = -1500
        //carrier.position.set(0,3,0);
        //carrier.position.set(0,300,0);

        mainObject.calcRadius()
        const s = 100/mainObject.radius
        mainObject.scale.set(s, s, s)
        console.log("carrier loaded radius: ", mainObject.radius)
    }

    
    // add the floor
    {
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
        scene.add( floor );
    }


    {
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
        scene.add( floorWire );
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild( renderer.domElement );
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;

    camera.position.y = mainObject.radius*10
    render();
};


function render() {
    if (mainObject) {
        time += 6
        const speed = 1 / 500
        //camera.position.y += .01
        const r = mainObject.radius * 14
        camera.position.x = r * Math.cos(speed * time)
        camera.position.y = mainObject.radius * 20 + r * Math.cos(speed * time * 1.5)
        camera.position.z = r * Math.sin(speed * time)
        
        //mainObject.rotation.y += .05
        
        const p = mainObject.position.clone()
        //p.y *= 1/2
        camera.lookAt(p)
        
        if (mainObject.step) {
            // mainObject.step()
        }
    }

    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function onWindowResize() {
    const f = 1
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth / f, window.innerHeight / f );
}
window.addEventListener("resize", onWindowResize, false);


function main() {
    init();
    animate();
}

window.onload = function() {
    main()
}
