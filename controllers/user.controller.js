const _ = require('lodash')

const User = require("../models/user.models");
//For any route containing the "userId" param
exports.userById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user ){
            res.status(400).json({ error: 'User not found ' })
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

exports.updateUser = (req, res, next) => {
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

};

exports.deleteUser = (req,res, next) => {
    let user = req.profile
    user.remove((err, user) => {
        if(err){
            res.status(400).json(err)
        }
        res.json({ message: `user ${user.name} has been deleted`})
    })
}
