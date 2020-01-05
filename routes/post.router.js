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
    getPost,
    like,
    unlike,
    comment,
    uncomment
} = require ('../controllers/post.controller')
const { requireSignIn } = require('../controllers/auth.controller')
const { userById } = require('../controllers/user.controller');
const validator = require('../validator/index')
const router = express.Router() 

//New post
router.post('/post/new/:userId', requireSignIn , createPost, validator.createPostValidator);
//Get all posts
router.get('/posts' , getPosts);
// Like
router.put('/post/like', requireSignIn, like);
//Unlike
router.put('/post/unlike', requireSignIn, unlike);
//Comment
router.put('/post/comment', requireSignIn, comment);
//Uncomment
router.put('/post/uncomment', requireSignIn, uncomment);
//Get a single post
router.get('/post/:postId', getPost)
//Get posts by user
router.get('/posts/by/:userId', requireSignIn, getPostsByUser)
//Delete a post
router.delete('/post/:postId', requireSignIn, isPoster, deletePost)
//Update a post
router.put('/post/:postId', requireSignIn, isPoster, updatePost)


//Photo
router.get('/post/photo/:postId', postPhoto);



//any route containing :userId, our app will first execute userById()
router.param("userId", userById)
//any route containing :postId, our app will first execute postById()
router.param("postId", postById)

module.exports = router;



