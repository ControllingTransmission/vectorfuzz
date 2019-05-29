"use strict"

//import { Grid } from '../Grid.js';
import { StarFieldChunk } from './StarFieldChunk.js';

class StarFieldGrid extends Grid {
    init() {
        super.init()
        this.setChunkSize(100000)
        this.setChunkClass(StarFieldChunk)
    }
}

window.StarFieldGrid = StarFieldGrid

export { StarFieldGrid }