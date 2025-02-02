import { addStyles } from '../utils.js'

export class Render {
    elements = {
        info: document.querySelector('.info'),
        score: document.querySelector('.score'),
        preview: document.querySelector('.preview'),
        glass: document.querySelector('.glass'),
        highscore: document.querySelector('.highscore'),
        speed: document.querySelector('.speed'),
        palette: document.querySelector('.palette'),
        copyright: document.querySelector('.copy'),
    }

    constructor(glass, palette, styles = () => ({})) {
        /** @type {Glass} */
        this.glass = glass
        this.palette = palette
        this.styles = styles
        this.addStyles()
    }
    
    addStyles() {
        this.removeStyles = addStyles(this.styles(this.palette, this.glass), this.palette)
    }
    
    redraw(state) {
        throw new Error('Method not implemented')
    }

    destruct() {
        this.removeStyles()
    }
}