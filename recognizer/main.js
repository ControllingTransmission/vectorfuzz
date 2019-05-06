

var container;

var controls;

var camera, scene, renderer;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var time = 0
    
function Object_makeDoubleSided(self)
{
    //self.material.side = THREE.DoubleSide;
    
        self.traverse( function( node ) { 
        if ( node instanceof THREE.Mesh ) { 
            node.material.side = THREE.DoubleSide;
        } 
    } );
}

function Object_castShadow(self)
{
    self.castShadow = true;
    //self.receiveShadow = true;
    
    self.traverse( function( node ) 
    { 
        if ( node instanceof THREE.Mesh ) 
        { 
            node.castShadow = true; 
            //node.receiveShadow = true; 
        } 
    } );
}

function Vector3_equals(v1, v2)
{
    //return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
    var d = 0.001
    return Math.abs(v1.x - v2.x) < d && Math.abs(v1.y - v2.y) < d && Math.abs(v1.z - v2.z) < d
}

function LinePieces_hasSharedVerts(vertices, v1, v2, ignoreIndex)
{  
    var count = 0
    var matchLine = null;
    
    for (var i = 0; i < vertices.length; i += 2)
    {
        if (i == ignoreIndex)
        {
            continue;
        }
            
        var l1 = vertices[i]
        var l2 = vertices[i+1]
        
        //if (l1.equals(v1) && l2.equals(v2)) 
        if (Vector3_equals(l1, v1) && Vector3_equals(l2, v2)) 
        { 
                //console.log("match points of line ",  i/2)

            if (Vector3_equals(v1.face.normal, l1.face.normal))
            {
                    count ++
                    matchLine = i/2
            }
            else
            {
                //   console.log("but normals don't match")
            }
        }
        //if (l2.equals(v1) && l1.equals(v2)) 
        if (Vector3_equals(l1, v2) && Vector3_equals(l2, v1)) 
        { 
//                     console.log("match points of line ",  i/2)

            if (Vector3_equals(v1.face.normal, l1.face.normal))
            {
                count ++
                matchLine = i/2
            }
            else
            {
                // console.log("but normals don't match")
            }
        }
    }
    
    return count != 0
}
        
function Object_asLineObject(self, color, thickness, opacity)
{   
    var newMat = new THREE.LineBasicMaterial( 
        {
            color: color, 
            //color: 0xff5500, 
            //color: 0x0055ff, 
            linewidth: thickness,
            fog: true,
            transparent: opacity != 1,
            opacity:opacity,
        }
    );
    
    var sharedMat = new THREE.LineBasicMaterial( 
        {
            color: 0x0000ff, 
            linewidth: 4,
            fog: true,
            transparent: true,
            opacity:.5,
        }
    );
    
    var normalMat = new THREE.LineBasicMaterial( 
        {
            color: 0xffff00, 
            linewidth: 6,
            fog: true,
            transparent: true,
            opacity: 1,
        }
    );

    var newGeo = new THREE.Geometry();
    var newVerts = newGeo.vertices
    
    var sharedGeo = new THREE.Geometry();
    var sharedVerts = sharedGeo.vertices
    
    var normalGeo = new THREE.Geometry();
    var normals = normalGeo.vertices
        
    var allVerts = []
    self.traverse(function(node) 
        { 
            if (node instanceof THREE.Mesh) 
            { 
                var faces = node.geometry.faces
                
                node.geometry.computeFaceNormals()
                                        
                var verts = node.geometry.vertices
                
                for (var i = 0; i <  faces.length; i ++)
                //for (var i = 0; i <  2; i ++)
                {
                    var f = faces[i]
                    
                    var a = new THREE.Vector3().copy(verts[f.a])
                    var b = new THREE.Vector3().copy(verts[f.b])
                    var c = new THREE.Vector3().copy(verts[f.c])
/*                            
                    var a = verts[f.a].clone()
                    var b = verts[f.b].clone()
                    var c = verts[f.c].clone()
*/                                                     
                    a.face = f
                    b.face = f
                    c.face = f
                    
                    allVerts.push(a)
                    allVerts.push(b)

                    allVerts.push(b)
                    allVerts.push(c)
                
                    allVerts.push(c)
                    allVerts.push(a)
                /*
                    var ns = 5
                    var n = f.normal.clone().multiplyScalar(ns)
                    normals.push(a)
                    normals.push(a.clone().add(n))
                    
                    normals.push(b)
                    normals.push(b.clone().add(n))
                    
                    normals.push(c)
                    normals.push(c.clone().add(n))
                    */
                }
            } 
        } 
    );
            
    console.log("allVerts = ", allVerts.length)
    console.log("lines = ", allVerts.length/2)
    
    for (var i = 0; i < allVerts.length; i +=2)
    {           
        var a = allVerts[i]
        var b = allVerts[i+1]
/*
        console.log("line ", i/2)
        console.log("  a ", a)
        console.log("  b ", b)
        console.log("  a.norm ", a.face.normal)
*/
        if (LinePieces_hasSharedVerts(allVerts, a, b, i))
        {
            sharedVerts.push(a)
            sharedVerts.push(b)  
        }
        else
        {
            newVerts.push(a)
            newVerts.push(b)
            
            /*
            var ns = -10
            var n = a.face.normal.clone().multiplyScalar(ns)
            normals.push(a)
            normals.push(a.clone().sub(n))
            
            var n = b.face.normal.clone().multiplyScalar(ns)
            normals.push(b)
            normals.push(b.clone().sub(n))
            */
        }
        
    } 
    
    newObj =  new THREE.Line( newGeo, newMat, THREE.LinePieces );

    var out = new THREE.Object3D();
    out.add(newObj)
                
    // console.log("newVerts = ", newVerts.length)
    //console.log("sharedVerts = ", sharedVerts.length)
    //out.add(new THREE.Line(sharedGeo, sharedMat, THREE.LinePieces ))
    //out.add(new THREE.Line(normalGeo, normalMat, THREE.LinePieces ))
    
    //newObj.position.copy(self.position)
    //newObj.scale.copy(self.scale)
    //newObj.rotation.copy(self.rotation)

    return out
}

