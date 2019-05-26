
"use strict"

import { App } from './App.js';


window.onload = function() {
    window.app = App.clone()
    app.run()
}

/*
function rainbowColor() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    const color = colors[Math.floor(Math.random() * colors.length)]
    return color
}
*/