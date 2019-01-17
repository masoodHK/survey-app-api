const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    city: String,
    state: String,
    country: String
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    gender: String,
    role: String,
    location: addressSchema
});

const Users = mongoose.model("users", userSchema);

module.exports = Users

