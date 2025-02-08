import {rnd, pick} from "../utils.js";

/**
 * @typedef FigureDescription
 * @type {object}
 * @property {number} value - bit mask for each rotated variant
 * @property {number} top - the top position of the first bit (left-top cell of the figure)
 * @property {number} left - the left position of the first bit
 * @property {number} width - current width of the (rotated) figure
 * @property {number} height - current height of the figure
 * @property {number} [state] - current rotation index
 * @property {string} [type] - figure type like 'T' or 'Z'
 */

/**
 * Example FigureDescription.value for L
 * width = 2, height = 3
 * First value represents the first the default rotation state related to the
 * width and height, width the clock-wise rotation direction. Read from left
 * to right, from top to bottom, in this case, by two bits at a time.
 *
 * Visual representation of the rotations:
 * +---+---+      +---+---+---+      +---+---+      +---+---+---+
 * | # |   |      | # | # | # |      | # | # |      |   |   | # |
 * +---+---+      +---+---+---+      +---+---+      +---+---+---+
 * | # |   |      | # |   |   |      |   | # |      | # | # | # |
 * +---+---+      +---+---+---+      +---+---+      +---+---+---+
 * | # | # |                         |   | # |
 * +---+---+                         +---+---+
 *
 * Bit mask representation for each rotation:
 * +---+---+      +---+---+---+      +---+---+      +---+---+---+
 * | 1 | 0 |      | 1 | 1 | 1 |      | 1 | 1 |      | 0 | 0 | 1 |
 * +---+---+      +---+---+---+      +---+---+      +---+---+---+
 * | 1 | 0 |      | 1 | 0 | 0 |      | 0 | 1 |      | 1 | 1 | 1 |
 * +---+---+      +---+---+---+      +---+---+      +---+---+---+
 * | 1 | 1 |                         | 0 | 1 |
 * +---+---+                         +---+---+
 * 
 * Bit mask values:
 * 0b101011       0b111100           0b110101       0b001111
 */

/**
 * @typedef Brick
 * @type {object}
 * @property {number} x
 * @property {number} y
 * @property {string} type
 * @property {boolean} [active]
 */

export class Figure {
    static Directions = {
        CW: 1,
        CCW: -1
    }
    static RotateDirection = Figure.Directions.CW

    width = 0
    height = 0
    values = []

    left = 0
    top = 0
    state = 0
    isRotatable = true

    #getValue(state) {
        return this.values[state]
    }

    get value() {
        return this.#getValue(this.state)
    }

    /**
     * @param maxWidth {number=10}
     * @return {Figure}
     */
    init(maxWidth = 10) {
        if (this.isRotatable) {
            const count = rnd(4)
            for (let i = 0; i < count; i++) {
                this.rotate()
            }
        }

        this.left = rnd(maxWidth - this.width)
        this.type = this.constructor.name

        return this
    }

    rotate() {
        if (!this.isRotatable) return;

        const rotated = this.getRotated();
        pick(rotated, 'width, height, state', this)
    }

    /**
     * @param {number} [state]
     * @return FigureDescription
     */
    getRotated(state) {
        const description = this.description
        if (!this.isRotatable) return description

        const originalState = description.state
        description.state = state ?? description.state + Figure.RotateDirection

        if (description.state < 0) description.state = this.values.length - 1
        if (description.state >= this.values.length) description.state = 0;

        if (description.state % 2 !== originalState % 2) {
            [description.width, description.height] = [description.height, description.width]
        }

        return {
            ...description,
            value: this.#getValue(description.state)
        }
    }

    /** @param shift {{top: number, left: number}} */
    move({top, left}) {
        this.top += top ?? 0
        this.left += left ?? 0
    }

    /**
     * @param description {FigureDescription|Figure}
     * @return {Brick[]}
     */
    getBricks(description = this) {
        const bricks = []
        const type = description.type
        let bitPosition = description.width * description.height - 1
        for (let y = description.top; y < description.top + description.height; y++) {
            for (let x = description.left; x < description.left + description.width; x++) {
                const bit = description.value >> bitPosition-- & 1
                if (bit) bricks.push({x, y, type})
            }
        }
        return bricks
    }
    
    getShadow(glass) {
        const lowestRow = glass.lowestRow()
        if (this.top >= lowestRow) return null
        return this.getBricks().map(brick => ({ ...brick, y: brick.y - this.top + lowestRow }))
    }

    /** @return FigureDescription */
    get description() {
        return pick(this, 'top, left, width, height, value, state, type, getBricks')
    }
}