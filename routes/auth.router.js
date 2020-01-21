const express = require('express');
const {signUp, signIn, signOut, forgotPassword, resetPassword} = require('../controllers/auth.controller');
const { userById } = require('../controllers/user.controller');
const {userSignUpValidator, passwordResetValidator} = require('../validator/index')
const router = express.Router();


router.post('/signup',userSignUpValidator, signUp);
router.post('/signin', signIn);
router.get('/signout', signOut);
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', passwordResetValidator, resetPassword);

//any route containing :userId, our app will first execute userById()
router.param('userId', userById)

module.exports = router;

