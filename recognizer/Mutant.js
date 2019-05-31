
"use strict"

import { BaseObject } from './BaseObject.js';
import CSG from './external_libraries/THREE-CSGMesh-master/CSGMesh.js'
import { App } from './App.js';

class Mutant extends BaseObject {

    init() {
        super.init()
        this.newSlot("object", new THREE.Object3D());
        this.object().position.y = 1000
        this.object()._owner = this
        this.newSlot("object1", null);
        this.newSlot("object2", null);
        this.newSlot("mergedObject", null);
        this.newSlot("outline", null);
        this.newSlot("time", 0);
        this.newSlot("materialDict", { color: 0xFF0000, opacity: 1, linewidth: 8 });
        this.newSlot("maxMutationTime", 55);
        this.newSlot("mutationTime", 0);
        this.pickMeshes()
    }

    material() {
        this.materialDict().color = [0xFF0000, 0x00FF00, 0xFFFF00, 0xFF00FF, 0xFF6666].pick()
        return new THREE.LineBasicMaterial(this.materialDict() );
    }

    mutate() {
        this.setMutationTime(this.maxMutationTime())
    }

    pickMeshes() {
        const f = 1500

        const g1 = PlatonicSolid.clone().pickNumber().geometry();
        const obj1 = new THREE.Mesh(g1, this.material())
        this.setObject1(obj1)

        const g2 = PlatonicSolid.clone().pickNumber().geometry();
        const obj2 = new THREE.Mesh(g2, this.material())
        this.setObject2(obj2)

        this.object2().rotation.z = 10
    }

    updateCSG() {
        if (this.mergedObject()) {
            this.mergedObject().geometry.dispose();
         }
 
         if (this.outline()) {
             this.object().remove(this.outline())
         }
 
         this.object1().updateMatrix();
         this.object2().updateMatrix();
 
         //const r = this.doCSG(this.object1(), this.object2(), 'subtract', null);
         //const r = this.doCSG(this.object1(), this.object2(), 'union', null);
         const r = this.doCSG(this.object1(), this.object2(), 'intersect', null);
         this.setMergedObject( r )

         let mat = this.materialDict()
         let outline = this.mergedObject().asEdgesObject(mat.color, mat.linewidth, mat.opacity)
         outline.position.copy(this.mergedObject().position)
         this.setOutline(outline)

         this.object().add(outline)
         //outline.vibrateColor()
         this.object().needsUpdate = true
    }

    update() {
        this._time += 1

        if (this._time % 2 == 0) {
            this.updateCSG()
        }

        this.object2().rotation.y += 0.01
        this.object2().rotation.z += 0.01
        this.object().update()

        if (this.mutationTime() > 0) {
            this.setMutationTime(this.mutationTime() - 1)
            const r = this.mutationTime() / this.maxMutationTime();
            const s = Math.cos(r * Math.PI) // 0 to 1 to 0
            this.object().scale.set(s, s, s)
            if (this.mutationTime() === Math.floor(this.maxMutationTime()/2) ) {
                this.pickMeshes()
            }
        }
    }

    doCSG(a,b,op,mat){
        var bspA = CSG.fromMesh( a );
        var bspB = CSG.fromMesh( b );
        var bspC = bspA[op]( bspB );
        var result = CSG.toMesh( bspC, a.matrix );
       // result.material = this.material();
        return result;
    }
    
}

window.Mutant = Mutant

export { Mutant }