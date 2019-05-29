

THREE.Vector3.prototype.roughlyEquals = function(v2) {
    const v1 = this;
    const d = 0.001;
    const dx = Math.abs(v1.x - v2.x);
    const dy = Math.abs(v1.y - v2.y);
    const dz = Math.abs(v1.z - v2.z);
    return (dx < d) && (dy < d) && (dz < d);  
}

const Obj3d = THREE.Object3D.prototype

Obj3d.makeDoubleSided = function() {
    //this.material.side = THREE.DoubleSide;

    this.traverse( function(node) { 
        if (node instanceof THREE.Mesh) { 
            node.material.side = THREE.DoubleSide;
        } 
    } );
}

Obj3d.makeCastShadow = function() {
    this.castShadow = true;
    //this.receiveShadow = true;
    
    this.traverse((node) => { 
        if (node instanceof THREE.Mesh ) { 
            node.castShadow = true; 
            //node.receiveShadow = true; 
        } 
    })
}


function LinePieces_hasSharedVerts(vertices, v1, v2, ignoreIndex) { 
    // assumes all vertices are pairs of lines and not shared
    for (let i = 0; i < vertices.length; i += 2) {
        if (i === ignoreIndex) {
            continue;
        }
            
        const l1 = vertices[i]
        const l2 = vertices[i+1]
        
        // see if the vertices match
        if (l1.roughlyEquals(v1) && l2.roughlyEquals(v2)) {
            // if their normals match, this isn't an edge
            if (v1.face.normal.roughlyEquals(l1.face.normal)) {
                return true
            }
        }
        
        // see if the vertices match in the other direction
        if (l2.roughlyEquals(v1) && l1.roughlyEquals(v2)) {
            // if their normals match, this isn't an edge
            if (v1.face.normal.roughlyEquals(l1.face.normal)) {
                return true
            }
        }
    }
    
    return false
}
        
Obj3d.firstGeometry = function() {
/*
    this.traverse(function(node) { 
        //if (node instanceof THREE.Mesh) { 
            if (node.geometry) {
                return node.geometry
            }
        //}
    })
*/
    
    if (this.geometry) {
        return this.geometry
    }
    for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i]
        const g = child.firstGeometry()
        if (g) {
            return g
        }
    }
    
   console.log("unable to find a geometry for this Object3D:", this)
    throw new Error("unable to find a geometry for this Object3D:", this)
    return null
}

Obj3d.calculateRadius = function() {    
    const geometry = this.firstGeometry(); 
    geometry.computeBoundingBox(); 
    const boundingBox = geometry.boundingBox.clone();
    
    /*
    console.log('bounding box coordinates: ' + 
        '(' + boundingBox.min.x + ', ' + boundingBox.min.y + ', ' + boundingBox.min.z + '), ' + 
        '(' + boundingBox.max.x + ', ' + boundingBox.max.y + ', ' + boundingBox.max.z + ')' );
    */
    
    const dx = (boundingBox.max.x - boundingBox.min.x);
    const dy = (boundingBox.max.y - boundingBox.min.y);
    const dz = (boundingBox.max.z - boundingBox.min.z);

        //this._radius = boundingBox.getBoundingSphere().radius
    const r = Math.sqrt(dx*dx + dy*dy + dz*dz)
    console.log("calculated radius = ", r)
    return r
}

Obj3d.calculateCenterPoint = function() {
    const geometry = this.firstGeometry(); 
    geometry.computeBoundingBox(); 
    const boundingBox = geometry.boundingBox.clone();
    
    const dx = (boundingBox.max.x - boundingBox.min.x);
    const dy = (boundingBox.max.y - boundingBox.min.y);
    const dz = (boundingBox.max.z - boundingBox.min.z);

    const cx = boundingBox.min.x + dx/2;
    const cy = boundingBox.min.y + dy/2;
    const cz = boundingBox.min.z + dz/2;
    return new THREE.Vector3(cx, cy, cz)
}

