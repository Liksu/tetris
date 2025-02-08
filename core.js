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

import EN from './langs/en.js'
import UA from './langs/ua.js'

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

/**
 * @typedef {Object} Query
 * @property {string} [renderer] - Keys from the core.renderers, like 'text' or 'html'. Can have ! at the end to indicate a forced value.
 * @property {string} [palette] - Keys from the core.palettes, like 'ega' or 'contrast'. Can have ! at the end to indicate a forced value.
 * @property {string} [lang] - Keys from the core.langs, like 'en' or 'ua'. Can have ! at the end to indicate a forced value.
 * @property {'tv'} [mode] - The mode key like 'tv', doesn't stored in local storage, cannot be forced.
 * @property {''} [tv] - The tv key, same as mode=tv, doesn't stored in local storage, cannot be forced.
 * @property {'show:figures'} [debug] - Special mode to show debug information
 */

const core = {
    renderers: [
        { key: 'text', title: 'Text', value: TextRender, default: true },
        { key: 'html', title: 'Html', value: HtmlRender },
    ],
    palettes: [
        { key: 'ega', title: 'EGA', value: EGA, default: true },
        { key: 'contrast', title: 'Contrast', value: contrast },
        { key: 'pastel', title: 'Pastel', value: pastel },
        { key: 'neon', title: 'Neon', value: neon },
        { key: 'retro', title: 'Retro', value: retro },
        { key: 'earthy', title: 'Earthy', value: earthy },
        { key: 'vivid', title: 'Vivid', value: vivid },
        { key: 'monochrome', title: 'Monochrome', value: monochrome },
        { key: 'matrix', title: 'Matrix', value: matrix },
        { key: 'aurora', title: 'Aurora', value: aurora },
        { key: 'classic-dim', title: 'Classic Dim', value: classicDim },
        { key: 'dark-serenity', title: 'Dark Serenity', value: darkSerenity },
        { key: 'low-glare', title: 'Low Glare', value: lowGlare },
        { key: 'bw', title: 'Black & White', value: bw },
    ],
    langs: [
        { key: 'en', title: 'English', value: EN, default: true },
        { key: 'ua', title: 'Українська', value: UA },
    ],
}

export class Core {
    figures = figures
    query = new URLSearchParams(location.search)
    glass = new Glass()
    
    constructor() {
        this.renderer = this.#getValue('renderer')
        this.palette = this.#getValue('palette')
        this.lang = this.#getValue('lang')
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
        this.render = new this.renderer.value(this.glass, this.palette.value, this)
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