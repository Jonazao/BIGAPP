class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = this.statusCode;   
        }
}

module.exports = ExpressError
//ExpressError es un constructor que permite detectar errores según disponga la necesidad del código