Obj3d.centerPoint = function() {
    if (!this._centerPoint) {
        this._centerPoint = this.calculateCenterPoint()
    }
    return this._centerPoint
}

Obj3d.moveToOrigin = function() {
    console.log("this.position = ", this.position)
    this.position = this.position.add(this.calculateCenterPoint().negate())
    console.log("this.position = ", this.position)
}

Obj3d.scaleToUnit = function() {
    this.scale = this.scale.multiplyScalar(1/this.radius())
}

Obj3d.radius = function() { 
    if (!this._radius) {
        this._radius = this.calculateRadius()
    }     
    return this._radius
}

Obj3d.addOutline = function(color, thickness, opacity) {   
    if (color === undefined) { color = 0xff6600; }
    if (thickness === undefined) { thickness = 10; }
    if (opacity === undefined) { opacity = 1; }

    //const outline = this.asLineObject(color, thickness, opacity)
    const outline = this.asEdgesObject(color, thickness, opacity)
    outline.recursiveSetColor(color)
    const s = 1.004
    outline.scale.set(s, s, s)
    this.add(outline);
    return outline
}

Obj3d.asEdgesObject = function(color, thickness, opacity) {   
    const newMat = new THREE.LineBasicMaterial({
        color: color, 
        linewidth: thickness,
        fog: true,
        transparent: opacity != 1,
        opacity: opacity,
        linecap: "round",
        linejoin: "round",
    });

    const group = new THREE.Object3D()

    this.traverse(function(node) { 
        if (node instanceof THREE.Mesh) { 
            const edges = new THREE.EdgesGeometry( node.geometry );
            const line = new THREE.LineSegments( edges, newMat );
            group.add(line)
        }
    })

    return group
}


