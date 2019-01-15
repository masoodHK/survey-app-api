const express = require('express');
const router = express.Router();
const Users = require("../models/users");
const crypto = require("crypto");

function checkSignIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        var err = new Error("Not logged in!");
        next(err);
    }
}

router.get('/survey/:id', checkSignIn, (req, res) => { })

router.get('/survey', checkSignIn, (req, res) => { })

router.get('/profile/:id', checkSignIn, (req, res) => {
    Users.findById(req.params.id)
        .then(result => { res.send(result) })
        .catch(error => res.send({ message: "Unable to find user", error }))
})

router.post('/survey/:id', checkSignIn, (req, res) => { })

router.post('/login', (req, res) => {
    Users.findOne({ username: req.body.username }, (err, user) => {
        if (user === null) {
            res.status(404).send({ message: "User not found" })
        }
        else {
            if (user.password === crypto.createHash('md5').update(req.body.password).digest('hex')) {
                res.status(201).send({ message: "User Logged in", user })
            }
            else {
                res.status(404).send({ message: "User Not Found" })
            }
        }
    })
})

router.post('/signup', (req, res) => {
    const info = {}
    Users.findOne({ username: req.body.username }, (err, user) => {
        if (user) {
            res.status(404).send({ message: "User already exists. Use your credentials" })
        }
        else {
            info["username"] = req.body.username
            info["password"] = crypto.createHash('md5').update(req.body.password).digest('hex');
            info["email"] = req.body.email
            info["name"] = req.body.name
            info["role"] = "user"
            info["gender"] = req.body.gender
            info["address"] = req.body.address
            const newUser = new Users(info);
            newUser.save()
                .then(() => {
                    req.session.user = info;
                    Users.findOne({ username: req.body.username }).then(result => {
                        res.send({ message: "User is registered", user: result })
                    })
                }).catch(err => {
                    res.send({ message: err })
                })
        }
    })
})

router.post('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy((error) => {
            if (error) {
                res.send({ error })
            }
            else {
                res.send({ message: "Logged Out" })
            }
        })
    }
    else {
        res.send({ message: "User is already logged out" })
    }
})

module.exports = router