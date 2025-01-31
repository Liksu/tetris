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
        
        const figure = this.current
        const glass = this
        
        // get masks to compare with stored values, if any of bits is set, row is occupied
        const values = Array.from(Array(figure.height), (_, i) => {
            // T as example, width = 3, height = 2, top = 3, left = 5
            const indexShift = figure.width * i // 0, 3
            const mask = (1 << figure.width) - 1 // 0b111
            const value = (figure.value & (mask << indexShift)) >> indexShift // 0b10, 0b111
            return value << (glass.width - figure.width - figure.left) // 0b1000, 0b11100
        })

        // find first row with overlapping without all passed rows above
        let index = Array(figure.top).fill(0)
            .concat(glass.stored.slice(figure.top))
            .findIndex(row => values.some(value => row & value))
        
        // return the bottom placement if no overlapping
        if (index < 0) return glass.height - figure.height
        
        // Adjust index to account for the figure overlapping with a non-lowest brick
        index += values.findIndex(value => glass.stored[index] & value)
        index -= glass.stored
            .slice(index - figure.height, index)
            .reverse()
            .filter((row, i) => row & values[i])
            .length

        // clamp index to the lowest row
        if (index > glass.height) index = glass.height

        // Return the lowest row the figure can be placed at
        return index - figure.height
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