import { addStyles } from '../utils.js'

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
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
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
    },
})

export class Vga {
    constructor(glass, palette) {
        this.glass = glass
        this.palette = palette

        this.elements = {
            info: document.querySelector('.info'),
            score: document.querySelector('.score'),
            glass: document.querySelector('.glass'),
            preview: document.querySelector('.preview'),
            speed: document.querySelector('.speed'),
        }
        
        this.removeStyles = addStyles(css(palette), palette)
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

    destruct() {
        this.removeStyles()
    }
}