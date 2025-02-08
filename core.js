import I from './figures/I.js'
import J from './figures/J.js'
import L from './figures/L.js'
import O from './figures/O.js'
import S from './figures/S.js'
import T from './figures/T.js'
import Z from './figures/Z.js'

import { TextRender } from './renders/text.js'
import { HtmlRender } from './renders/html.js'

import EGA from './palettes/EGA.js'
import contrast from './palettes/contrast.js'
import pastel from './palettes/pastel.js'
import neon from './palettes/neon.js'
import retro from './palettes/retro.js'
import earthy from './palettes/earthy.js'
import vivid from './palettes/vivid.js'
import monochrome from './palettes/monochrome.js'
import matrix from './palettes/matrix.js'
import aurora from './palettes/aurora.js'
import classicDim from './palettes/classic-dim.js'
import darkSerenity from './palettes/dark-serenity.js'
import lowGlare from './palettes/low-glare.js'
import bw from './palettes/bw.js'

import { Glass } from './glass.js'


const figures = [I, J, L, O, S, T, Z]
Object.assign(figures, { I, J, L, O, S, T, Z })

/**
 * @typedef {Array} Cores
 * @property {string[]} keys
 * @property {string} default
 * @property {string} key
 * @property {number} index
 */

const core = {
    renderers: [
        { key: 'text', title: 'Text', renderer: TextRender, default: true },
        { key: 'html', title: 'Html', renderer: HtmlRender },
    ],
    palettes: [
        { key: 'ega', title: 'EGA', palette: EGA, default: true },
        { key: 'contrast', title: 'Contrast', palette: contrast },
        { key: 'pastel', title: 'Pastel', palette: pastel },
        { key: 'neon', title: 'Neon', palette: neon },
        { key: 'retro', title: 'Retro', palette: retro },
        { key: 'earthy', title: 'Earthy', palette: earthy },
        { key: 'vivid', title: 'Vivid', palette: vivid },
        { key: 'monochrome', title: 'Monochrome', palette: monochrome },
        { key: 'matrix', title: 'Matrix', palette: matrix },
        { key: 'aurora', title: 'Aurora', palette: aurora },
        { key: 'classic-dim', title: 'Classic Dim', palette: classicDim },
        { key: 'dark-serenity', title: 'Dark Serenity', palette: darkSerenity },
        { key: 'low-glare', title: 'Low Glare', palette: lowGlare },
        { key: 'bw', title: 'Black & White', palette: bw },
    ],
}

export class Core {
    figures = figures
    query = new URLSearchParams(location.search)
    glass = new Glass()
    
    constructor() {
        this.renderer = this.#getValue('renderer')
        this.palette = this.#getValue('palette')
        this.#setRenderer()
    }
    
    getCores(type) {
        return /** @type Cores */ core[type + 's']
    }
    
    #getValue(type) {
        const lsKey = 'tetris:' + type
        const cores = this.getCores(type)

        const coreKeys = cores.map(({ key }) => key)
        const defaultKey = cores.find(value => value.default)?.key ?? coreKeys[0]

        Object.assign(cores, {
            keys: coreKeys,
            default: defaultKey,
            ...(cores.reduce((accum, value) => ({ ...accum, [value.key]: value }), {}))
        })

        const keys = this.query.get(type)?.at(-1) === '!'
            ? [this.query.get(type).replace(/!+$/, '')]
            : [localStorage.getItem(lsKey), this.query.get(type)]

        const valueKey = [...keys, defaultKey].find(key => coreKeys.includes(key?.toLowerCase()))
        if (!valueKey) throw new Error(`Invalid ${type} key: ${valueKey ?? 'undefined'}`)

        cores.index = coreKeys.indexOf(valueKey)
        cores.key = valueKey
        
        return cores[valueKey]
    }
    
    #setRenderer() {
        this.render?.destruct()
        this.render = new this.renderer.renderer(this.glass, this.palette.palette, this)
    }
    
    change(type, value) {
        const cores = this.getCores(type)
        if (!cores.keys.includes(value)) return
        
        const lsKey = 'tetris:' + type
        localStorage.setItem(lsKey, value)
        cores.key = value
        cores.index = cores.keys.indexOf(value)
        
        this[type] = cores[value]
        this.#setRenderer()
        return cores[value]
    }
    
    next(type) {
        const cores = this.getCores(type)
        cores.index = (cores.index + 1) % cores.keys.length
        return this.change(type, cores.keys[cores.index])
    }
    
    prev(type) {
        const cores = this.getCores(type)
        cores.index = (cores.index - 1 + cores.keys.length) % cores.keys.length
        return this.change(type, cores.keys[cores.index])
    }
}