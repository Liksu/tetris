import I from "./figures/I.js"
import J from "./figures/J.js"
import L from "./figures/L.js"
import O from "./figures/O.js"
import S from "./figures/S.js"
import T from "./figures/T.js"
import Z from "./figures/Z.js"

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


const types = { I, J, L, O, S, T, Z }
const palettes = [EGA, contrast, pastel, neon, retro, earthy, vivid, monochrome, matrix, aurora]

const figures = [
    { type: 'J', left: 2, top: 0, state: 0, width: 2, height: 3 },
    { type: 'J', left: 5, top: 2, state: 1, width: 3, height: 2 },
    { type: 'J', left: 0, top: 0, state: 2, width: 2, height: 3 },
    { type: 'J', left: 5, top: 0, state: 3, width: 3, height: 2 },
    { type: 'I', left: 0, top: 4, state: 0, width: 4, height: 1 },
    { type: 'I', left: 9, top: 0, state: 1, width: 1, height: 4 },
    { type: 'L', left: 0, top: 6, state: 0, width: 2, height: 3 },
    { type: 'L', left: 5, top: 5, state: 1, width: 3, height: 2 },
    { type: 'L', left: 2, top: 6, state: 2, width: 2, height: 3 },
    { type: 'L', left: 5, top: 7, state: 3, width: 3, height: 2 },
    { type: 'T', left: 2, top: 13, state: 0, width: 3, height: 2 },
    { type: 'T', left: 0, top: 11, state: 1, width: 2, height: 3 },
    { type: 'T', left: 2, top: 10, state: 2, width: 3, height: 2 },
    { type: 'T', left: 5, top: 11, state: 3, width: 2, height: 3 },
    { type: 'O', left: 8, top: 10, state: 0, width: 2, height: 2 },
    { type: 'Z', left: 6, top: 18, state: 0, width: 3, height: 2 },
    { type: 'Z', left: 0, top: 16, state: 1, width: 2, height: 3 },
    { type: 'S', left: 6, top: 15, state: 0, width: 3, height: 2 },
    { type: 'S', left: 3, top: 16, state: 1, width: 2, height: 3 },
]

export function makeFigure({type, ...description}) {
    const figure = new types[type]().init()
    Object.assign(figure, description)
    return figure
}

export function showAll(core, glass, render, gameState) {
    glass.reset()

    figures
        .map(makeFigure)
        .forEach(figure => {
            glass.add(figure, gameState)
        })
    
    let nextIndex = 0
    state.next = makeFigure(figures[nextIndex])
    
    render.redraw(gameState)
    
    let paletteIndex = 0
    
    document.addEventListener('keydown', (event) => {
        // change figure in preview
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            nextIndex += event.key === 'ArrowDown' ? -1 : 1
            if (nextIndex >= figures.length) nextIndex = 0
            if (nextIndex < 0) nextIndex = figures.length - 1
            state.next = makeFigure(figures[nextIndex])
            render.redraw(gameState)
        }
        
        // change color scheme
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            render.removeStyles()
            paletteIndex += event.key === 'ArrowRight' ? 1 : -1
            if (paletteIndex >= palettes.length) paletteIndex = 0
            if (paletteIndex < 0) paletteIndex = palettes.length - 1
            render.palette = palettes[paletteIndex]
            render.addStyles()
            render.redraw(gameState)
        }
    })
}