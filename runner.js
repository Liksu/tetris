import {TextRender} from "./renders/text.js"
import I from "./figures/I.js"
import J from "./figures/J.js"
import L from "./figures/L.js"
import O from "./figures/O.js"
import S from "./figures/S.js"
import T from "./figures/T.js"
import Z from "./figures/Z.js"
import {Glass} from "./glass.js"
import EGA from './palettes/EGA.js'
import {rnd, pick} from './utils.js'

const figures = [I, J, L, O, S, T, Z]
Object.assign(figures, {I, J, L, O, S, T, Z})

const glass = new Glass()
const render = new TextRender(glass, EGA)

/**
 * @typedef State
 * @type {object}
 * @property {Figure} next
 * @property {number} score
 * @property {boolean} isOver
 * @property {number} speed
 */

const state = {}

const settings = {
    speed: {
        min: 32,
        max: 800
    }
}

function addFigure() {
    const figure = state.next
    state.next = getNext()
    const placed = glass.add(figure, state)
    if (!placed) stop()
    render.redraw(state)
    window.figure = figure
}

function getNext(figureConstructor = rnd(figures)) {
    return new (figureConstructor)().init(glass.width)
}

/*
[
    {type: 'L', left: 7, top: 18, state: 3},
    {type: 'L', left: 6, top: 18, state: 1},
    {type: 'T', left: 7, top: 16, state: 2},
    {type: 'I', left: 0, top: 16, state: 1},
    {type: 'I', left: 2, top: 16, state: 1},
    {type: 'I', left: 4, top: 16, state: 1},
    {type: 'O', left: 0, top: 14, state: 0},
    {type: 'O', left: 2, top: 14, state: 0},
    {type: 'O', left: 4, top: 14, state: 0},
    {type: 'O', left: 6, top: 14, state: 0},
    {type: 'O', left: 0, top: 12, state: 0},
    {type: 'O', left: 2, top: 12, state: 0},
    {type: 'O', left: 4, top: 12, state: 0},
    {type: 'O', left: 6, top: 12, state: 0},
    {type: 'I', left: 8, top: 12, state: 1},
    {type: 'J', left: 0, top: 10, state: 1},
    {type: 'J', left: 0, top: 9, state: 3},
    {type: 'O', left: 0, top: 7, state: 0},
].forEach(step => {
    const figure = new figures[step.type]()
    const {width, height} = figure.getRotated(step.state)
    Object.assign(figure, {...step, width, height})
    glass.add(figure, state)
})
state.next = getNext(I)
*/

//Array.from({length: 500}, (_, score) => 800-Math.log10(score/16+0.2)*600).map(n => n > 800 ? 800 : n < 32 ? 32 : n)

Object.assign(window, {
    figures, glass, render, state
})

function stop() {
    console.log('Game Over')
    state.isOver = true
}

function keyboardHandler(event) {
    if (state.isOver) {
        if (event.key === 'n') {
            start(this)
        }

        return
    }

    switch (event.key) {
        case 'ArrowUp':
            glass.rotate()
            break
        case 'ArrowDown':
            glass.move({top: 1})
            break
        case 'ArrowLeft':
            glass.move({left: -1})
            break
        case 'ArrowRight':
            glass.move({left: 1})
            break
        case 'Pause':
            break
        case 'Enter':
        case ' ': // pull down
            while (glass.move({top: 1})) {}
            addFigure()
            break
        case 'n': // restart
            start(true)
            break
        case '+': // speed up
            break
        case '-': // speed down
            break
        case 'i':
            state.next = getNext(I)
            render.redraw(state)
            break
        case 'j':
            state.next = getNext(J)
            render.redraw(state)
            break
        case 'l':
            state.next = getNext(L)
            render.redraw(state)
            break
        case 'o':
            state.next = getNext(O)
            render.redraw(state)
            break
        case 's':
            state.next = getNext(S)
            render.redraw(state)
            break
        case 't':
            state.next = getNext(T)
            render.redraw(state)
            break
        case 'z':
            state.next = getNext(Z)
            render.redraw(state)
            break
        case 'Escape':  // swap next
            const {top, left} = glass.current
            const canBePlaced = glass.check({...state.next.description, top, left})
            if (canBePlaced) {
                [state.next, glass.current] = [glass.current, state.next]
                Object.assign(glass.current, {top, left})
            }
            render.redraw(state)
            break
    }

    render.redraw(state)
}
document.addEventListener('keydown', keyboardHandler)

function start(again = false) {
    if (again) {
        glass.reset()
    }

    Object.assign(state, {
        score: 0,
        next: getNext(),
        isOver: false,
        speed: 1
    })

    addFigure()
    setTimeout(step, settings.speed.max)
}

function step() {
    if (glass.move({top: 1})) render.redraw(state)
    else addFigure()

    if (state.isOver) return;

    const duration = 800 - Math.log10(state.score / 16 + 0.2) * 600
    setTimeout(step, duration > settings.speed.max ? settings.speed.max : duration < settings.speed.min ? settings.speed.min : duration)
}

start()