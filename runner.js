import { rnd } from './utils.js'
import { showAll } from './debug.js'
import { Core } from './core.js'

const core = new Core()

/**
 * @typedef State
 * @type {object}
 * @property {Figure} next
 * @property {number} score
 * @property {number} highscore
 * @property {boolean} isOver
 * @property {boolean} isPaused
 * @property {boolean} showShadow
 * @property {number} speed
 */

let highscore = +localStorage.getItem('tetris:highscore') || 0
const state = {
    get highscore() { return highscore },
    set highscore(newHighscore) {
        highscore = newHighscore
        localStorage.setItem('tetris:highscore', newHighscore)
    }
}

const settings = {
    speed: {
        min: 6,
        max: 64,
        default: 24,
    },
    restartKeys: ['n', ' ', 'Enter'],
}

let timerId = null
let speedLn = 1 / Math.log(settings.speed.default)

function setSpeed(delta = 1) {
    state.speed += delta
    if (state.speed < settings.speed.min) state.speed = settings.speed.min
    if (state.speed > settings.speed.max) state.speed = settings.speed.max
    
    speedLn = 1 / Math.log(state.speed)
}

function addFigure() {
    const figure = state.next
    state.next = getNext()
    const placed = core.glass.add(figure, state)
    if (!placed) stop()
    core.render.redraw(state)
    window.figure = figure
}

function getNext(figureConstructor = rnd(core.figures)) {
    return new (figureConstructor)().init(core.glass.width)
}

Object.assign(window, {
    figures: core.figures, glass: core.glass, render: core.render, state, settings, core
})

function stop() {
    console.log('Game Over')
    state.isOver = true
}

function keyboardHandler(event) {
    if (state.isOver) {
        if (settings.restartKeys.includes(event.key)) {
            start(this)
        }

        return
    }

    switch (event.key) {
        case 'ArrowUp':
            core.glass.rotate()
            break
        case 'ArrowDown':
            if (!state.isPaused) core.glass.move({top: 1})
            break
        case 'ArrowLeft':
            core.glass.move({left: -1})
            break
        case 'ArrowRight':
            core.glass.move({left: 1})
            break
        case 'Pause':
        case 'p':
            pause()
            break
        case 'Enter':
        case ' ': // pull down
            if (state.isPaused) break
            while (core.glass.move({top: 1})) {}
            addFigure()
            break
        case 'n': // 'new', restart
            start(true)
            break
        case '+': // speed up
            setSpeed(1)
            break
        case '-': // speed down
            setSpeed(-1)
            break
        case 'h':
            state.showShadow = !state.showShadow
            break
        case 'i':
            state.next = getNext(core.figures.I)
            core.render.redraw(state)
            break
        case 'j':
            state.next = getNext(core.figures.J)
            core.render.redraw(state)
            break
        case 'l':
            state.next = getNext(core.figures.L)
            core.render.redraw(state)
            break
        case 'o':
            state.next = getNext(core.figures.O)
            core.render.redraw(state)
            break
        case 's':
            state.next = getNext(core.figures.S)
            core.render.redraw(state)
            break
        case 't':
            state.next = getNext(core.figures.T)
            core.render.redraw(state)
            break
        case 'z':
            state.next = getNext(core.figures.Z)
            core.render.redraw(state)
            break
        case 'Escape':  // swap next
            const {top, left} = core.glass.current
            const canBePlaced = core.glass.check({...state.next.description, top, left})
            if (canBePlaced) {
                [state.next, core.glass.current] = [core.glass.current, state.next]
                Object.assign(core.glass.current, {top, left})
            }
            core.render.redraw(state)
            break
        case 'c': // 'color', change palette
            core.next('palette')
            core.render.redraw(state)
            break
        case 'v': // 'view', change renderer
            core.next('renderer')
            core.render.redraw(state)
            break
    }

    core.render.redraw(state)
}
document.addEventListener('keydown', keyboardHandler)

function pause() {
    state.isPaused = !state.isPaused
    if (!state.isPaused) step()
    else {
        clearTimeout(timerId)
        core.render.redraw(state)
    }
}

function resetState() {
    Object.assign(state, {
        score: 0,
        next: getNext(),
        isOver: false,
        isPaused: false,
        speed: settings.speed.default,
    })
}

function start(again = false) {
    if (again) core.glass.reset()
    resetState()
    addFigure()
    clearTimeout(timerId)
    setTimeout(step, settings.speed.max)
}

function step() {
    if (state.isPaused) return;
    
    if (core.glass.move({top: 1})) core.render.redraw(state)
    else addFigure()

    if (state.isOver) return;

    const duration = (860 - state.score) - Math.log(state.score / 16 + 0.2) * speedLn * 600
    timerId = setTimeout(step, duration)
}

if (core.query.get('debug') === 'show:figures') {
    document.removeEventListener('keydown', keyboardHandler)
    resetState()
    showAll(core, core.glass, core.render, state)
} else {
    start()
}