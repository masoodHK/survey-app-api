const express = require('express');
const router = express.Router();
const Users = require("../models/users");
const Surveys = require("../models/surveys");
const Answers = require("../models/answers");
const crypto = require("crypto");

function checkSignIn(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        var err = new Error("Not logged in!");
        next(err);
    }
}

router.get('/survey/:id', checkSignIn, (req, res) => {
    Surveys.findById(req.params.id)
        .then(data => res.send(data))
        .catch(error => res.send({ message: "Unable to get surveys" }))
});

router.get('/survey', checkSignIn, (req, res) => {
    Surveys.find({})
        .then(data => res.send(data))
        .catch(error => res.send({ message: "Unable to get surveys" }))
});

// router.get('/profile/:id', checkSignIn, (req, res) => {
//     Users.findById(req.params.id)
//         .then(result => { 
//             delete result["password"]; 
//             res.send(result) 
//         })
//         .catch(error => res.status(404).send({ message: "Unable to find user", error }))
// });

router.post('/survey/:id', checkSignIn, (req, res) => {
    const answer = {};
    answer["survey_id"] = req.params.id;
    answer["given_by"] = req.session.user.username
    const body = req.body;
    body.forEach((answer, index) => {
        answer["option_chosen"] = answer.option;
        answer["question"] = answer.question;
        const answer = new Answers(answer);
        answer.save()
        if (index + 1 === body.length) {
            res.send({ message: "Your answer to the survey is noted" })
        }
    });
})

router.post('/login', (req, res) => {
    Users.findOne({ username: req.body.username }, (err, user) => {
        if (user === null) {
            res.status(404).send({ message: "User not found" })
        }
        else {
            if (user.password === crypto.createHash('md5').update(req.body.password).digest('hex')) {
                req.session.user = user;
                res.status(201).send({ message: "User Logged in", user })
            }
            else {
                res.status(404).send({ message: "User Not Found" })
            }
        }
    });
});

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

router.post('/survey', isAdmin, (req, res) => {
    const survey = new Surveys(req.body);
    survey.save()
        .then(() => res.send({ message: "Your survey has been added" }))
        .catch(() => res.send({ message: "Unable to add your survey" }))
});

router.post('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy((error) => {
            if (error) {
                res.status(400).send({ message: error })
            }
            else {
                res.send({ message: "Logged Out" })
            }
        })
    }
    else {
        res.status(400).send({ message: "User is already logged out" })
    }
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