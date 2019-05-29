"use strict"


class Fonts extends BaseObject {

    init() {
        super.init()
        this.newSlot("fonts", []);
        this.load()
    }

    preloadNames() {
        return [ 
            "helvetiker_bold.typeface.json",
            "Beef'd_Regular.json",
            "G-Type_Regular.json",
            "fonts/Hyperspace_Regular.json",
            "Hyperspace_Bold.json"
        ]
    }

    load() {
        this.preloadNames().forEach((name) => { 
            this.fonts().push(Font.clone().setPath(name).load() 
        )})
        return this
    }

    pick() {
        return this.fonts().pick()
    }
}

window.Fonts = Fonts

export { Fonts }