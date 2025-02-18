export function rnd(max) {
    if (max instanceof Array) {
        return max[Math.floor(Math.random() * max.length)]
    }

    return Math.floor(Math.random() * max)
}

export function pick(from, properties, to) {
    if (String(properties) === properties) {
        properties = properties.split(/[,\s]+/)
    }

    const slice = properties.reduce((accum, key) => ({
        ...accum,
        [key]: from[key]
    }), {})

    if (to) {
        Object.assign(to, slice)
    }

    return slice
}

export function addStyles(styles, palette = {}) {
    let css = Object.entries(palette)
        .map(([name, color]) => `.${name} {--main-color: ${color.main ?? color}; --secondary-color: ${color.secondary ?? color}}`)
        .join('\n')
    
    if (css) css += '\n'
    
    css += Object.entries(styles).map(([selector, rules]) => {
        const tmp = document.createElement('div')
        Object.assign(tmp.style, rules)
        return `${selector} {${tmp.style.cssText}}`
    }).join('\n')

    const styleElement = document.createElement('style')
    styleElement.appendChild(document.createTextNode(css))
    document.head.appendChild(styleElement)
    
    return () => styleElement.remove()
}

export function opacity(color, alpha = 1) {
    const [r, g, b] = color.match(/\w\w/g).map(hex => parseInt(hex, 16))
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

Array.prototype.tap = function(callback) {
    callback(this)
    return this
}
