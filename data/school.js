const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const schoolSchema = Schema({
    email: String,
    school: String,
    contact: Object,
    password: String,
    lastUpdated: Date,
    phoneNumber: String,
    address: Object,
    about: String
});

const School = mongoose.model('School', schoolSchema);

module.exports = School;
