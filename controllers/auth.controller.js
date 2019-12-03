const jwt = require('jsonwebtoken');
const User = require('../models/user.models');
const expressJwt = require('express-jwt');
require("dotenv").config();

exports.signUp = async(req, res) => {
    const userExist = await User.findOne({email: req.body.email})
    if(userExist) return res.status(403).json({
        error: "Email is taken!"
    });
    const user = await new User(req.body)
    await user.save()
    res.status(200).json({ message: "Signup Success" })
};

exports.signIn = (req,res) => {
    //Find the user based on email
    const {email, password} = req.body;
    User.findOne({email}, (err, user) =>{
        //Handle errors
        if(err | !user ){
            return res.status(404).json({ error: 'User with that email does not exist'});
        }
        //User found, authenticate
        //If user is found, make sure email and password match
        if(!user.authenticate(password)){
            return res.status(404).json({ error: 'Email and password do not match'});
        }
        //Generate a token with the user id and the secret jwt
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        //Persist the token as 't' in cookie with expiry date
        res.cookie('t', token, {expire: new Date() + 9999})
        //return response to client via frontend
        const {_id, name, email} = user
        return res.json({token, user: {_id, email, name}}); 
    });    
};

exports.signOut = (req,res) => {
    res.clearCookie('t');
    return res.json({ message: 'Signout success'})
};


exports.requireSignIn = expressJwt({
    //if the token is valid, express jwt appends the verified users id
    //in an auth key to the request object
    secret: process.env.JWT_SECRET,
    userProperty: 'auth'
});