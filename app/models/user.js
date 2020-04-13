const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Schema = mongoose.Schema;
const titlize = require('mongoose-title-case');
const validate = require('mongoose-validator');
const secret = '05629318956031847428ihilhczjljbjz7508894325';

var nameValidator = [
    validate({
        validator: 'matches',
        arguments: /^[A-Za-z][A-Za-z\'\-]+([\ A-Za-z][A-Za-z\'\-]+)+(?!\S)/,
        message: 'Enter your FULL Name without any numbers or special characters.'
    }),
    validate({
        validator: 'isLength',
        arguments: [3,],
        message: 'Name should be atleast 3 characters long'
    })
];

var emailValidator = [
    validate({
        validator: 'isEmail',
        message: 'Please enter a valid email'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

var usernameValidator = [
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    }),
    validate({
        validator: 'isAlphanumeric',
        message: 'Username must contain letters and numbers only and No Spaces or special characters'
    })
]

var passwordValidator = [
    validate({
        validator: 'matches',
        arguments: /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,}$/,
        message: 'Password must be atleast 8 characters long and must contain atleast one lowercase letter, one uppercase letter, one digit and one special character (No Spaces)'
    })
];

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: nameValidator
    },
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate: usernameValidator
    },
    password: {
        type: String,
        validate: passwordValidator,
        select: false
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate: emailValidator
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    temporarytoken: {
        type: String,
        required: true
    },
    resettoken: {
        type: String,
        required: false
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }],
    permission: {
        type: String,
        required: true,
        default: 'user'
    }
});

UserSchema.pre('save', function(next){
    let user = this;
    let costFactor = 10;

    if(user.isModified('password')){
        //if the password field has been changed/edited then this code is run

        //Generate salt and hash password
        bcrypt.genSalt(costFactor, function(err, salt){
            bcrypt.hash(user.password, salt, function(err, hash) {
                user.password = hash;
                next();
            })
        })
    } else{
        next();
    }
});

UserSchema.plugin(titlize, {
    paths: ['name']
})

UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.generateAccessToken = function(){
    const user = this;
    return new Promise((resolve, reject) => {
        //Create the JWT and return that
        jwt.sign({ _id: user._id, username: user.username, email: user.email, name: user.name, permission: user.permission }, secret, { expiresIn: "10s" }, (err, token) => {
            if(!err){
                resolve(token);
            } else{
                reject();
            }
        });
    })
}

UserSchema.methods.generateRefreshToken = function(){
    //This method simply generates a 64byte hex string - it doesn't save it to the database. saveSessionToDatabase() does that
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if(!err){
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })
}

UserSchema.methods.createSession = function(){
    let user = this;

    console.log('User is: '+user);

    return user.generateRefreshToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        //saved to database successfully
        //now return the refresh token
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.\n' + e);
    });
}

UserSchema.statics.findByIdAndToken = function(_id, token){
    const User = this;
    return User.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if(expiresAt > secondsSinceEpoch){
        return false;
    } else{
        return true;
    }
}

//Helper methods
let saveSessionToDatabase = (user, refreshToken) => {
    //save session to database (Session = refreshtoken + expiresAt)
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        // user.sessions = [];
        if(user.sessions.length >= 1){
            user.sessions.shift();
        }

        user.sessions.push({ 'token': refreshToken, expiresAt });
        
        user.save().then(() => {
            //saved session successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    // let secondsUntilExpire = ((daysUntilExpire * 24) *60 ) * 60;
    let secondsUntilExpire = 15;
    return ((Date.now() / 1000) * secondsUntilExpire);
}

module.exports = mongoose.model('User', UserSchema);