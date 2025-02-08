import { opacity } from '../utils.js'
import { Render } from './render.js'

const brickSize = {value: 5, unit: 'vh'}
const getSize = (n = 1, fix = true) => {
    const size = brickSize.value * n + brickSize.unit
    if (!fix) return size
    return `calc(${size} + ${ fix === true ? '.5px' : (fix + 'px') })`
}

const css = palette => ({
    '.brick': {
        width: getSize(1),
        height: getSize(1),
        position: 'absolute',
        border: '1px solid var(--secondary-color)',
        boxSizing: 'border-box',
        backgroundColor: 'var(--main-color)',
        marginTop: '1px',

        // color: 'white',
        // fontWeight: 'bold',
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        // fontFamily: 'monospace',
    },
    
    // '.brick span': {
    //     color: 'silver',
    // },

    '.glass': {
        height: getSize(20, false),
        width: getSize(10),
        backgroundColor: palette.background,
        // margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        paddingRight: '1px',
    },
    
    '.phantom': {
        opacity: 0.32,
        borderColor: 'unset',
        // borderColor: 'var(--main-color)',
        // backgroundColor: palette.background,
    },
    
    'body': {
        padding: '0',
        margin: '0',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        gap: getSize(1),
    },
    
    '.info': {
        display: 'flex',
        flexDirection: 'column',
        gap: getSize(1),
        color: 'white',
        fontFamily: 'monospace',
        justifyContent: 'center',
    },
    
    '.preview': {
        width: getSize(4),
        height: getSize(4),
        backgroundColor: palette.background,
        overflow: 'hidden',
        paddingTop: '1px',
        paddingRight: '1px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    '.figure': {
        position: 'relative',
        overflow: 'hidden',
        padding: '1px',
    },
    
    '.score, .highscore': {
        fontSize: '2em',
    },
    
    '.message': {
        padding: '1em',
        backgroundColor: opacity(palette.background, 0.64),
        margin: '0 auto',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '64%',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.64)',
        borderRadius: '1em',
    },
    
    '.message p': {
        opacity: '1',
        color: 'white',
        fontSize: '3em',
        fontFamily: 'monospace',
        margin: '0',
    },
    
    '.palette': {
        color: 'silver',
    },
    
    '.speed': {
        color: 'silver',
        marginBottom: getSize(-1),
    },
    
    '.paused': {},
    
    '.game-over': {
        padding: '1.5em',
    },
    '.game-over .key': {
        color: 'silver',
        fontSize: '1em',
        marginTop: '1.2em',
        marginBottom: '0.8em',
    },
})

export class HtmlRender extends Render {
    constructor(glass, palette, core) {
        super(glass, palette, core, css)
    }
    
    redraw(state) {
        this.elements.glass.innerHTML = ''

        if (state.showShadow && this.glass.current) {
            const shadow = this.glass.current.getShadow(this.glass)
            if (shadow) {
                this.elements.glass.innerHTML = shadow
                    .map(brick => this.#drawBrick(brick, 'phantom'))
                    .join('\n')
            }
        }

        this.elements.glass.innerHTML += this.glass.bricks.map(row =>
            row.map(brick => this.#drawBrick(brick)).join('')
        ).join('\n')
        
        if (state.isPaused) this.elements.glass.innerHTML += this.#makeMessage(this.text.paused, 'paused')
        if (state.isOver) this.elements.glass.innerHTML += this.#makeMessage(this.text.gameOver, 'game-over', this.text.gameOverKey)

        this.elements.preview.innerHTML = this.#wrapFigure(state.next, state.next.getBricks().map(brick =>
            this.#drawBrick({...brick, x: brick.x - state.next.left, y: brick.y - state.next.top})
        ).join(''))
        
        this.elements.score.innerHTML = `${this.text.score}: ${state.score}`
        this.elements.highscore.innerHTML = `${this.text.highscore}: ${state.highscore}`
        if (!this.isTv) {
            this.elements.speed.innerHTML = `${this.text.speed}: ${state.speed}`
            this.elements.palette.innerHTML = `${this.text.palette}: ${this.core.palette.title}`
        }
    }
    
    #wrapFigure(figure, html) {
        return `<div class="figure" style="width: ${getSize(figure.width, 0)}; height: ${getSize(figure.height, 0)}">${html}</div>`        
    }
    
    #makeMessage(message, className = '', keyMessage = '') {
        if (!message) return ''
        
        let body = `<p class="main">${message}</p>`
        if (keyMessage) body += `<p class="key">${keyMessage}</p>`
        
        return `<div class="message ${className}">${body}</div>`
    }

    #drawBrick(brick, phantom = false) {
        if (!brick) return ' '

        const classes = ['brick', brick.type, brick.active ? 'active' : '', phantom ? 'phantom' : '']
            .filter(Boolean)
            .join(' ')

        const position = `top: ${getSize(brick.y, -0.5)}; left: ${getSize(brick.x)}`

        // return `<div class="${classes}" style="${position}"><span>${brick.x} x</span> ${brick.y}</div>`
        return `<div class="${classes}" style="${position}"></div>`
    }
}