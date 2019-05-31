"use strict"

import { Grid } from '../Grid.js';
import { TunnelChunk } from './TunnelChunk.js';

class TunnelGrid extends Grid {
    init() {
        super.init()
        this.setChunkSize(100000)
        this.setChunkClass(TunnelChunk)
    }
}

window.TunnelGrid =TunnelGrid

export {TunnelGrid }