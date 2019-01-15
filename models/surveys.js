const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now },
    question: String,
    options: [{ option: String }]
})

const surveySchema = new mongoose.Schema({
    survey_name: String,
    opening_message: String,
    closing_message: String,
    description: String,
    status: Boolean,
    created_at: { type: Date, default: Date.now },
    modified_at: { type: Date, default: Date.now },
    created_by: String,
    questions: [questionSchema],
    survey_type: String,
});

const Surveys = mongoose.model("surveys", surveySchema);

module.exports = Surveys