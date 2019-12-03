/**
 * Server configuration
 */
const port = 8080;
const morganMode = 'dev';
 
/**
 * MongoDB credentials
 */
const mongoHost = 'localhost';
const mongoPort = '27017';
const mongoDatabase = 'socialTest';
const mongoOpt = {
    user: '', // usuario de la DB
    pass: '', // contraseña de la DB
    dbName: ''
};


/**
 * MongoDB URL. Can be a local or a remote one.
 */
const mongoDB = `mongodb://${mongoHost}:${mongoPort}/${mongoDatabase}`;



module.exports = {
    port,
    morganMode,
    mongoDB,
    mongoOpt
};