const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const nodemailer = require("nodemailer");
const User = require('../models/user');
const session = require('express-session');

const jwt = require('jsonwebtoken');
const secret = '05629318956031847428ihilhczjljbjz7508894325';


module.exports = function(app, passport) {

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(session({ 
        secret: 'keyboard',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));

    passport.serializeUser(function(user, done){
        if(user.active){
            token = jwt.sign({ _id: user._id, username: user.username, email: user.email, name: user.name, permission: user.permission }, secret, { expiresIn: '2h' });
        } else{
            token = 'inactive/error';
        }
        // token = jwt.sign({ username: user.username, email: user.email, name: user.name }, secret, { expiresIn: '1h' });
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });


    //Facebook Strategy
    passport.use(new FacebookStrategy({
        clientID: '937406590010553',
        clientSecret: 'd897db445238a32e4cac44b2afec2dfc',
        callbackURL: "https://mean-app-full.herokuapp.com/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        // console.log(token);
        User.findOne({ email: profile._json.email }).select('username active password email name permission').exec(function(err, user){
            if(err) done(err);

            if(user && user != null){
                done(null, user);
            } else{
                var namelength = profile._json.name;
                var use = "";
                if(namelength.split(" ").length > 1){
                    use = profile._json.name.substring(0, profile._json.name.indexOf(" ")) + Math.floor(100000 + Math.random() * 900000);
                } else{
                    use = profile._json.name + Math.floor(100000 + Math.random() * 900000);
                }
                new User({
                    username: use,
                    active: true,
                    email: profile._json.email,
                    name: profile._json.name,
                    temporarytoken: false
                }).save().then((newUser) => {
                    console.log('new user created : ');
                    console.log(newUser);
                    done(null, newUser);
                }).catch((err) => {

                    done(err);
                })
            }
        });
      }
    ));

    //Twitter Strategy
    passport.use(new TwitterStrategy({
        consumerKey: 'ESDZqN4tLDcuGMCnMdLFQfsWx',
        consumerSecret: 'uqZs3LxvsGaFtT6J6wCmGwZX2fvPHGFHXumLvQwksD3fdCVrYk',
        callbackURL: "https://mean-app-full.herokuapp.com/auth/twitter/callback",
        userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
      },
      function(token, tokenSecret, profile, done) {
        console.log(profile);
        User.findOne({ email: profile._json.email }).select('username active password email name permission').exec(function(err, user){
            if(err) done(err);

            if(user && user != null){
                done(null, user);
            } else{
                var namelength = profile._json.name;
                var use = "";
                if(namelength.split(" ").length > 1){
                    use = profile._json.name.substring(0, profile._json.name.indexOf(" ")) + Math.floor(100000 + Math.random() * 900000);
                } else{
                    use = profile._json.name + Math.floor(100000 + Math.random() * 900000);
                }

                new User({
                    username: use,
                    active: true,
                    email: profile._json.email,
                    name: profile._json.name,
                    temporarytoken: false
                }).save().then((newUser) => {
                    console.log('new user created : ');
                    console.log(newUser);
                    done(null, newUser);
                }).catch((err) => {
                    done(err);
                })
            }
        });
      }
    ));

    //Google Strategy
    passport.use(new GoogleStrategy({
        clientID: '609232992248-4gfcqhqc0fjhrse7v8hrmobtnrlqemik.apps.googleusercontent.com',
        clientSecret: 'LGRs5tAQk02lbUopS4Ux3ndx',
        callbackURL: "https://mean-app-full.herokuapp.com/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        User.findOne({ email: profile._json.email }).select('username active password email name permission').exec(function(err, user){
            if(err) done(err);

            if(user && user != null){
                done(null, user);
            } else{
                new User({
                    username: profile._json.given_name + Math.floor(100000 + Math.random() * 900000),
                    active: true,
                    email: profile._json.email,
                    name: profile._json.name,
                    temporarytoken: false
                }).save().then((newUser) => {
                    console.log('new user created : ');
                    console.log(newUser);
                    done(null, newUser);
                }).catch((err) => {
                    done(err);
                })
            }
        });
      }
    ));


    //Facebook API call
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res){
        // console.log(token);
        if(token === 'inactive/error'){
            res.redirect('/login?error=' + encodeURIComponent('Account_not_Activated'));
        } else{
            res.redirect('/facebook/' + token);
        }
    });

    app.get('/auth/facebook', passport.authenticate('facebook', ({display: 'popup'}), { scope: 'email' }));


    //Twitter API call
    app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res){
        // console.log(token);
        if(token === 'inactive/error'){
            res.redirect('/login?error=' + encodeURIComponent('Account_not_Activated'));
        } else{
            res.redirect('/twitter/' + token);
        }
    });

    app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));


    //Google API call
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res){
        // console.log(token);
        if(token === 'inactive/error'){
            res.redirect('/login?error=' + encodeURIComponent('Account_not_Activated'));
        } else{
            res.redirect('/google/' + token);
        }
    });

    app.get('/auth/google',  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'profile', 'email'] }));

    app.get('/me', function(req, res) {
        res.send(req.decoded);
    });

    return passport;
}