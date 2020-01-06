const _ = require('lodash')
const User = require("../models/user.models");
const fs = require('fs')
const formidable = require('formidable')


//For any route containing the "userId" param
exports.userById = (req, res, next, id) => {
    User.findById(id)
    //Populate followers and following users array
    .populate('following', '_id name')
    .populate('followers', '_id name')
    .exec((err, user) => {
        if(err || !user ){
            //res.status(400).json({ error: 'User not found ' })
            //This to not show the error of the undefined, https://expressjs.com/es/api.html#res.end
            res.end()
        }
        req.profile = user //adds profile object in req with the user info
        next()
    });
};

exports.hasAuthorization = (req, res, next) => {
     /*If the profile in the req exist, if the auth exist and if the id 
    in the profile matches the id of the auth*/

    const authorized = req.profile && req.auth && req.profile._id == req.auth._id
    if(!authorized) {
        return res.status(403).json({ error: 'User is not authorized to perform this action'});
    }
    next()
};

//Get's all users with the selected information
exports.getAllUsers = (req, res) => {
    User.find((err, users) => {
        if (err || !users){
            return res.status(400).json({ error: err});
        }

        res.json(users)
        
    }).select('name email updated created');
};

exports.getUser = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;    
    return res.json(req.profile) 
};

/*exports.updateUser = (req, res, next) => {
    let user = req.profile
    user = _.extend(user, req.body) // extend - mutate the source object
    user.updated = Date.now()
    user.save((err) => {
        if(err){
            return res.status(400).json({ error: "You're not authorized"})
        }
        user.hashed_password = undefined;
        user.salt = undefined; 
        res.json({user})
    });

};*/

//To update an user, we need the formidable to trate the form Data
exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) =>{
        if(err){
            return res.status(400).json({ error: 'Photo could not be uploaded'})
        }
        //Save user
        //If something changes, that will be available in the fields
        let user = req.profile
        //whatever is in the req with the fields we mutate it
        user = _.extend(user, fields)
        //Change the value of updated in the user model
        user.updated = Date.now()

        //If a photo has been loaded
        if (files.photo){
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }

        user.save((err, result) =>{
            if(err){
                return res.status(400).json({ error: err})
            }

        user.hashed_password = undefined;
        user.salt = undefined; 
        res.json(user)
        })
    })
}

//Get's the user in the req, remove it...
exports.deleteUser = (req,res, next) => {
    let user = req.profile
    user.remove((err, user) => {
        if(err){
            res.status(400).json(err)
        }
        res.json({ message: `user ${user.name} has been deleted`})
    })
}

//Get the photo of the user...
exports.userPhoto = (req, res, next) => {
    if(req.profile.photo.data) {
        res.set(("Content-Type", req.profile.photo.contentType))
        return res.send(req.profile.photo.data)
    }
    
    next();
}

//Follow 

exports.addFollowing = (req, res, next) => {
    //In the userId we'll get the authenticated user and we'll push the id of the user followed
    User.findByIdAndUpdate(req.body.userId, {$push: {following: req.body.followId}}, (err, result)=>{
        if(err){
            return res.status(400).json({error: err});
        }
        next();
    })
}

exports.addFollower = (req, res) => {
    //We add to the user's followers list, the id of the follower
    User.findByIdAndUpdate(req.body.followId, {$push: {followers: req.body.userId}}, 
        {new: true} //This is to let know MongoDB to return the new/updated data, not the old one.
    )
    .populate('following', '_id name')
    .populate('followers', '_id name')
    .exec((err, result) => {
        if(err){
            return res.status(400).json({error: err})
        }
        result.hashed_password = undefined
        result.salt = undefined

        res.json(result)
    })
    
};

//Unfollow

exports.removeFollowing = (req, res, next) => {
    //In the userId we'll get the authenticated user and we'll push the id of the user followed
    User.findByIdAndUpdate(req.body.userId, {$pull: {following: req.body.unfollowId}}, (err, result)=>{
        if(err){
            return res.status(400).json({error: err});
        }
        next();
    })
}

exports.removeFollower = (req, res) => {
    //We add to the user's followers list, the id of the follower
    User.findByIdAndUpdate(req.body.unfollowId, {$pull: {followers: req.body.userId}}, 
        {new: true} //This is to let know MongoDB to return the new/updated data, not the old one.
    )
    .populate('following', '_id name')
    .populate('followers', '_id name')
    .exec((err, result) => {
        if(err){
            return res.status(400).json({error: err})
        }
        result.hashed_password = undefined
        result.salt = undefined

        res.json(result)
    })
    
};

//Method to findPeople to follow
exports.findPeople = (req,res) => {
    //We get the list of users that the user is following..
    let following = req.profile.following
    //We push the authenticated user to the following array
    following.push(req.profile._id)
    //We find in the schema User all the not included users in the following array...
    User.find({ _id: {$nin: following}}, (err, users)=> {
        if(err){
            return res.status(400).json({
                error: err
            })
        }
        res.json(users)
    }).select('name');
}