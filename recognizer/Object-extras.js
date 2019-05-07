
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

/*
class Test extends ObjectBase {
    init() {
        super.init()
        this.newSlot("fullPath", null);
        // subclasses should override to initialize
    }
}
*/

const Obj3d = THREE.Object3D.prototype

Obj3d.makeDoubleSided = function() {
    //this.material.side = THREE.DoubleSide;

    this.traverse( function(node) { 
        if ( node instanceof THREE.Mesh ) { 
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


function Vector3_equals(v1, v2)
{
    //return v1.x == v2.x && v1.y == v2.y && v1.z == v2.z;
    var d = 0.001
    return Math.abs(v1.x - v2.x) < d && Math.abs(v1.y - v2.y) < d && Math.abs(v1.z - v2.z) < d
}

function LinePieces_hasSharedVerts(vertices, v1, v2, ignoreIndex)
{  
    let count = 0
    let matchLine = null;
    
    for (let i = 0; i < vertices.length; i += 2)
    {
        if (i == ignoreIndex)
        {
            continue;
        }
            
        const l1 = vertices[i]
        const l2 = vertices[i+1]
        
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
            //console.log("match points of line ",  i/2)

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
        }
    );
    
    const sharedMat = new THREE.LineBasicMaterial( 
        {
            color: 0x0000ff, 
            linewidth: 4,
            fog: true,
            transparent: true,
            opacity:.5,
        }
    );
    
    const normalMat = new THREE.LineBasicMaterial( 
        {
            color: 0xffff00, 
            linewidth: 6,
            fog: true,
            transparent: true,
            opacity: 1,
        }
    );

    const newGeo = new THREE.Geometry();
    const newVerts = newGeo.vertices
    
    const sharedGeo = new THREE.Geometry();
    const sharedVerts = sharedGeo.vertices
    
    const normalGeo = new THREE.Geometry();
    const normals = normalGeo.vertices
        
    const allVerts = []

    this.traverse(function(node) { 
            if (node instanceof THREE.Mesh) { 
                const faces = node.geometry.faces
                
                node.geometry.computeFaceNormals()
                                        
                const verts = node.geometry.vertices
                
                for (let i = 0; i <  faces.length; i ++) {
                    let f = faces[i]
                    
                    const a = new THREE.Vector3().copy(verts[f.a])
                    const b = new THREE.Vector3().copy(verts[f.b])
                    const c = new THREE.Vector3().copy(verts[f.c])
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
    
    for (let i = 0; i < allVerts.length; i +=2) {           
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
    
    const newObj =  new THREE.Line( newGeo, newMat, THREE.LinePieces );
    const out = new THREE.Object3D();
    out.add(newObj)
                
    // console.log("newVerts = ", newVerts.length)
    //console.log("sharedVerts = ", sharedVerts.length)
    //out.add(new THREE.Line(sharedGeo, sharedMat, THREE.LinePieces ))
    //out.add(new THREE.Line(normalGeo, normalMat, THREE.LinePieces ))
    
    //newObj.position.copy(this.position)
    //newObj.scale.copy(this.scale)
    //newObj.rotation.copy(this.rotation)

    return out
}

Obj3d.recursiveSetLineWidth = function(width) {           
    this.traverse( (node) => { 
        if ( node instanceof THREE.Mesh ) { 
            node.material.linewidth =  4
            node.needsUpdate = true
        } 
    } );
}
        
Obj3d.recursiveSetOpacity = function(opacity) {           
    this.traverse( (node) => { 
        if ( node instanceof THREE.Mesh ) { 
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

Obj3d.recursiveSetColor = function(hexColor) {           
    this.traverse( (node) => { 
        if ( node instanceof THREE.Mesh ) { 
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

