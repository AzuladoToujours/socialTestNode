const express = require('express')
const {getPosts, createPost, getPostsByUser} = require ('../controllers/post.controller')
const { requireSignIn } = require('../controllers/auth.controller')
const { userById } = require('../controllers/user.controller');
const validator = require('../validator/index')
const router = express.Router() 

router.get('/', requireSignIn ,getPosts);
router.post('/post/new/:userId', requireSignIn , createPost, validator.createPostValidator);
router.get('/posts/by/:userId', requireSignIn, getPostsByUser)
//any route containing :userId, our app will first execute userById()
router.param("userId", userById)

module.exports = router;



