'use strict';

const Event = require('../data/event');
const moment = require('moment');
const _ = require('lodash');

module.exports = (app, passport) => {
    app.post('/event', passport.authenticate('jwt', { session: false }), (req, res) => {
        let newEvent = new Event({
            teacherId: '',
            schoolId: '1234',
            date: req.body.date,
            time: req.body.time,
            school: req.body.school,
            address: {
                addressLine1: req.body.addressLine1,
                addressLine2: req.body.addressLine2 || '',
                addressLine3: req.body.addressLine3 || '',
                postcode: req.body.postcode
            },
            contact: {
                name: req.body.contactName,
                phone: req.body.contactPhone,
                email: req.body.contactEmail
            },
            year: req.body.year,
            role: req.body.role,
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
