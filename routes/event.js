'use strict';

const Event = require('../data/event');
const moment = require('moment');

module.exports = (app, passport) => {
    app.post('/event/create', passport.authenticate('jwt', { session: false }), (req, res) => {
        const eventData = req.body.eventData;

        let newEvent = new Event({
            teacherId: '',
            schoolId: req.user.id,
            date: eventData.date,
            time: eventData.time,
            school: eventData.school,
            address: {
                addressLine1: req.user.addressLine1,
                addressLine2: req.user.addressLine2 || '',
                addressLine3: req.user.addressLine3 || '',
                postcode: req.user.postcode
            },
            contact: {
                name: req.user.contactName,
                phone: req.user.contactPhone,
                email: req.user.contactEmail
            },
            year: eventData.year,
            role: eventData.role,
            lastUpdated: moment().format()
        });

        newEvent.save((err, event) => {
            if (err) {
                console.log('err!!', err);
                res.sendStatus(500);
            }
            res.status(200).json({ message: `Event created with id ${event.id}` });
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

    app.get('/events/:schoolOrTeacher/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
        const id = req.params.id || '';

        const findObj = {};
        const schoolOrTeacher = req.params.schoolOrTeacher === 'school' ? 'school' : 'teacher';
        findObj[schoolOrTeacher + 'Id'] = id;

        Event.find(findObj, (err, events) => {
            if (err) {
                res.status(500).json({ message: 'Event not found', err });
            } else if (events) {
                res.status(200).json({ message: 'Events found', events });
            } else {
                res.status(500).json({ message: 'Event not found' });
            }
        });
    });

    // delete event

    // update event
};
