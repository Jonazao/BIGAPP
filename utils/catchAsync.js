module.exports = func =>{
    return (req, res, next)=>{
        func(req, res, next).catch(next);
    }
}
//Si no hay errrores asíncronos, catchAsync llaama a una función a que a su vez llama a next