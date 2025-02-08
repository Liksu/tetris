export class Glass {
    width = 10
    height = 20

    stable = []
    /** @type {Figure} */
    current = null

    fullLine = (1 << this.width) - 1

    /**
     * @param figure {Figure|FigureDescription}
     * @return boolean
     */
    check(figure= this.current) {
        if (!figure) return false;

        if (figure.left < 0 || figure.left + figure.width > this.width) return false
        if (figure.top + figure.height > this.height) return false

        const rows = this.stored
        const hasOverlapping = figure.getBricks()
            .some(brick => rows[brick.y] >> (this.width - brick.x - 1) & 1)

        return !hasOverlapping
    }
    
    lowestRow() {
        if (!this.current) return 0
        const description = this.current.description
        
        do description.top++
        while (this.check(description))

        return description.top - 1
    }

    /** @param shift {{top: number, left: number}} */
    move(shift) {
        if (!this.current) return;

        const description = this.current.description
        description.left += shift.left ?? 0
        description.top += shift.top ?? 0

        const canMove = this.check(description)
        if (!canMove) return;

        // if movement is possible, move
        this.current.move(shift)
        return true
    }

    rotate() {
        if (!this.current) return;

        const description = this.current.getRotated()
        const canRotate = this.check(description)
        if (!canRotate) return;

        this.current.rotate()
        return true;
    }

    /**
     * @param figure {Figure}
     * @param state {State}
     */
    add(figure, state) {
        const removedRows = this.store()
        state.score += removedRows ?? 0 // glass shouldn't know about score
        if (state.score > state.highscore) state.highscore = state.score

        const canPlace = this.check(figure)
        if (!canPlace) return false

        this.current = figure
        // this.valuesCache = this.stored
        return true
    }

    store() {
        if (!this.current) return;
        this.stable.push(...this.current.getBricks())
        this.current = null

        // find fully filled rows
        const fullRows = this.stored
            .map((row, i) => row === this.fullLine && i)
            .filter(i => i !== false)
            .reverse()

        // remove bricks from filled rows
        this.stable = this.stable.filter(brick => !fullRows.includes(brick.y))

        const shiftDiff = {}
        this.stable.forEach(brick => {
            if (shiftDiff[brick.y] == null) {
                const index = fullRows.findIndex(row => brick.y > row)
                shiftDiff[brick.y] = !~index ? fullRows.length : index
            }

            brick.y += shiftDiff[brick.y]
        })

        return fullRows.length
    }

    // get values() {
    //     const rows = [...this.valuesCache]
    //     if (!this.current) return rows
    //
    //     const {width, height, top, left, value} = this.current
    //
    //     const mask = (1 << width) - 1
    //     const position = this.width - left - width
    //
    //     for (let y = 0; y < height; y++) {
    //         const shift = height - 1 - y
    //         rows[top + y] |= (value >> shift * width & mask) << position
    //     }
    //
    //     return rows
    // }

    get bricks() {
        const rows = Array.from({length: this.height}, () => Array.from({length: this.width}, () => null))
        this.stable.forEach(brick => rows[brick.y][brick.x] = ({...brick, active: false}))
        this.current?.getBricks().forEach(brick => rows[brick.y][brick.x] = ({...brick, active: true}))
        return rows
    }

    /** @returns {number[]} */
    get stored() {
        const rows = Array.from({length: this.height}, () => 0)
        this.stable.forEach(brick => {
            rows[brick.y] |= 1 << (this.width - brick.x - 1)
        })
        return rows
    }

    reset() {
        this.stable = []
        this.current = null
    }
}