Obj3d.asLineObject = function(color, thickness, opacity) {   
    const newMat = new THREE.LineBasicMaterial( 
        {
            color: color, 
            //color: 0xff5500, 
            //color: 0x0055ff, 
            linewidth: thickness,
            fog: true,
            transparent: opacity != 1,
            opacity:opacity,
            linecap: "round",
            linejoin: "round",
        }
    );

Obj3d.aTubeObject = function() {
    /*
    const THREE = require('three');
    const extrudePolyline = require('extrude-polyline');
    const Complex = require('three-simplicial-complex')(THREE);
    */

    const vertices = [[0, 0], [10, 0], [10, 10], [20, 10], [30, 00]];
    const geometry = thickPolyline(vertices, 10);

    const material = new THREE.MeshBasicMaterial({
        color: 0x009900,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh
}
    
    /*
    const sharedMat = new THREE.LineBasicMaterial( 
        {
            color: 0x0000ff, 
            linewidth: 4,
            fog: true,
            transparent: true,
            opacity:.5,
        }
    );
    */
    
    /*
    const normalMat = new THREE.LineBasicMaterial( 
        {
            color: 0xffff00, 
            linewidth: 6,
            fog: true,
            transparent: true,
            opacity: 1,
        }
    );
    */

    const newGeo = new THREE.Geometry();
    const newVerts = newGeo.vertices
    
    const sharedGeo = new THREE.Geometry();
    const sharedVerts = sharedGeo.vertices
    
    //const normalGeo = new THREE.Geometry();
    //const normals = normalGeo.vertices
        
    const allVerts = []

    this.traverse(function(node) { 
        if (node instanceof THREE.Mesh) { 
            const faces = node.geometry.faces
            
            node.geometry.computeFaceNormals()
                                    
            const verts = node.geometry.vertices
            
            for (let i = 0; i < faces.length; i ++) {
                let f = faces[i]
                
                const a = new THREE.Vector3().copy(verts[f.a])
                const b = new THREE.Vector3().copy(verts[f.b])
                const c = new THREE.Vector3().copy(verts[f.c])
                /*                            
                const a = verts[f.a].clone()
                const b = verts[f.b].clone()
                const c = verts[f.c].clone()
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
                const ns = 5
                const n = f.normal.clone().multiplyScalar(ns)
                normals.push(a)
                normals.push(a.clone().add(n))
                
                normals.push(b)
                normals.push(b.clone().add(n))
                
                normals.push(c)
                normals.push(c.clone().add(n))
                */
            }
        } 
    });
            
    console.log("allVerts = ", allVerts.length)
    console.log("full line count assuming no shared vertices = ", allVerts.length/2)
    console.log("now we need to trim to only the lines we want to be visible")
    
    // this code assumes the vertices are arranged like?
    // [traingle1PointA, traingle1PointB, traingle1PointC, traingle2PointA, traingle2PointB, ...]
    // That is, no shared vertices?

    for (let i = 0; i < allVerts.length; i += 2) {           
        const a = allVerts[i]
        const b = allVerts[i+1]

        /*
        console.log("line ", i/2)
        console.log("  a ", a)
        console.log("  b ", b)
        console.log("  a.norm ", a.face.normal)
        */

        if (LinePieces_hasSharedVerts(allVerts, a, b, i)) {
            sharedVerts.push(a)
            sharedVerts.push(b)  
        } else {
            newVerts.push(a)
            newVerts.push(b)
            
            /*
            const ns = -10
            let n = a.face.normal.clone().multiplyScalar(ns)
            normals.push(a)
            normals.push(a.clone().sub(n))
            
            n = b.face.normal.clone().multiplyScalar(ns)
            normals.push(b)
            normals.push(b.clone().sub(n))
            */
        }
    } 
    
    const newObj = new THREE.Line( newGeo, newMat, THREE.LinePieces );
    //const out = new THREE.Object3D();
    //out.add(newObj)
                
    // console.log("newVerts = ", newVerts.length)
    //console.log("sharedVerts = ", sharedVerts.length)
    //out.add(new THREE.Line(sharedGeo, sharedMat, THREE.LinePieces ))
    //out.add(new THREE.Line(normalGeo, normalMat, THREE.LinePieces ))
    
    //newObj.position.copy(this.position)
    //newObj.scale.copy(this.scale)
    //newObj.rotation.copy(this.rotation)



    return newObj
}

Obj3d.recursiveSetLineWidth = function(width) {           
    this.traverse( (node) => { 
        if (node.material) { 
            node.material.linewidth =  width
            node.needsUpdate = true
        } 
    } );
}

Obj3d.recursiveSetOpacity = function(opacity) {           
    this.traverse((node) => { 
        if (node instanceof THREE.Mesh) { 
            if (opacity == 1) {
                node.material.transparent = false
            } else {
                node.material.transparent = true
                node.material.opacity = opacity
            }

            node.needsUpdate = true
        } 
    } );
}

Obj3d.recursizeNormalize = function() {
    this.traverse( (node) => { 
        if (node.normalize) {
            node.normalize()
        }
    })
}

Obj3d.recursiveSetColor = function(hexColor) {           
    this.traverse( (node) => { 
        if (node.material) {
            if (node.material.constructor === Array) {
                for (let i = 0; i < node.material.length; i++) {
                    const m = node.material[i]
                    m.color.set(hexColor)
                }
                node.needsUpdate = true
            } else {
                node.material.color.set(hexColor)
                node.needsUpdate = true
            }

            /*
            if (node.material.color) {
                node.material.color.setHex(hexColor)
                node.needsUpdate = true
                console.log("set color")
            }
            */

            /*
            if (node.material.ambient)
            {
                node.material.ambient.setHex(hexColor)
            }
            */
        } 
    } );
}

Obj3d.getBoundingBox = function(hexColor) {           
    const geometry = this.firstGeometry()
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox.clone();
    console.log('font bounding box coordinates: ' + 
        '(' + boundingBox.min.x + ', ' + boundingBox.min.y + ', ' + boundingBox.min.z + '), ' + 
        '(' + boundingBox.max.x + ', ' + boundingBox.max.y + ', ' + boundingBox.max.z + ')' );
    return boundingBox
}

Obj3d.getWidth = function() {
    const box = this.getBoundingBox()
     return box.max.x - box.min.x;
}

Obj3d.getHeight = function() {
    const box = this.getBoundingBox()
     return box.max.y - box.min.y;
}

Obj3d.getDepth = function() {
    const box = this.getBoundingBox()
     return box.max.z - box.min.z;
}


THREE.Color.prototype.pickRainbowColor = function() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const color = colors[Math.floor(Math.random() * colors.length)]
    this.setHex(color)
    return this
}

/*
Obj3d.asMergedGeometryObject = function() {
    var newGeo = new THREE.Geometry();
    var newTree = this.clone(); //Clones the tree so the original does not get altered
    newTree.traverse((child) => {
        if(child.parent){
            child.updateMatrixWorld();
            child.applyMatrix(child.parent.matrixWorld);    
        }
        if (child.type === "Mesh") {
            newGeo.mergeMesh (child)
        }
    });
    const obj = new THREE.Object3D();
    obj.geometry = newGeo;
    return obj
}
*/


/*
function aTubeObject() {
    
    //const THREE = require('three');
    //const extrudePolyline = require('extrude-polyline');
    //const Complex = require('three-simplicial-complex')(THREE);

    const vertices = [[0, 0], [10, 0], [10, 10], [20, 10], [30, 00]];
    const geometry = thickPolyline(vertices, 10);

    const material = new THREE.MeshBasicMaterial({
        color: 0x009900,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh
}

function thickPolyline(points, lineWidth) {
    const simplicialComplex = extrudePolyline({
        // Adjust to taste!
        thickness: lineWidth,
        cap: 'square',  // or 'butt'
        join: 'bevel',  // or 'miter',
        miterLimit: 10,
    }).build(points);

    // Add a z-coordinate.
    for (const position of simplicialComplex.positions) {
        position[2] = 0;
    }

    return Complex(simplicialComplex);
}
*/


THREE.Object3D.prototype.time = function() {
    const time = new Date().getTime();
    //const time = App.shared().time();
    return time
}

THREE.Object3D.prototype.vibrateScale = function() {
    const time = this.time();

    const t = time + this.id;
    const range = 0.25
    const maxS = 1 + range
    const minS = 1 - range
    const f = (1 + Math.cos(t))/2 
    const s = f * (maxS - minS) + minS
    this.scale.set(s, s, s)
}

THREE.Object3D.prototype.update = function() {
    if (this._shouldUpdatePhysics) {
        this.updatePhysics()
    }
    
    if (this._shouldVibrateScale) {
        this.vibrateScale()
    }
    
    if (this._shouldVibrateLineWidth) {
        this.vibrateLineWidth()
    }

    if (this._shouldVibrateColor) {
        this.vibrateColor()
    }
}


THREE.Object3D.prototype.vibrateColor = function() {
    this.recursiveSetColor(new THREE.Color().pickRainbowColor())
}

THREE.Object3D.prototype.vibrateLineWidth = function() {
    const t = this.time() + this.id;
    const w = Math.floor(2 +(1+Math.cos(t/200))*3)
    this.recursiveSetLineWidth(w)
}

THREE.Object3D.prototype.velocity = function() {
    if (!this._velocity) {
        this._velocity = new THREE.Vector3()
    }
    return this._velocity
}

THREE.Object3D.prototype.rotationalVelocity = function() {
    if (!this._rotationalVelocity) {
        this._rotationalVelocity = new THREE.Vector3()
    }
    return this._rotationalVelocity
}

THREE.Object3D.prototype.updatePhysics = function() {
    this.position.add(this.velocity())

    const rv = this.rotationalVelocity()
    this.rotation.x += rv.x
    this.rotation.y += rv.y
    this.rotation.z += rv.z
}

Array.prototype.pick = function() {
    const index = Math.floor(this.length * Math.random())
    return this[index]
}