'use strict';

const Event = require('../data/event');
const Teacher = require('../data/teacher');
const moment = require('moment');

module.exports = (app, passport) => {
    app.post('/event/create', passport.authenticate('jwt', { session: false }), (req, res) => {
        const eventData = req.body.eventData;

        let newEvent = new Event({
            teacherId: '',
            schoolId: req.user.id,
            date: {
                day: eventData['date-day'],
                month: eventData['date-month'],
                year: eventData['date-year']
            },
            time: eventData.time,
            school: eventData.school,
            contact: {
                name: eventData['contact-name'] || req.user.contact.name,
                phone: eventData['contact-phoneNumber'] || req.user.contact.phoneNumber,
                email: eventData['contact-email'] || req.user.contact.email
            },
            year: eventData.year,
            role: eventData.role,
            subjectsRequired: eventData.subjectsRequired,
            additionalSkillsRequired: eventData.additionalSkills,
            ageRange: eventData.ageRange,
            extraInfo: eventData.extraInfo,
            lastUpdated: moment().format()
        });

        newEvent.save((err, event) => {
            if (err) {
                console.log('err!!', err);
                res.sendStatus(500);
            }
            res.status(200).json({ eventId: event.id });
        });
    });

    app.get('/event/:eventId', passport.authenticate('jwt', { session: false }), (req, res) => {
        const eventId = req.params.eventId || '';

        Event.findById(eventId, (err, event) => {
            if (err) {
                res.status(500).json({ message: 'Event not found', err });
            } else if (event) {
                // tidy up
                const prettyData = {
                    date: moment(event.date).format('Do MMMM YYYY')
                };

                res.status(200).json({ message: 'Event found', event, prettyData });
            } else {
                res.status(500).json({ message: 'Event not found' });
            }
        });
    });

    app.get('/event/matches/:eventId', passport.authenticate('jwt', { session: false }), (req, res) => {
        // get school details from req.user
        // lookup event from req.params.eventId
        // find teachers who match criteria
        const eventId = req.params.eventId;

        Event.findById(eventId, (err, event) => {
            if (err) {
                res.status(500).json({ message: 'Event not found', err });
            } else if (event) {
                // find query
                const availabilityQuery = 'availability.' + event.date.month + '-' + event.date.year + '.' + event.date.day;

                const subjectsQuery = [];
                event.subjectsRequired.forEach((el) => {
                    subjectsQuery.push({ specialistSubjects: { $eq: el } });
                });

                const eventQuery = {
                    ageRange: { $eq: event.ageRange },
                    $or: subjectsQuery
                };

                eventQuery[availabilityQuery] = true;
                // eventQuery.subjectsRequired = subjectsQuery;

                Teacher.find(eventQuery, (err, matches) => {
                    if (err) {
                        res.status(500).json({ message: 'Error finding matches', err });
                    } else if (matches) {
                        res.status(200).json({ msg: 'ok', matches });
                    } else {
                        res.status(500).json({ message: 'Error finding matches' });
                    }
                });
            } else {
                res.status(500).json({ message: 'Error finding matches', err });
            }
        });
    });

    // delete event

    // update event
};
