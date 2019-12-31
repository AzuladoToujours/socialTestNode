const express = require('express')
const {
    getPosts, 
    createPost, 
    getPostsByUser, 
    postById, 
    isPoster, 
    deletePost, 
    updatePost,
    postPhoto,
    getPost
} = require ('../controllers/post.controller')
const { requireSignIn } = require('../controllers/auth.controller')
const { userById } = require('../controllers/user.controller');
const validator = require('../validator/index')
const router = express.Router() 

//CRUD
router.post('/post/new/:userId', requireSignIn , createPost, validator.createPostValidator);
router.get('/posts' , getPosts);
router.get('/post/:postId', getPost)
router.get('/posts/by/:userId', requireSignIn, getPostsByUser)
router.delete('/post/:postId', requireSignIn, isPoster, deletePost)
router.put('/post/:postId', requireSignIn, isPoster, updatePost)


//Photo
router.get('/post/photo/:postId', postPhoto);

//any route containing :userId, our app will first execute userById()
router.param("userId", userById)
//any route containing :postId, our app will first execute postById()
router.param("postId", postById)

module.exports = router;