function Object_recursiveSetLineWidth(self, width)
{           
    self.traverse( function( node ) 
    { 
        if ( node instanceof THREE.Mesh ) 
        { 
            node.material.linewidth =  4
            node.needsUpdate = true
        } 
    } );
}
        
function Object_recursiveSetOpacity(self, opacity)
{           
    self.traverse( function( node ) 
    { 
        if ( node instanceof THREE.Mesh ) 
        { 
            if (opacity == 1)
            {
                node.material.transparent = false
            }
            else
            {
                node.material.transparent = true
                node.material.opacity = opacity
            }

            node.needsUpdate = true
        } 
    } );
}

function Object_recursiveSetColor(self, hexColor)
{           
    self.traverse( function( node ) 
    { 
        if ( node instanceof THREE.Mesh ) 
        { 
            node.material.color.setHex(hexColor)
            /*
            if (node.material.ambient)
            {
                node.material.ambient.setHex(hexColor)
            }
            */
            node.needsUpdate = true
        } 
    } );
}

function SpotLight_new()
{
    var self = new THREE.SpotLight( 0xaaaaaa );
    self.position.set( -1500, 3500, 0 );
    self.castShadow = true;

    var detail = 4
    self.shadowMapWidth = 512*detail;
    self.shadowMapHeight = 512*detail;
    scene.add(self);    
    //self.shadowCameraVisible = true;
    return self       
}

