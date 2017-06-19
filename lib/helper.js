module.exports = {
    generateUsefulError: (msg, values) => {
        return `${msg}\n  available options:\n\t${Object.keys(values).join('\n\t')}`
    }
}