"use strict"


class Fonts extends BaseObject {

    init() {
        super.init()
        this.newSlot("dict", {}); // name to Group of model
        this.preload()
    }

    preloadNames() {
        return [ 
            "helvetiker_bold.typeface.json",
            "Beef'd_Regular.json",
            "G-Type_Regular.json",
            "Hyperspace_Regular.json",
            "Hyperspace_Bold.json"
        ]
    }

    preload() {
        this.preloadNames().forEach((name) => { 
            this.fontNamed(name)
        })
        return this
    }

    fontNamed(name) {
        const d = this.dict()
        if (!d[name]) {
            const font = Font.clone().setPath(name).load()
            d[name] = font
        }
        return d[name]
    }

    fonts() {
        const array = []
        const d = this.dict()
        for (let k in d) {
            if (d.hasOwnProperty(k)) {
                const v = d[k]
                array.push(v)
            }
        }
        return array
    }

    pick() {
        return this.fonts().pick()
    }
}

window.Fonts = Fonts

export { Fonts }