function init() 
{            
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 10000);


    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0x000000, .1, 10000);

    //controls = new THREE.OrbitControls( camera );
    //controls.addEventListener( 'change', render );

    var ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);


    carrier = null
    carrierSpotlight = SpotLight_new()
    mainObject = null
    
    mainObject = new THREE.Object3D();
    mainObject.position.set(0,52,0)
    mainObject.position.set(0,152,0)
    scene.add(mainObject)
    
    mainObject.calcRadius = function ()
    {
        /*
        //this.computeBoundingBox()
        const box = this.boundingBox()

        //var box = new THREE.Box3().setFromObject(this)
        var r = box.getBoundingSphere().radius
        this.radius = r
        return r
        */
       this.radius = 100

        return this.radius
    }

    /*
    mainObject.step = function()
    {
        var self = this
        self.rotation.x += .005
        self.rotation.y += .005   
    }
    */
    
        carrierSpotlight.target = mainObject


    {
        var geometry = new THREE.CubeGeometry(100,100,100);
        //var geometry = new THREE.IcosahedronGeometry(100, 0)
        //var geometry = new THREE.OctahedronGeometry(100, 0)
        //var geometry = new THREE.TetrahedronGeometry(100, 0)
        //var geometry = new THREE.DodecahedronGeometry(100, 0)

        var material = new THREE.MeshPhongMaterial( { ambient: 0x111111, color: 0xdddddd, specular: 0x333300, shininess: 30, shading: THREE.FlatShading } ) 

        var object = new THREE.Mesh( geometry, material );
        object.position.set(0,0,0)
        mainObject.add( object );
        
        Object_castShadow(object)
        Object_recursiveSetColor(object, 0x111111)
        objectOutline = Object_asLineObject(object)
        var s = 1.005
        objectOutline.scale.set(s, s, s)
        //mainObject.add( objectOutline );
        carrierSpotlight.target = object
    }
    

    console.log("loading...")
    
    var loader = new THREE.OBJMTLLoader();
    //var loader = new THREE.ObjectLoader();
    loader.load('models/Recognizer.obj', 'models/Recognizer.mtl');    
    loader.addEventListener( 'load', finishedObjLoad );
       
    function finishedObjLoad( event ) {
            const object = event.content
            console.log("loaded")
            // Object_castShadow(object)
            //Object_makeDoubleSided(object)
            

            // Object_recursiveSetColor(object, 0x004400)
            Object_recursiveSetColor(object, 0x552222)
            
            carrier = new THREE.Object3D();
            carrier.add(object)
            
            //var s = 1/10
            //carrier.scale.set(s, s, s)
            
            carrierOutline = Object_asLineObject(object, 0xff6600, 3, 1)
            //var s = 1.001
            //carrierOutline.scale.set(s, s, s);
            carrier.add(carrierOutline)
            
            mainObject.calcRadius()
            
            //carrier.scale.set(s,s,s)

            /*
            var glow = Object_asLineObject(object, 0xffff00, 20, .1)
            Object_recursiveSetColor(glow, 0xffffff)
            //Object_recursiveSetOpacity(glow, .5)
            //Object_recursiveSetLineWidth(glow, 10)
                glow.scale.set(s, s, s);
                carrier.add(glow)
                */
            
            /*
            var m = carrierOutline.children[0].material
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
            var s = 100/mainObject.radius
            mainObject.scale.set(s,s,s)
            console.log("carrier loaded radius: ", mainObject.radius)
        }

        
{
    var floorGeometry = new THREE.CubeGeometry(100000,.5,100000);
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
    var floor = new THREE.Mesh( floorGeometry, material );
    //floor.rotation.x = 3.14159/2
    floor.position.x = 0;
    floor.position.y = 0;
    floor.position.z = 0;
    floor.receiveShadow = true;
    scene.add( floor );
}
    {
        var floorWireGeometry = new THREE.PlaneGeometry( 20000, 20000, 30, 30 );
        var material = new THREE.MeshLambertMaterial( {
            color: 0xffffff, 
            ambient: 0x0000ff, 
            wireframe: true, 
            wireframeLinewidth: 1,
            fog:true,
            //transparent: true,
            //opacity:.5,
            side: THREE.DoubleSide
            } );
        var floorWire = new THREE.Mesh( floorWireGeometry, material );
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
    if (mainObject)
    {
        time ++
        var speed = 1/500
        //camera.position.y += .01
        var r = mainObject.radius*14
        //time = 0
        camera.position.x = r*Math.cos(speed*time)
        camera.position.y = mainObject.radius*20 + r*Math.cos(speed*time*1.5)
        camera.position.z = r*Math.sin(speed*time)
        
        //mainObject.rotation.y += .05
        
        var p = mainObject.position.clone()
        //p.y *= 1/2
        camera.lookAt(p)
        
        if (mainObject.step) 
        {
            // mainObject.step()
        }
    }
    renderer.render(scene, camera);
}

function Object_randomizePos(obj){
    obj.position.x = 2000*(Math.random() - 0.5)
    obj.position.y = 2000*(Math.random() - 0.0) + 5
    obj.position.z = 1000*(Math.random() - 0.5)    
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function onWindowResize() {
    var f = 1
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth/f, window.innerHeight/f );
}
window.addEventListener( 'resize', onWindowResize, false );


function main() {
    init();
    animate();
}

window.onload = function() {
    main()
}

