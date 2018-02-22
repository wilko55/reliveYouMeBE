'use strict';

const Teacher = require('../data/teacher');
const bCrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

module.exports = (app, passport, jwtOptions) => {
    app.post('/signup/teacher', (req, res) => {
        let newTeacher = new Teacher({
            email: req.body.email,
            name: req.body.name,
            regNumber: req.body.regNumber,
            password: bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(8), null)
        });

        newTeacher.save((err, teacher) => {
            if (err) {
                console.log('err!!', err);
                res.sendStatus(500);
            }
            const payload = { id: teacher.id };
            const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '30m' });
            res.status(200).json({ message: 'Signed up ok', token });
        });
    });

    app.get('/reg-lookup/:regNumber/:firstName/:lastName', (req, res) => {
        if (req.params.regNumber && req.params.firstName && req.params.lastName) {
            axios.get(`https://educationcouncil.org.nz/ajax/regsearch/${req.params.regNumber}/${req.params.lastName}`)
          .then((results) => {
              if (results.data[0] === true) {
                  res.status(200).json({ message: 'Lookup successful', results: results.data });
              } else {
                  res.status(401).json({ message: 'Registration error' });
              }
          })
          .catch((err) => {
              res.status(401).json({ message: 'Registration not found', err });
          });
        } else {
            res.status(401).json({ message: 'Missing parameters' });
        }
    });

    app.post('/update-teacher', passport.authenticate('jwt', { session: false }), (req, res) => {
         // TODO validate req.body
        Teacher.findOneAndUpdate(req.user.id, req.body.updatedData, { upsert: true }, (err, teacher) => {
            if (err) {
                res.status(500).json({ message: 'An error occured', err });
            } else if (teacher) {
                res.status(200).json({ message: 'Teacher updated' });
            } else {
                res.status(500).json({ message: 'Teacher id not found' });
            }
        });
    });
    // delete teacher
};
