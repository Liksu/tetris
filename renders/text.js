import { Render } from './render.js'

const preview = {
    width: 4,
    height: 4
}

const styles = (palette, glass) => ({
    '.info': {
        float: 'left',
        marginRight: '1em',
        // display: 'none'
    },
    '.preview': {
        fontFamily: 'Courier New, monospace',
        whiteSpace: 'pre',
        lineHeight: '1em',
        display: 'inline-block',
        fontSize: '200%',
        height: preview.height + 'em',
        backgroundColor: palette.background,
        color: palette.empty,
    },
    score: {

    },
    '.glass': {
        fontFamily: 'Courier New, monospace',
        whiteSpace: 'pre',
        lineHeight: '1em',
        display: 'inline-block',
        fontSize: '200%',
        backgroundColor: palette.background,
        color: palette.empty,
        height: glass.height + 'em',
    },
    '.brick': {
        fontWeight: 'bold',
        color: `var(--main-color)`,
    }
})

export class TextRender extends Render {
    static Charsets = {
        Numbers: {
            brick: '1',
            empty: '0'
        },
        Blocks: {
            brick: '█',
            empty: '·'
        }
    }

    constructor(glass, palette, charset = TextRender.Charsets.Blocks) {
        super(glass, palette, styles)
        this.charset = charset
        this.#prepareView(palette)
    }
    
    #prepareView() {
        this.elements.scoreTitle = document.createElement('h1')
        this.elements.scoreTitle.innerHTML = 'Score:'
        this.elements.info.insertBefore(this.elements.scoreTitle, this.elements.score)

        this.elements.nextTitle = document.createElement('h1')
        this.elements.nextTitle.innerHTML = 'Next:'
        this.elements.info.insertBefore(this.elements.nextTitle, this.elements.preview)
    }

    redraw(state) {
        this.elements.glass.innerHTML = this.glass.bricks.map(row =>
            row.map(brick => this.#getBrickChar(brick)).join('')
        ).join('\n')

        const next = state.next.description
        next.left = Math.floor((preview.width - next.width) / 2)
        next.top = Math.floor((preview.height - next.height) / 2)

        const bricks = state.next.getBricks(next)

        this.elements.score.innerHTML = state.score ?? 0
        this.elements.preview.innerHTML = Array.from(
            {length: preview.height},
            (_, y) => Array.from(
                {length: preview.width},
                (_, x) => this.#getBrickChar(bricks.find(brick => brick.x === x && brick.y === y))
            ).join('')
        ).join('\n')
    }
    
    #getBrickChar(brick) {
        return brick ? `<span class="brick ${brick.type}">${this.charset.brick}</span>` : this.charset.empty
    }
    
    destruct() {
        super.destruct()
        this.elements.info.removeChild(this.elements.scoreTitle)
        this.elements.info.removeChild(this.elements.nextTitle)
    }
}