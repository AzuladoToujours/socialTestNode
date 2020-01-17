//To modify and mutate the models (Updates...)
const _ = require('lodash')
const Post = require('../models/post.models')
//Manage the upcoming forms with a photo
const formidable = require('formidable')
//FilSystem to read the photo
const fs = require('fs')

//It needs next because we'll use another method then... 
//we search the post with the id
//We populate the postedBy with the id and the name of the user
//We populate the comments values with the id and name of the comment's users
//We select the id, title, body, created, likes, commments and the photo to store it in the req.
exports.postById = (req, res, next, id) => {
    Post.findById(id)
    .populate('postedBy', '_id name')
    .populate('comments.postedBy', '_id name')
    .populate('postedBy', '_id name role')
    .select('_id title body created likes comments photo')
    .exec((err, post) => {
        if(err || !post){
            return res.status(400).json(err)
        }
        req.post = post //adds post object in req with the post info
        next()
    });
};

//Sends the Post in the req, the same req.post that we send in the postById method above.
exports.getPost = (req, res) => {
    return res.json(req.post)
}

//Get all the posts
//We populate the postedBy with the id and the name of the user
//We populate the comments values with the id and name of the comment's users
//We select the id, title, body, postedBy, likes to store it in the req.


// exports.getPosts = (req, res) => {
//     const posts = Post.find()
//         .populate("postedBy", '_id name')
//         .populate("comments", 'text created')
//         .populate("comments.postedBy", '_id name')
//         .select("_id title body postedBy created likes updated")
//         .sort({ created: -1 })
//         .then((posts) => {
//             res.json(posts);
//         })
//         .catch( err => console.log(err));
// };

// with pagination
exports.getPosts = async (req, res) => {
    // get current page from req.query or use default value of 1
    const currentPage = req.query.page || 1;
    // return 3 posts per page
    const perPage = 6;
    let totalItems;

    const posts = await Post.find()
        // countDocuments() gives you total count of posts
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .populate('comments', 'text created')
                .populate('comments.postedBy', '_id name')
                .populate('postedBy', '_id name')
                .select('_id title body postedBy created likes updated')
                .limit(perPage)
                .sort({ created: -1 });
        })
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => console.log(err));
};

//To create a post, we need the formidable to trate the form Data
exports.createPost = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    //We parse whatever is in the request, we check if it's and error, we want the fields and we want the files.
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            });
        }
        //The post will be a new post with the upcoming fields from the request (fields is like the body)
        let post = new Post(fields);

        //req.profile is the object that we added to the profile in the method userById in user.controller
        req.profile.hashed_password = undefined;
        req.profile.salt = undefined;
        //Populate the value of postedBy in the post with the user
        post.postedBy = req.profile;

        //Checks if the files has photos...
        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }
        //Save the post and pass the result as a json...
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

//Get the posts of the users..
//populate the postedBy with the id and the name of the poster
//Select what we want to send as a response
//Sort by newest
exports.getPostsByUser = (req,res) => {
        Post.find({ postedBy: req.profile._id})
        .populate("postedBy", '_id name')
        .select("_id title body postedBy created likes")
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
    let isUserPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id;
      /*If the post in the req exist, if the auth exist and if the role in the auth
      is admin*/
    let isAdminUser = req.post && req.auth && req.auth.role === 'admin';
    //Either isPoster will be the user that posted the post or the admin
    let isPoster = isUserPoster || isAdminUser
    if(!isPoster){
        return res.status(403).json({ message: 'User is not authorized'})
    }
    next();
};

//Get's the value of the post object in the req and executes the remove method...
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


//As same as the create post, we prepare the form to trate the form-data, we parse the req with the fields...
//And we get the files..
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
        //With the ._extend we mutate the post with the fields in the form..
        post = _.extend(post, fields)
        //We change the updated with the date...
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

//get the post's photo, if the post doesn't have a photo, we also send a 200 to not show a 404 in the server... 
exports.postPhoto = (req, res, next) => {
    if(req.post.photo.data) {
        res.set(("Content-Type", req.post.photo.contentType))
        return res.send(req.post.photo.data)
    }else{
        return res.status(200)
    }
    
    next();
}


//Updates the likes value in the Post, we first search the post (as we sended the postId and the userId as an argument in the body)
//we push the user id to the likes value in the schema
//We put it new:true because it will update a value
exports.like = (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, 
        {$push: {likes: req.body.userId}}, 
        {new: true}
        ).exec((err, result) => {
            if (err) {
                return res.status(400).json({error: err})
            }
            else {
                res.json(result);
            }
        })
}

//Updates the likes value in the Post, we first search the post (as we sended the postId and the userId as an argument in the body)
//we pull the user id to the likes value in the schema
//We put it new:true because it will update a value
exports.unlike = (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, 
        {$pull: {likes: req.body.userId}}, 
        {new: true}
        ).exec((err, result) => {
            if (err) {
                return res.status(400).json({error: err})
            }
            else {
                res.json(result);
            }
        })
}

//Updates the comments value in the Post, we first search the post (as we sended the postId, comment and the userId as an argument in the body)
//we push the comment to the comments value in the schema
//We put it new:true because it will update a value
//We populate the comments.postedBy value with the id and name of the user

exports.comment = (req, res) => {

        let comment = req.body.comment
        comment.postedBy = req.body.userId
    
        Post.findByIdAndUpdate(req.body.postId, 
            {$push: {comments: comment}}, 
            {new: true}
            )
            .populate("comments.postedBy", '_id name' )
            .populate("postedBy", "_id name")
            .exec((err, result) => {
                if (err) {
                    return res.status(400).json({error: err})
                }
                else {
                    res.json(result);
                }
            })
    
   
}


//Updates the comments value in the Post, we first search the post (as we sended the postId, comment and the userId as an argument in the body)
//we pull the comment to the comments value in the schema
//We put it new:true because it will update a value
//We populate the comments.postedBy value with the id and name of the user

exports.uncomment = (req, res) => {
    let comment = req.body.comment

    Post.findByIdAndUpdate(req.body.postId, 
        {$pull: {comments: {_id: comment._id }}}, 
        {new: true}
        )
        .populate("comments.postedBy", '_id name' )
        .populate("postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({error: err})
            }
            else {
                res.json(result);
            }
        })
}