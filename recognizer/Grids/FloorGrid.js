"use strict"

import { Grid } from './Grid.js';
import { FloorChunk } from './FloorChunk.js';
import { StarFieldChunk } from './StarFieldChunk.js';

class FloorGrid extends Grid {
    init() {
        super.init()
        this.setChunkSize(100000)
        this.setChunkClass(FloorChunk)
        //this.setChunkClass(StarFieldChunk)
    }
}

export { FloorGrid }