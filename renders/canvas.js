import { Render } from './render.js'
import { opacity } from '../utils.js'

const brickSize = Math.min(window.innerWidth, window.innerHeight) / 20
const shadowOpacity = 0.32
const messagePadding = 26
const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

export class CanvasRenderer extends Render {
    #layers = {}
    
    constructor(glass, palette, core) {
        super(glass, palette, core, () => ({
            '*': { margin: 0, padding: 0 },
            body: { backgroundColor: 'black' },
            canvas: { display: 'block' },
        }))
        
        this.#init()
    }
    
    #createLayer(name, x, y, width, height) {
        const canvas = document.createElement('canvas')
        canvas.id = name
        canvas.width = width ?? window.innerWidth
        canvas.height = height ?? window.innerHeight
        
        Object.assign(canvas.style, {
            position: 'absolute',
            left: `${x ?? 0}px`,
            top: `${y ?? 0}px`,
        })

        document.body.appendChild(canvas)
        return canvas.getContext('2d')
    }

    #init() {
        this.htmlStore = document.body.innerHTML
        document.body.innerHTML = ''

        this.#layers.info = this.#createLayer('info', center.x - brickSize * 8, 0, brickSize * 4)
        this.#layers.glass = this.#createLayer('glass', center.x - brickSize * 3, 0, brickSize * 10)
        this.#layers.current = this.#createLayer('current', center.x - brickSize * 3, 0, brickSize * 10)
        this.#layers.message = this.#createLayer('message', center.x - brickSize * 3, 0, brickSize * 10)
    }

    destruct() {
        document.body.innerHTML = this.htmlStore
    }
    
    #writeText(text, x, y, options = {}, target = 'info', measure = false) {
        let fontSize = options.fontSize ?? options.size
        if (fontSize && !/\D$/.test(fontSize)) fontSize = (fontSize * 16) + 'px'
        const lineHeight = options.lineHeight ? '/' + options.lineHeight : null
        const font = [
            options.fontWeight ?? options.fontStyle ?? options.bold ?? options.italic,
            fontSize ?? '16px',
            lineHeight,
            options.fontFamily ?? 'monospace',
        ].filter(Boolean).join(' ')

        Object.assign(this.#layers[target], {
            textAlign: 'left',
            textBaseline: 'top',
            font,
            ...options,
            fillStyle: options.fillStyle ?? options.color ?? 'white',
        })
        
        if (!measure) this.#layers[target].fillText(text, x, y)
        return this.#layers[target].measureText(text)
    }

    #drawFigure(target, figureBricks, phantom = false) {
        if (!figureBricks) return

        figureBricks.forEach(brick => this.#drawBlock(target, brick, phantom))
    }
    
    #drawBlock = (target, brick, phantom = false) => {
        if (!brick) return
        const context = this.#layers[target]
        
        let mainColor = this.palette[brick.type].main ?? this.palette[brick.type]
        if (phantom) mainColor = opacity(mainColor, shadowOpacity)
        
        context.fillStyle = mainColor
        context.fillRect(brick.x * brickSize, brick.y * brickSize, brickSize, brickSize)
        
        let secondaryColor = this.palette[brick.type].secondary ?? this.palette[brick.type]
        if (phantom) secondaryColor = opacity(secondaryColor, shadowOpacity)
        
        context.strokeStyle = secondaryColor
        context.strokeRect(brick.x * brickSize, brick.y * brickSize, brickSize, brickSize)
    }

    #drawGlass() {
        this.#layers.glass.fillStyle = this.palette.background
        this.#layers.glass.fillRect(0, 0, this.#layers.glass.canvas.width, this.#layers.glass.canvas.height)
        this.glass.bricks.forEach(row => row.forEach(brick => this.#drawBlock('glass', brick)))
    }

    #drawCurrent(state) {
        this.#layers.current.clearRect(0, 0, this.#layers.current.canvas.width, this.#layers.current.canvas.height)
        if (!this.glass.current) return
        
        if (state.showShadow) {
            const shadow = this.glass.current.getShadow(this.glass)
            if (shadow) this.#drawFigure('current', shadow, 'phantom')
        }

        this.#drawFigure('current', this.glass.current.getBricks())
    }
    
    #drawInfo(state) {
        const { width, height } = this.#layers.info.canvas
        this.#layers.info.clearRect(0, 0, width, height)
        
        this.#writeText(`${this.text.score}: ${state.score}`, 0, center.y - 4 * brickSize, { size: 2 })
        this.#writeText(`${this.text.speed}: ${state.speed}`, 0, center.y - 4 * brickSize + 44)
        this.#writeText(`${this.text.highscore}: ${state.highscore}`, 0, center.y + 3 * brickSize, { size: 2 })
        
        if (!this.isTv) {
            this.#writeText(`${this.text.palette}: ${this.core.palette.title}`, 0, center.y + 4 * brickSize + 20)
        }
        
        // preview
        this.#writeText(`${this.text.next}:`, 0, center.y - brickSize * 2 - 22, { size: 1.2 })
        this.#layers.info.fillStyle = this.palette.background
        this.#layers.info.fillRect(0, center.y - brickSize * 2, brickSize * 4, brickSize * 4)
        this.#layers.info.translate((brickSize * 4 - state.next.width * brickSize) / 2, center.y - state.next.height * brickSize / 2)
        this.#drawFigure('info', state.next.getBricks().map(brick => ({
            ...brick,
            x: brick.x - state.next.left,
            y: brick.y - state.next.top,
        })))
        this.#layers.info.setTransform(1, 0, 0, 1, 0, 0)
    }
    
    #drawMessage(texts) {
        const { width: canvasWidth, height: canvasHeight } = this.#layers.message.canvas
        const ctx = this.#layers.message
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        
        if (!texts?.length) return
        
        let totalHeight = 0
        let startY = 0
        let totalWidth = 0
        let startX = 0
        
        texts
            .map(text => typeof text === 'string' ? { text } : text)
            .map(text => ({ ...text, options: { size: 3, ...text.options } })) // make copy of text object
            .map(param => {
                param.measure = this.#writeText(param.text, 0, 0, param.options, 'message', true)
                param.height = param.measure.actualBoundingBoxAscent + param.measure.actualBoundingBoxDescent + (param.options.marginTop ?? 0)
                param.width = param.measure.width
                return param
            })
            .tap(params => {
                totalHeight = params.reduce((acc, param) => acc + param.height, 0)
                startY = (canvasHeight - totalHeight) / 2
                totalWidth = Math.max(...params.map(param => param.width))
                startX = (canvasWidth - totalWidth) / 2
            })
            .tap(() => {
                ctx.strokeStyle = 'white'
                ctx.fillStyle = opacity(this.palette.background, 0.82)
                ctx.beginPath()
                const messageWidth = Math.max(totalWidth + messagePadding * 2, canvasWidth * 0.64)
                ctx.roundRect(
                    (canvasWidth - messageWidth) / 2,
                    startY - messagePadding,
                    messageWidth,
                    totalHeight + messagePadding * 2,
                    messagePadding / 2
                )
                ctx.stroke()
                ctx.fill()
            })
            .map((param, i, params) => {
                const x = param.options.align === 'center'
                    ? center.x - param.width / 2
                    : param.options.align === 'right'
                        ? startX + totalWidth - param.width
                        : startX
                
                const y = params.slice(0, i).reduce((acc, p) => acc + p.height, startY) + (param.options.marginTop ?? 0)
                
                return { ...param, x, y }
            })
            .forEach(param => {
                this.#writeText(param.text, param.x, param.y, param.options, 'message')
            })
    }

    redraw(state) {
        this.#drawGlass()
        this.#drawCurrent(state)
        this.#drawInfo(state)

        if (state.isOver) this.#drawMessage([this.text.gameOver, {text: this.text.gameOverKey, options: { size: 1, marginTop: 12 }}])
        else if (state.isPaused) this.#drawMessage([this.text.paused])
        else this.#drawMessage()
    }
}