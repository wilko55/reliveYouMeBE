'use strict';

const Teacher = require('../data/teacher');
const School = require('../data/school');
const bCrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

module.exports = (app, passport, jwtOptions) => {
    app.post('/login', function (req, res) {
        if (req.body.email && req.body.password) {
            const email = req.body.email;
            const password = req.body.password;

            Teacher.findOne(
              { email: email }
            ).then((user) => {
                if (user) {
                    if (!bCrypt.compareSync(password, user.password)) {
                        res.status(401).json({ message: 'Incorrect password' });
                    } else {
                        console.log('user found!', user)
                        const payload = { id: user.id };
                        const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '30m' });
                        res.status(200).json({ message: 'ok', token });
                    }
                } else {
                    School.findOne(
                    { email: email }
                  ).then((school) => {
                      if (school) {
                          if (!bCrypt.compareSync(password, school.password)) {
                              res.status(401).json({ message: 'Incorrect password' });
                          } else {
                              const payload = { id: school.id };
                              const token = jwt.sign(payload, jwtOptions.secretOrKey, { expiresIn: '30m' });
                              res.status(200).json({ message: 'ok', token, type: 'school' });
                          }
                      } else {
                          res.status(401).json({ message: 'No profile found' });
                      }
                  })
                  .catch((err) => {
                      res.status(401).json({ message: 'Something went wrong with your signin', err });
                  });
                }
            }).catch((err) => {
                res.status(401).json({ message: 'Something went wrong with your signin', err });
            });
        } else {
            res.status(401).json({ message: 'All parameters required' });
        }
    });

    app.post('/authenticate', passport.authenticate('jwt', { session: false }), (req, res) => {
        res.json(req.user);
    });
};
