const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan')
const bodyParser = require('body-parser');
const routes = require('../src/routes')

const port = 3000

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(morgan('dev'))
app.use(bodyParser.json());
app.use('/',routes)

const mongoDb = "mongodb+srv://devraz0852:klhbTRp2iz3f0JUW@cluster0.lbscbk2.mongodb.net/social-network?retryWrites=true&w=majority"

mongoose.connect(mongoDb, {
    useNewUrlParser : true,
    useUnifiedTopology: true
}).then(success =>{
    console.log("Successfully connected to mongoDb");
    app.listen(port, () =>{
        console.log("server is running", port);
    })
}).catch(error =>{
    console.log("err in Db connection",error);
})