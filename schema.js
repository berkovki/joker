
/**
 *  schema.js
 *  Database models (Mongoose).
 */

 var mongoose = require('mongoose');

 var userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    yemeksepetiCredentials: {
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true}
    }
 });

 exports.User = mongoose.model('user', userSchema);