const jwt = require('jsonwebtoken');
const User = require('../models/user.models');
const _ = require('lodash')
const expressJwt = require('express-jwt');
const fs = require('fs')
require("dotenv").config();
const {sendEmail} = require('../helpers/helpers')

//Search if the user exist to change the response to error.
//If it not exist, create a new user with the body in the req and a custom photo
exports.signUp = async(req, res) => {
    const userExist = await User.findOne({email: req.body.email})
    if(userExist) return res.status(403).json({
        error: "Email is taken!"
    });
    const user = await new User(req.body)
    user.photo.data = fs.readFileSync('./images/avatar.jpg');
    user.photo.contentType = 'jpg'
    await user.save()
    // email data
    const emailData = {
        from: 'noreply@testing.com',
        to: req.body.email,
        subject: 'Welcome to my page',
        text: `This is just a testing`
    };
    sendEmail(emailData);
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
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        //Persist the token as 't' in cookie with expiry date
        res.cookie('t', token, {expire: new Date() + 9999})
        //return response to client via frontend
        const {_id, name, email, role} = user
        return res.json({token, user: {_id, email, name, role}}); 
    });    
};

//Clears the token in the cookie
exports.signOut = (req,res) => {
    res.clearCookie('t');
    return res.json({ message: 'Signout success'})
};

exports.forgotPassword = async(req,res) => {
    if (!req.body) return res.status(400).json({ message: 'No body'});
    if (!req.body.email) return res.status(400).json({message: 'No email in request body'});

    const {email} = req.body;
    console.log(email)
   await User.findOne({email}, (err,user) =>{
        if( err || !user ){
            console.log(err)
            return res.status(401).json({message: 'User with that email dont exist'});
        }

        const token = jwt.sign({_id: user._id, iss: process.env.APP_NAME}, process.env.JWT_SECRET);

        const emailData = {
            from: 'noreply@testing.com',
            to: email,
            subject: 'Password Reset Instructions',
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
            }/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
            }/reset-password/${token}</p>`
        }

        return user.updateOne({resetPasswordLink: token }, (err, success) => {
            if (err){
                return res.json({ message: err})
            }
            else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow instructions`
                })
            }
        })
    })

}

exports.resetPassword = (req,res) => {

    const {resetPasswordLink, newPassword} = req.body;
    
    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status(401).json({
                error: 'Invalid Link!'
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ''
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};


exports.requireSignIn = expressJwt({
    //if the token is valid, express jwt appends the verified users id
    //in an auth key to the request object
    secret: process.env.JWT_SECRET,
    userProperty: 'auth'
});