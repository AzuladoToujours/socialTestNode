const express = require('express')
const app = express()
const morgan = require('morgan')
const postRouter = require('./routes/post.router')
const authRouter = require('./routes/auth.router')
const userRouter = require('./routes/user.router')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const expressValidator = require('express-validator')
const dotenv = require('dotenv');
dotenv.config()

const {
    port,
    morganMode,
    mongoDB
} = require('./config');


const server = (app) => {
    mongoose.connect(mongoDB, (err) => {
        if (err) {
            return console.log('Error while connecting to database');
        }
        console.log('Succesfull database connection!');
    });

//middleware
const myMiddlware = (req, res,next) => {
    console.log('using middleware')
    next()
}

app.use(morgan(morganMode))
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use('/', postRouter)
app.use('/', authRouter)
app.use('/', userRouter)
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({ message: 'Unauthorized!' });
    }
  });

}

module.exports = server;
