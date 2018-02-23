const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const teacherSchema = Schema({
    email: String,
    name: String,
    password: String,
    registered: Boolean,
    availability: Schema.Types.Mixed,
    lastUpdated: Date,
    jobTitle: String,
    qualification: String,
    ageRange: [],
    specialistSubjects: [],
    additionalSkills: [],
    areasCovered: [],
    phoneNumber: String,
    address: Schema.Types.Mixed,
    about: String,
    experience: [],
    dateQualified: String,
    startDate: String,
    endDate: String
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
