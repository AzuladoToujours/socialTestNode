const _ = require('lodash')
const Post = require('../models/post.models')
const formidable = require('formidable')
const fs = require('fs')

exports.postById = (req, res, next, id) => {
    Post.findById(id)
    .populate("postedBy", '_id name')
    .exec((err, post) => {
        if(err || !post){
            return res.status(400).json(err)
        }
        req.post = post //adds post object in req with the post info
        next()
    });
};

exports.getPost = (req, res) => {
    return res.json(req.post)
}

exports.getPosts = (req, res) => {
    const posts = Post.find()
        .populate("postedBy", '_id name')
        .select("_id title body postedBy created")
        .sort({ created: -1 })
        .then((posts) => {
            res.json(posts);
        })
        .catch( err => console.log(err));
};

exports.createPost = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        let post = new Post(fields);

        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        post.postedBy = req.profile;

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }
        post.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(result);
        });
    });
};


exports.getPostsByUser = (req,res) => {
        Post.find({ postedBy: req.profile._id})
        .populate("postedBy", '_id name')
        .sort({'created': -1})
        .exec((err, posts) => {
            if ( err ){
                return res.status(400).json(err)
            }
            res.json(posts)
        });
};


exports.isPoster = (req, res, next) => {
    /*If the post in the req exist, if the auth exist and if the id 
    in the property postedBy matches the id of the auth*/

    let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id
    if(!isPoster){
        return res.status(403).json({ message: 'User is not authorized'})
    }
    next();
};

exports.deletePost = (req, res) => {
    let post = req.post
    post.remove((err, post) => {
        if (err){
            return res.status(400).json(err)
        }
        res.json({ message: 'Post deleted'});
    });
}

// exports.updatePost = (req, res, next) => {
//     let post = req.post
//     post = _.extend(post, req.body) // extend - mutate the source object
//     post.updated = Date.now()
//     post.save((err) => {
//         if(err){
//             return res.status(400).json(err)
//         }
//         res.json(post);
//     });
// };

exports.updatePost = (req, res, next) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) =>{
        if(err){
            return res.status(400).json({ error: 'Photo could not be uploaded'})
        }
        //Save post
        //If something changes, that will be available in the fields
        let post = req.post
        post = _.extend(post, fields)
        post.updated = Date.now()

        //If a photo has been loaded
        if (files.photo){
            post.photo.data = fs.readFileSync(files.photo.path)
            post.photo.contentType = files.photo.type
        }

        post.save((err, result) =>{
            if(err){
                return res.status(400).json({ error: err})
            }
        res.json(post)
        })
    })
}

exports.postPhoto = (req, res, next) => {
    if(req.post.photo.data) {
        res.set(("Content-Type", req.post.photo.contentType))
        return res.send(req.post.photo.data)
    }else{
        return res.status(200)
    }
    
    next();
}