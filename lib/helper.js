module.exports = {
    isDefined: (obj) => {
        return typeof obj !== 'undefined'
    },
    isUndefined: (obj) => {
        return typeof obj === 'undefined'
    },
    isObject: (obj) => {
        return typeof obj === 'object'
    }
}