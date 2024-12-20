const asyncHandler = (requestHandle) => {
    return (req, res, next) => {
        Promise.resolve(
            requestHandle(req, res, next)
        ).catch((err) => {
            console.error(err, "Error into async handler ");
            next(err)
        })
    }
}

export  { asyncHandler }