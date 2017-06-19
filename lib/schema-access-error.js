module.exports = function (msg, options) {
    this.message = msg;
    if (options) {
        this.options = options;
    }
}

module.exports.prototype = new Error