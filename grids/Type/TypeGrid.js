"use strict"

class TypeGrid extends Grid {
    init() {
        super.init()
        this.setChunkSize(50000)
        this.setChunkClass(TypeChunk)
        //this.setRange(5)
    }
}

window.TypeGrid = TypeGrid

export { TypeGrid }