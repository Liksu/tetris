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
