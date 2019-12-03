const express = require('express');
const {signUp, signIn, signOut} = require('../controllers/auth.controller');
const { userById } = require('../controllers/user.controller');
const {userSignUpValidator} = require('../validator/index')
const router = express.Router();


router.post('/signup',userSignUpValidator, signUp);
router.post('/signin', signIn);
router.get('/signout', signOut);

//any route containing :userId, our app will first execute userById()
router.param('userId', userById)

module.exports = router;

