const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const nodemailer = require("nodemailer");
const secret = '05629318956031847428ihilhczjljbjz7508894325';

module.exports = function(router) {
    var client = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "sumanpaul0209@gmail.com",
            pass: "R@scal99toku49"
        }
    });

    //Verify Refresh Token Middleware which will be verifying the session
    let verifySession = (req, res, next) => {
        //grab the refresh token from the request header
        let refreshToken = req.header('x-refresh-token');

        //grab the _id from the request header
        let _id = req.header('_id');

        User.findByIdAndToken(_id, refreshToken).then((user) => {
            if(!user){
                //user couldn't be found
                return res.status(401).json({
                    success: false,
                    message: 'Make sure the refresh token and userID are valid'
                })
            }

            //if user was found the refresh token exists in the database but we still have to checkif it has expired or not
            req.user_id = user._id;
            req.userObject = user;
            req.refreshToken = refreshToken;

            let isSessionValid = false;

            user.sessions.forEach((session) => {
                if(session.token === refreshToken){
                    //check if the session has expired
                    if(User.hasRefreshTokenExpired(session.expiresAt) === false){
                        //refresh token has not expired
                        isSessionValid = true;
                    }
                }
            });

            if(isSessionValid){
                //call next to continue with processing this web request
                next();
            } else{
                //session is not valid
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token has expired or the session is invalid'
                });
            }
        }).catch((e) => {
            res.status(401).json({
                success: false,
                message: e
            });
        })
    }

    //User Registration Route
    router.post('/users', function(req, res) {
        let body = req.body;
        var user = new User(body);
        // user.username = req.body.username;
        // user.password = req.body.password;
        // user.email = req.body.email;
        // user.name = req.body.name;
        user.temporarytoken = jwt.sign({ username: user.username, email: user.email, name: user.name }, secret, { expiresIn: '1h' });
        
        if(user.username === undefined || user.username === null || user.username === '' || user.password === undefined || user.password === null || user.password === '' || user.email === undefined || user.email === null || user.email === '' || user.name === undefined || user.name === null || user.name === ''){
            return res.status(400).json({
                success: false,
                message: 'Please enter all the fields'
            })
        } else{
            user.save().then(() => {

                var email = {
                    from: 'Localhost Staff, Staff@localhost.com',
                    to: user.email,
                    subject: 'Localhost:3000 activation link',
                    text: 'Hello '+user.name+'.\n\nPlease click on the link below to activate your account.\n\nlocalhost:3000/activate/'+user.temporarytoken,
                    html: 'Hello <strong>'+user.name+'</strong>.<br><br>Please click on the link below to activate your account.<br><br><a href="http://localhost:3000/activate/'+user.temporarytoken+'">http://localhost:3000/activate/</a>'
                };
            
                client.sendMail(email, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                });

                // return res.status(200).json({
                //     success: true,
                //     message: 'User registered. Please check your mail for activation link'
                // });
                return user.createSession();
            }).then((refreshToken) => {        
                return user.generateAccessToken().then((accessToken) => {
                    return {accessToken, refreshToken};
                });
            }).then((authTokens) => {
                return res.status(200).json({
                    success: true,
                    message: 'You have been successfully registered. Please check your email for activation Link',
                    headers: {
                        'x-refresh-token': authTokens.refreshToken,
                        'x-access-token': authTokens.accessToken
                    },
                    user: user
                });                
            }).catch((e) => {
                if(e.name === "MongoError"){
                    if(e.keyPattern.username){
                        return res.status(400).json({
                            success: false,
                            message: 'Username already exists'
                        });
                    } else if(e.keyPattern.email){
                        return res.status(400).json({
                            success: false,
                            message: 'Email already exists'
                        });
                    }
                } else if(e.name === "ValidationError"){
                    if(e.errors.email){
                        return res.status(400).json({
                            success: false,
                            message: e.errors.email.message
                        });
                    } else if(e.errors.name){
                        return res.status(400).json({
                            success: false,
                            message: e.errors.name.message
                        });
                    } else if(e.errors.username){
                        return res.status(400).json({
                            success: false,
                            message: e.errors.username.message
                        });
                    } else if(e.errors.password){
                        return res.status(400).json({
                            success: false,
                            message: e.errors.password.message
                        });
                    }
                } else{
                    return res.status(400).json({
                        success: false,
                        message: e
                    });
                }
                // res.send(e);
            });
        }
    });

    //User Login Route
    router.post('/authenticate', function(req, res) {
        if(req.body.username === undefined || req.body.username === null || req.body.username === '' || req.body.password === undefined || req.body.password === null || req.body.password === ''){
            return res.status(400).json({
                success: false,
                message: 'Please enter all the fields'
            });
        } else{
            User.findOne({ username: req.body.username }).select('name email username password active sessions permission').exec(function(err, user){
                if(err) throw err;
    
                if(!user){
                    return res.status(400).json({
                        success: false,
                        message: 'Username not found'
                    });
                } else if(!user.password){
                    return res.status(400).json({
                        success: false,
                        message: 'Password does not exist for this username. You used one of the social logins to create an account'
                    });
                } else if(user){
                    if(req.body.password){
                        var validPassword = user.comparePassword(req.body.password);
    
                        if(!validPassword){
                            return res.status(400).json({
                                success: false,
                                message: 'Incorrect Password'
                            });
                        } else if(!user.active){
                            return res.status(400).json({
                                success: false,
                                message: 'Account is not yet activated. Please check your email for activation link',
                                expired: true
                            });
                        } else{
                            console.log(user);
                            return user.createSession().then((refreshToken) => {
                                return user.generateAccessToken().then((accessToken) => {
                                    return {accessToken, refreshToken}
                                });
                            }).then((authTokens) => {
                                return res.status(200).json({
                                    success: true,
                                    message: 'You have successfully logged In',
                                    headers: {
                                        'x-refresh-token': authTokens.refreshToken,
                                        'x-access-token': authTokens.accessToken
                                    },
                                    user: user
                                });
                            }).catch((e) => {
                                return res.status(401).json({
                                    success: false,
                                    message: e
                                })
                            })
                        }
                    } else{
                        return res.status(400).json({
                            success: false,
                            message: 'No Password provided'
                        })
                    }                
                }
            })
        }
    })

    //Route to get New Access Token
    router.get('/access-token', verifySession, (req, res) => {
        //We know that the caller is authenticated and we have the user_id and userObject available to us
        req.userObject.generateAccessToken().then((accessToken) => {
            return res.status(200).json({
                success: false,
                message: 'new access token generated',
                headers: {
                    'x-access-token': accessToken
                },
                token: accessToken
            });
        }).catch((e) => {
            res.status(400).json({
                success: false,
                message: e
            });
        })
    });

    router.get('/activate/:token', function(req, res){
        User.findOne({ temporarytoken: req.params.token }, function(err, user){
            if(err) throw err;

            var token = req.params.token;

            jwt.verify(token, secret, function(err, decoded) {
                if(err){
                    return res.status(400).json({
                        success: false,
                        message: 'Activation Link has expired'
                    });
                } else if(!user) {
                    return res.status(400).json({
                        success: false,
                        message: 'Activation Link has expired'
                    });
                } else{
                    user.temporarytoken = false;
                    user.active = true;
                    user.save().then(() => {
                        var email = {
                            from: 'Localhost Staff, Staff@localhost.com',
                            to: user.email,
                            subject: 'Localhost:3000 account activated',
                            text: 'Hello '+user.name+'.\n\nYour account has been successfully activated',
                            html: 'Hello <strong>'+user.name+'</strong>.<br><br>Your account has been successfully activated'
                        };

                        client.sendMail(email, function(error, info){
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                        });
        
                        return res.status(200).json({
                            success: true,
                            message: 'Account Activated'
                        });
                    })
                }
            })
        })
    });

    router.post('/resend', function(req, res) {
        if(req.body.email === undefined || req.body.email === null || req.body.email === ''){
            return res.status(400).json({
                success: false,
                message: 'Please enter your email id'
            });
        } else{
            User.findOne({ email: req.body.email }).select('name email username password active').exec(function(err, user){
                if(err) throw err;
    
                if(!user){
                    return res.status(400).json({
                        success: false,
                        message: 'Email not found'
                    });
                } else if(user){
                    if(user.active){
                        return res.status(400).json({
                            success: false,
                            message: 'Account already activated'
                        })
                    } else{
                        return res.status(200).json({ success: true, user: user });
                    }             
                }
            })
        }
    });

    router.put('/resend', function(req, res){
        User.findOne({ email: req.body.email }).select('name email username temporarytoken').exec(function(err, user){
            if(err) throw err;

            user.temporarytoken = jwt.sign({ username: user.username, email: user.email, name: user.name }, secret, { expiresIn: '1h' });

            user.save().then(() => {
                var email = {
                    from: 'Localhost Staff, Staff@localhost.com',
                    to: user.email,
                    subject: 'Localhost:3000 activation link request',
                    text: 'Hello '+user.name+'.\n\nPlease click on the link below to activate your account.\n\nlocalhost:3000/activate/'+user.temporarytoken,
                    html: 'Hello <strong>'+user.name+'</strong>.<br><br>Please click on the link below to activate your account.<br><br><a href="http://localhost:3000/activate/'+user.temporarytoken+'">http://localhost:3000/activate/</a>'
                };
            
                client.sendMail(email, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                });

                return res.status(200).json({
                    success: true,
                    message: 'Activation Link Sent. Please check your mail for new activation link'
                });
            }).catch((e) => {
                return res.status(400).json({
                    success: false,
                    message: e
                })
            })
        })
    });

    router.get('/resetusername/:email', function(req, res) {
        if(req.params.email === undefined || req.params.email === null || req.params.email === ''){
            return res.status(400).json({
                success: false,
                message: 'Please enter your email'
            });
        } else{
            User.findOne({ email: req.params.email }).select('name active email username').exec(function(err, user){
                if(err){
                    return res.status(400).json({
                        success: false,
                        message: err
                    });
                } else{
                    if(!user){
                        return res.status(400).json({
                            success: false,
                            message: 'Email Not Found'
                        });
                    } else if(!user.active){
                        return res.status(400).json({
                            success: false,
                            message: 'Account is not yet activated. Please check your email for activation link',
                            expired: true
                        });
                    } else{
                        var email = {
                            from: 'Localhost Staff, Staff@localhost.com',
                            to: user.email,
                            subject: 'Localhost:3000 Username request',
                            text: 'Hello '+user.name+'.\n\nYour Username is '+user.username,
                            html: 'Hello <strong>'+user.name+'</strong>.<br><br>Your Username is <strong>'+user.username+'</strong>'
                        };
                    
                        client.sendMail(email, function(error, info){
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                        });
    
                        return res.status(200).json({
                            success: true,
                            message: 'Username has been sent to your email'
                        });
                    }
                }
            });
        }
    });

    router.put('/resetpassword', function(req, res) {
        if(req.body.email === undefined || req.body.email === null || req.body.email === ''){
            return res.status(400).json({
                success: false,
                message: 'Please enter your email'
            });
        } else{
            User.findOne({ email: req.body.email }).select('name username email active resettoken').exec(function(err, user){
                if(err) throw err;
    
                if(!user){
                    return res.status(400).json({
                        success: false,
                        message: 'Email Not Found'
                    })
                } else if(!user.active){
                    return res.status(400).json({
                        success: false,
                        message: 'Account is not yet activated. Please check your email for activation link',
                        expired: true
                    });
                } else {
                    user.resettoken = jwt.sign({ username: user.username, email: user.email, name: user.name }, secret, { expiresIn: '1h' });

                    user.save().then(() => {
                        var email = {
                            from: 'Localhost Staff, Staff@localhost.com',
                            to: user.email,
                            subject: 'Localhost:3000 reset Password request',
                            text: 'Hello '+user.name+'.\n\nPlease click on the link below to reset your password.\n\nhttp://localhost:3000/newpassword/'+user.resettoken,
                            html: 'Hello <strong>'+user.name+'</strong>.<br><br>Please click on the link below to reset your password.<br><br><a href="http://localhost:3000/newpassword/'+user.resettoken+'">http://localhost:3000/newpassword/</a>'
                        };
                    
                        client.sendMail(email, function(error, info){
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email sent: ' + info.response);
                            }
                        });
        
                        return res.status(200).json({
                            success: true,
                            message: 'Password Reset Link Sent. Please check your mail'
                        });
                    }).catch((e) => {
                        return res.status(400).json({
                            success: false,
                            message: e
                        })
                    });
                }
            });
        }
    });

    router.get('/newpassword/:token', function(req, res){
        User.findOne({ resettoken: req.params.token }).select('resettoken email name username active').exec(function(err, user){
            if(err) throw err;

            var token = req.params.token;
            if(token){
                //verify token
                jwt.verify(token, secret, function(err, decoded) {
                    if(err){
                        return res.status(400).json({
                            success: false,
                            message: 'Invalid Token'
                        });
                    } else if(!user) {
                        return res.status(400).json({
                            success: false,
                            message: 'Reset Link has expired'
                        });
                    } else{
                        return res.status(200).json({
                            success: true,
                            user: user
                        });
                    }
                });
            } else{
                return res.status(400).json({
                    success: false,
                    message: 'Reset Link has expired (No token found)'
                })
            }
        })
    });

    router.put('/savepassword', function(req, res){
        User.findOne({ email: req.body.email }).select('username name email password resettoken').exec(function(err, user){
            if(err) throw err;

            if(req.body.password === null || req.body.password === undefined || req.body.password === ''){
                return res.status(400).json({
                    success: false,
                    message: 'Please enter a new password'
                });
            } else{
                user.password = req.body.password;
                user.resettoken = false;
                user.save().then(() => {

                    var email = {
                        from: 'Localhost Staff, Staff@localhost.com',
                        to: user.email,
                        subject: 'Localhost:3000 Password Successfully Reset',
                        text: 'Hello '+user.name+'.\n\nYour password has been successfully reset',
                        html: 'Hello <strong>'+user.name+'</strong>.<br><br>Your password has been successfully reset'
                    };
                
                    client.sendMail(email, function(error, info){
                        if (error) {
                        console.log(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        }
                    });

                    return res.status(200).json({
                        success: true,
                        message: 'Password Reset successfully'
                    });
                }).catch((e) => {
                    if(e.name === "ValidationError"){
                        if(e.errors.password){
                            return res.status(400).json({
                                success: false,
                                message: e.errors.password.message
                            });
                        }
                    }
                    // res.send(e);
                });
            }
        })
    })

    router.use(function(req, res, next){
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if(token){
            //verify token
            jwt.verify(token, secret, function(err, decoded) {
                if(err){
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid Token'
                    });
                } else{
                    req.decoded = decoded;
                    next();
                }
            })
        } else{
            return res.status(401).json({
                success: false,
                message: 'No Token Found'
            })
        }
    })

    router.get('/me', function(req, res) {
        res.send(req.decoded);
    });

    router.get('/management', function(req, res){
        User.find({}, function(err, users){
            if(err) throw err;

            User.findOne({ email: req.decoded.email }, function(err, mainUser){
                if(err) throw err;

                if(!mainUser){
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot Find MainUser'
                    })
                } else{
                    if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                        if(!users){
                            return res.status(400).json({
                                success: false,
                                message: 'No users Found'
                            })
                        } else{
                            return res.status(200).json({
                                success: true,
                                users: users,
                                permission: mainUser.permission
                            })
                        }
                    } else{
                        res.status(400).json({
                            success: false,
                            message: 'You do not have permission to view the users'
                        })
                    }
                }
            })
        })
    });

    router.delete('/management/:email', function(req, res) {
        var deleteUser = req.params.email;
        User.findOne({ email: req.decoded.email }, function(err, mainUser){
            if(err) throw err;

            if(!mainUser){
                return res.status(400).json({
                    success: false,
                    message: 'Cannot find MainUser'
                });
            } else{
                if(mainUser.permission !== 'admin'){
                    return res.status(400).json({
                        success: false,
                        message: 'You are not an admin'
                    });
                } else{
                    User.findOneAndRemove({ email: req.params.email }, function(err, delUser){
                        if(err) throw err;

                        return res.status(200).json({
                            success: true,
                            message: 'You have successfully deleted the user',
                        });
                    })
                }
            }
        })
    });

    router.get('/edit/:id', function(req, res){
        User.findOne({ email: req.decoded.email }, function(err, mainUser) {
            if(err) throw err;

            if(!mainUser){
                return res.status(400).json({
                    success: false,
                    message: 'mainUser Not Found'
                });
            } else{
                // console.log('Main User is: '+mainUser);
                if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
                    User.findOne({ _id: req.params.id }, function(err, user){
                        if(err) throw err;

                        if(!user){
                            return res.status(400).json({
                                success: false,
                                message: 'User Not Found'
                            });
                        } else{
                            return res.status(200).json({
                                success: true,
                                user: user,
                                caller: mainUser
                            });
                        }
                    });
                } else{
                    console.log('Not an admin or moderator');
                    return res.status(400).json({
                        success: false,
                        message: 'You are not an Admin or Moderator'
                    });
                }
            }
        })
    });

    router.put('/edit/:id', function(req, res){
        User.findOne({ email: req.decoded.email }, function(err, mainUser){
            if(err) throw err;

            if(!mainUser){
                return res.status(400).json({
                    success: false,
                    message: 'mainUser Not Found'
                });
            } else{
                if(mainUser.permission === 'admin'){
                    User.findOne({ _id: req.params.id }, function(err, user){
                        if(err) throw err;
            
                        if(req.body.name === null || req.body.name === undefined || req.body.name === '' || req.body.username === null || req.body.username === undefined || req.body.username === '' || req.body.email === null || req.body.email === undefined || req.body.email === '' || req.body.permission === null || req.body.permission === undefined || req.body.permission === ''){
                            return res.status(400).json({
                                success: false,
                                message: 'Make sure the user has all the fields.'
                            });
                        } else if(!user){
                            return res.status(400).json({
                                success: false,
                                message: 'User with Id Not Found'
                            });
                        } else{
                            user.name = req.body.name;
                            user.email = req.body.email;
                            user.username = req.body.username;
                            user.permission = req.body.permission;
                            user.save().then(() => {            
                                return res.status(200).json({
                                    success: true,
                                    message: 'Updated successfully'
                                });
                            }).catch((e) => {
                                console.log('Error while editing '+e);
                                if(e.name === "MongoError"){
                                    if(e.keyPattern.username){
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Username already exists'
                                        });
                                    } else if(e.keyPattern.email){
                                        return res.status(400).json({
                                            success: false,
                                            message: 'Email already exists'
                                        });
                                    }
                                } else if(e.name === "ValidationError"){
                                    if(e.errors.email){
                                        return res.status(400).json({
                                            success: false,
                                            message: e.errors.email.message
                                        });
                                    } else if(e.errors.name){
                                        return res.status(400).json({
                                            success: false,
                                            message: e.errors.name.message
                                        });
                                    } else if(e.errors.username){
                                        return res.status(400).json({
                                            success: false,
                                            message: e.errors.username.message
                                        });
                                    }
                                } else{
                                    console.log('Here error '+e);
                                    return res.status(400).json({
                                        success: false,
                                        message: e
                                    });
                                }
                                // res.send(e);
                            });
                        }
                    })
                } else if(mainUser.permission === 'moderator'){
                    User.findOne({ _id: req.params.id }, function(err, user){
                        if(err) throw err;
            
                        if(req.body.name === null || req.body.name === undefined || req.body.name === '' || req.body.username === null || req.body.username === undefined || req.body.username === '' || req.body.email === null || req.body.email === undefined || req.body.email === '' || req.body.permission === null || req.body.permission === undefined || req.body.permission === ''){
                            return res.status(400).json({
                                success: false,
                                message: 'Make sure the user has all the fields.'
                            });
                        } else if(!user){
                            return res.status(400).json({
                                success: false,
                                message: 'User with Id Not Found'
                            });
                        } else{
                            if(user.permission === 'admin'){
                                return res.status(400).json({
                                    success: false,
                                    message: 'Only an admin can change the data of another admin'
                                });
                            } else{
                                user.name = req.body.name;
                                user.email = req.body.email;
                                user.username = req.body.username;
                                user.permission = req.body.permission;
                                user.save().then(() => {            
                                    return res.status(200).json({
                                        success: true,
                                        message: 'Updated successfully'
                                    });
                                }).catch((e) => {
                                    if(e.name === "MongoError"){
                                        if(e.keyPattern.username){
                                            return res.status(400).json({
                                                success: false,
                                                message: 'Username already exists'
                                            });
                                        } else if(e.keyPattern.email){
                                            return res.status(400).json({
                                                success: false,
                                                message: 'Email already exists'
                                            });
                                        }
                                    } else if(e.name === "ValidationError"){
                                        if(e.errors.email){
                                            return res.status(400).json({
                                                success: false,
                                                message: e.errors.email.message
                                            });
                                        } else if(e.errors.name){
                                            return res.status(400).json({
                                                success: false,
                                                message: e.errors.name.message
                                            });
                                        } else if(e.errors.username){
                                            return res.status(400).json({
                                                success: false,
                                                message: e.errors.username.message
                                            });
                                        }
                                    } else{
                                        console.log('Here error '+e);
                                        return res.status(400).json({
                                            success: false,
                                            message: e
                                        });
                                    }
                                    // res.send(e);
                                });
                            }
                        }
                    })
                } else{
                    console.log('Not an admin or moderator');
                    return res.status(400).json({
                        success: false,
                        message: 'You are not an Admin or Moderator'
                    });
                }
            }
        })
    });

    return router;
}