const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = express.Router();
const appRoutes = require('./app/routes/api')(router);
const path = require('path');
const passport = require('passport');
const social = require('./app/passport/passport')(app, passport);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use('/api', appRoutes);

mongoose.connect('mongodb+srv://sumanpaul0209:R%40scal99toku49@mean-app-full-eyqir.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true }, function(err){
    if(err){
        console.log('Not connected to the database: '+err);
    } else{
        console.log('Connected to MongoDB successfully')
    }
});

app.get('*', function(req, res){
    res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(port, function(){
    console.log('Running the server on port '+port);
});