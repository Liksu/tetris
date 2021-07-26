const preview = {
    width: 4,
    height: 4
}

const styles = {
    info: {
        float: 'left',
        marginRight: '1em',
        // display: 'none'
    },
    preview: {
        fontFamily: 'Courier New, monospace',
        whiteSpace: 'pre',
        lineHeight: '1em',
        display: 'inline-block',
        fontSize: '200%',
        height: preview.height + 'em'
    },
    score: {

    },
    glass: {
        fontFamily: 'Courier New, monospace',
        whiteSpace: 'pre',
        lineHeight: '1em',
        display: 'inline-block',
        fontSize: '200%'
    },
    brick: {
        fontWeight: 'bold'
    }
}

export class TextRender {
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

    cache = {}
    /** @type {Glass} */
    glass = null

    constructor(glass, palette, charset = TextRender.Charsets.Blocks) {
        this.charset = charset
        Object.assign(styles.glass, {
            height: glass.height + 'em'
        })
        this.#stylize(palette)
        this.glass = glass
    }

    #stylize(palette) {
        Object.assign(styles.glass, {
            backgroundColor: palette.background,
            color: palette.empty,
        })

        Object.assign(styles.preview, {
            backgroundColor: palette.background,
            color: palette.empty,
        })

        let css = Object.entries(palette)
            .map(([name, color]) => `.${name} {color: ${color.main}}`)
            .join('\n')

        Object.entries(styles).forEach(([key, value]) => {
            const element = document.querySelector('.' + key)
            if (element) {
                this.cache[key] = element
                Object.assign(this.cache[key].style, value)
            } else {
                const tmp = document.createElement('div')
                Object.assign(tmp.style, value)
                css += `.${key} {${tmp.style.cssText}}`
            }
        })

        this.cache.additionalStyles = document.createElement('style');
        this.cache.additionalStyles.appendChild(document.createTextNode(css))
        document.head.appendChild(this.cache.additionalStyles)

        const scoreTitle = document.createElement('h1')
        scoreTitle.innerHTML = 'Score:'
        this.cache.info.insertBefore(scoreTitle, this.cache.score)

        const nextTitle = document.createElement('h1')
        nextTitle.innerHTML = 'Next:'
        this.cache.info.insertBefore(nextTitle, this.cache.preview)
    }

    redraw(state) {
        this.cache.glass.innerHTML = this.glass.bricks.map(row =>
            row.map(brick => this.#getBrickChar(brick)).join('')
        ).join('\n')

        const next = state.next.description
        next.left = Math.floor((preview.width - next.width) / 2)
        next.top = Math.floor((preview.height - next.height) / 2)

        const bricks = state.next.getBricks(next)

        this.cache.score.innerHTML = state.score ?? 0
        this.cache.preview.innerHTML = Array.from(
            {length: preview.height},
            (_, y) => Array.from(
                {length: preview.width},
                (_, x) => this.#getBrickChar(bricks.find(brick => brick.x === x && brick.y === y))
            ).join('')
        ).join('\n')
    }

    destruct() {
        this.cache.additionalStyles.remove()
    }

    #getBrickChar(brick) {
        return brick ? `<span class="brick ${brick.type}">${this.charset.brick}</span>` : this.charset.empty
    }
}