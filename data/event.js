const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const eventSchema = Schema({
    teacherId: String,
    schoolId: String,
    date: Object,
    time: String,
    school: String,
    address: Object,
    contact: Object,
    year: String,
    role: String,
    lastUpdated: Date
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
