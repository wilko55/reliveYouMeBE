'use strict';

const School = require('../data/school');
const bCrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

module.exports = (app, passport, jwtOptions) => {
    app.post('/signup/school', (req, res) => {
        let newSchool = new School({
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            school: req.body.school,
            contact: {
                name: req.body.contactName
            },
            password: bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(8), null)
        });
        newSchool.save((err, school) => {
            if (err) {
                console.log('err!!', err);
                res.sendStatus(500);
            }
            const payload = { id: school.id };
            const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '30m' });
            res.status(200).json({ message: 'Signed up ok', token });
        });
    });

    app.post('/update-school', passport.authenticate('jwt', { session: false }), (req, res) => {
        School.findOneAndUpdate(req.user.id, req.body.updatedData, { upsert: true }, (err, school) => {
            if (err) {
                res.status(500).json({ message: 'An error occured', err });
            } else if (school) {
                res.status(200).json({ message: 'School updated' });
            } else {
                res.status(500).json({ message: 'School id not found' });
            }
        });
    });

    // delete school
};
