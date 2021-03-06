const express = require('express');
const { userById, 
        getAllUsers, 
        getUser, 
        updateUser, 
        deleteUser, 
        hasAuthorization, 
        userPhoto, 
        addFollowing,
        addFollower,
        removeFollowing,
        removeFollower,
        findPeople
    } = require('../controllers/user.controller');
const { requireSignIn } = require('../controllers/auth.controller')
const router = express.Router();

//Follow
router.put('/user/follow', requireSignIn, addFollowing, addFollower);    
//Unfollow
router.put('/user/unfollow', requireSignIn, removeFollowing, removeFollower);

//CRUD
router.get('/users', getAllUsers);
router.get('/user/:userId', requireSignIn, getUser);
router.put('/user/:userId', requireSignIn, hasAuthorization, updateUser);
router.delete('/user/:userId', requireSignIn, hasAuthorization, deleteUser);

//Photo
router.get('/user/photo/:userId', userPhoto);

//Who to follow
router.get('/user/findpeople/:userId', requireSignIn, findPeople);

//any route containing :userId, our app will first execute userById()
router.param('userId', userById)

module.exports = router;