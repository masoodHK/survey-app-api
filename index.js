const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const session = require("express-session")

mongoose.connect("mongodb://user:user123@ds125331.mlab.com:25331/survey-app", { useNewUrlParser: true })
const app = express()
const port = 4200
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("We're connected");
});

app.use(cors())

app.use(helmet())

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(session({
    secret: "test",
    resave: false,
    saveUninitialized: true
}))


app.use('/api', require('./routes/index'))
app.use('/admin/api', require('./routes/admin'))

app.get("/", (req, res) => {
    res.send({ "message": "it works" });
})

app.listen(port, () => {
    console.log("App started at port " + port)
});