const mongoose = require("mongoose");

const answersSchema = new mongoose.Schema({
    question: String,
    option_chosen: String,
    survey_id: String,
    given_by: String,
})

const answers = mongoose.model("answers", answersSchema);

module.exports = answers;