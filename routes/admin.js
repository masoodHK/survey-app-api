const express = require('express');
const router = express.Router();
const Users = require("../models/users");
const Surveys = require("../models/surveys");
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

router.get('/result/:id', isAdmin, (req, res) => { })

router.get('/survey/:id', isAdmin, (req, res) => {
    Surveys.findById(req.params.id)
        .then(data => res.send(data))
        .catch(error => res.send({ message: "Unable to get surveys" }))
})

router.get('/survey', isAdmin, (req, res) => {
    Surveys.findById(req.params.id)
        .then(data => res.send(data))
        .catch(error => res.send({ message: "Unable to get surveys" }))
})

router.get('/profile', isAdmin, (req, res) => {
    Users.findById(req.params.id)
        .then(result => { res.send(result) })
        .catch(error => res.send({ message: "Unable to find user", error }))
})

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
    });
});

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
                }).catch((err) => res.status(404).send({ message: err }))
        }
    })
});

router.post('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy((error) => {
            if (error) {
                res.status(400).send({ error })
            }
            else {
                res.send({ message: "Logged Out" })
            }
        })
    }
    else {
        res.status(404).send({ message: "Admin is already logged out" })
    }
});

router.post('/survey', isAdmin, (req, res) => {
    const survey = new Surveys(req.body);
    survey.save()
        .then(() => res.send({ message: "Your survey has been added" }))
        .catch(() => res.send({ message: "Unable to add your survey" }))
});

router.put('/survey/:id', isAdmin, (req, res) => {
    Surveys.updateOne({ _id: req.params.id }, req.body)
        .then(() => res.send({ message: "Successfully updated the survey" }))
        .catch(() => res.status(404).send({ message: "Unable to updated the surveys" }))
});

router.delete('/survey/:id', isAdmin, (req, res) => {
    Surveys.deleteOne({ _id: req.params.id })
        .then(() => res.send({ message: "Successfully deleted the survey" }))
        .catch(() => res.status(404).send({ message: "Unable to deleted the surveys" }))
});

module.exports = router