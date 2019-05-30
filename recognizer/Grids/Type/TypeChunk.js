"use strict"


class TypeChunk extends Chunk {
    init() {
        super.init()
        this.setRange(2)
    }

    generate() {
        const font = Fonts.shared().fontNamed("G-Type_Regular.json")
        const array = ["DONT BLINK", "OR", "YOULL DIE!"]
        const t = font.objectForText(array.pick())
        const p = this.position()
        t.position.x += p.x 
        t.position.y += p.y + 300
        t.position.z += p.z
        this.add(t) 

        t.update = function() {
            const camera = App.shared().camera()
            this.rotation.y = Math.atan2( ( camera.position.x - this.position.x ), ( camera.position.z - this.position.z ) );
        }
    }

}

window.TypeChunk = TypeChunk

export { TypeChunk }