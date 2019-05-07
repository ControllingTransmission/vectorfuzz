
THREE.Vector3.prototype.roughlyEquals = function(v2) {
    const v1 = this
    const d = 0.001
    return Math.abs(v1.x - v2.x) < d && Math.abs(v1.y - v2.y) < d && Math.abs(v1.z - v2.z) < d  
}

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


function LinePieces_hasSharedVerts(vertices, v1, v2, ignoreIndex) {  
    for (let i = 0; i < vertices.length; i += 2) {
        if (i === ignoreIndex) {
            continue;
        }
            
        const l1 = vertices[i]
        const l2 = vertices[i+1]
        
        // see if the vertices match
        if (l1.roughlyEquals(v1) && l2.roughlyEquals(v2)) {
            // see if their normals match
            if (v1.face.normal.roughlyEquals(l1.face.normal)) {
                return true
            }
        }
        
        // see if the vertices match
        if (l2.roughlyEquals(v1) && l1.roughlyEquals(v2)) {
            // see if their normals match
            if (v1.face.normal.roughlyEquals(l1.face.normal)) {
                return true
            }
        }
    }
    
    return false
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

Obj3d.randomizePos = function() {
    this.position.x = 2000 * (Math.random() - 0.5)
    this.position.y = 2000 * (Math.random() - 0.0) + 5
    this.position.z = 1000 * (Math.random() - 0.5)    
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

