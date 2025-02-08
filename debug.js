import I from "./figures/I.js"
import J from "./figures/J.js"
import L from "./figures/L.js"
import O from "./figures/O.js"
import S from "./figures/S.js"
import T from "./figures/T.js"
import Z from "./figures/Z.js"
import { addStyles } from './utils.js'


const types = { I, J, L, O, S, T, Z }

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

function showPalettes(render, core) {
    render.elements.palette.innerHTML = core.getCores('palette').keys
        .map(key => [key, key === core.palette.key ? 'active' : '', core.getCores('palette')[key].title])
        .map(([key, className, title]) => `<p class="${className}">${title}</p>`)
        .join('')
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
    showPalettes(render, core)
    
    addStyles({
        '.palette': {
            display: 'flex',
            justifyContent: 'center',
            gap: '0',
            flexDirection: 'column',
        },
        '.palette p': {
            margin: '0',
        },
        '.palette .active': {
            color: 'white',
            fontWeight: 'bold',
        },
    })
    
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') core.next('palette')
        if (event.key === 'ArrowLeft') core.prev('palette')
        if (event.key === 'Escape') core.next('renderer')
        
        // change figure in preview
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            nextIndex += event.key === 'ArrowDown' ? -1 : 1
            if (nextIndex >= figures.length) nextIndex = 0
            if (nextIndex < 0) nextIndex = figures.length - 1
            state.next = makeFigure(figures[nextIndex])
            render.redraw(gameState)
        }

        render.redraw(gameState)
        showPalettes(render, core)
    })
}