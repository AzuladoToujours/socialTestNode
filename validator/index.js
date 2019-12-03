exports.createPostValidator = (req, res, next) => {
    //title
    req.check('title', "Write a title").notEmpty()
    req.check('title', 'Title must be between 4 to 150 characters').isLength({
        min: 4,
        max: 150
    });
    //body
    req.check('body', "Write a body").notEmpty()
    req.check('body', 'Body must be between 4 to 2000 characters').isLength({
        min: 4,
        max: 2000
    });
    //Check for error
    const errors = req.validationErrors()
    //if error show the first one as they happend
    if(errors){
        const firstError = errors.map((error) => error.msg)[0]
        return res.status(400).json({error: firstError});
    }
    //Proceed to next middleware
    next();
};

exports.userSignUpValidator = (req, res, next) => {
    //NAME IS NOT NULL AND BETWEEN 4-10
    req.check('name', 'Name is required').notEmpty();
    //email is not null, valid and normalized
    req.check('email', "Email must be between 3 to 32 characters")
    .matches(/.+\@.+\..+/)
    .withMessage('Email must contain @')
    .isLength({
        min: 4,
        max: 2000
    })
    //Check for password
    req.check('password', 'Password is required').notEmpty();
    req.check('password')
    .isLength({min: 6})
    .withMessage('Password must contain at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    //Check for errors
    //Check for error
    const errors = req.validationErrors()
    //if error show the first one as they happend
    if(errors){
        const firstError = errors.map((error) => error.msg)[0]
        return res.status(400).json({error: firstError});
    }
    //Proceed to next middleware
    next();
};