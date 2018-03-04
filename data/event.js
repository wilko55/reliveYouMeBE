const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const eventSchema = Schema({
    teacherId: String,
    schoolId: String,
    date: Schema.Types.Mixed,
    time: String,
    school: String,
    contact: Schema.Types.Mixed,
    year: String,
    description: String,
    extraInfo: String,
    subjectsRequired: [],
    additionalSkillsRequired: [],
    ageRange: String,
    lastUpdated: Date
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
