const express = require('express');
const router = express.Router();
const Users = require("../models/users");
const crypto = require("crypto");

const isAdmin = function (req, res, next) {
    if (req.session.user.role === "admin") {
        next();
    } else {
        var err = new Error("Not an admin!");
        console.log(req.session.user);
        next(err);
    }
}

router.get('/', isAdmin, (req, res) => { })

router.get('/result/:id', isAdmin, (req, res) => { })

router.get('/survey/:id', isAdmin, (req, res) => { })

router.get('/survey', isAdmin, (req, res) => { })

router.get('/profile', isAdmin, (req, res) => { })

router.post('/login', (req, res) => {
    Users.findOne({ username: req.body.username }, (err, user) => {
        if (user === null) {
            res.status(404).send({ message: "User not found" })
        }
        else {
            if (user.password === crypto.createHash('md5').update(req.body.password).digest('hex')) {
                req.session.user = user
                res.status(201).send({ message: "User Logged in" })
            }
            else {
                res.status(400).send({ message: "Wrong Password" })
            }
        }
    })
})

router.post('/create', (req, res) => {
    const info = {}
    Users.findOne({ username: req.body.username }, (err, user) => {
        if (user) {
            res.status(404).send({ message: "Admin already exists. Use your credentials" })
        }
        else {
            info["username"] = req.body.username
            info["password"] = crypto.createHash('md5').update(req.body.password).digest('hex');
            info["email"] = req.body.email
            info["name"] = req.body.name
            info["role"] = "admin"
            info["gender"] = req.body.gender
            info["address"] = req.body.address
            const newUser = new Users(info);
            newUser.save()
                .then(() => {
                    req.session.user = info;
                    res.send({ message: "Admin is created" })
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
        res.send({ message: "Admin is already logged out" })
    }
})

router.post('/survey', isAdmin, (req, res) => { })

router.put('/survey/:id', isAdmin, (req, res) => { })

router.delete('/survey/:id', isAdmin, (req, res) => { })

module.exports = router