const express = require('express');
const server = require('./server');
const config = require('./config');

let app = express();
server(app);

app.listen(config.port, (err) => {
    console.log(`The app is listening on the port ${config.port}`);
});
