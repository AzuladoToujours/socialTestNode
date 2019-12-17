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
const fs = require('fs')
const cors = require('cors')
dotenv.config()

const {
    port,
    morganMode,
    mongoDB
} = require('./config');


const server = (app) => {
    mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true}, 
        (err) => {
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
app.use(cors());
app.use('/', postRouter)
app.use('/', authRouter)
app.use('/', userRouter)
app.get('/', (req, res) => {
    fs.readFile('docs/apiDocs.json', (err, data) =>{
        if (err){
            res.status(400).json(err)
        }
        const docs = JSON.parse(data);
        res.json(docs);
    })
})
//It has to be error to display the data.error in the frontend...
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({ error: 'Unauthorized!' });
    }
  });

}

module.exports = server;
