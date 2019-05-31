"use strict"

import { Grid } from '../Grid.js';
import { FloorChunk } from './FloorChunk.js';

class FloorGrid extends Grid {
    init() {
        super.init()
        this.setChunkSize(300000)
        this.setChunkClass(FloorChunk)
    }
}

window.FloorGrid = FloorGrid

export { FloorGrid }