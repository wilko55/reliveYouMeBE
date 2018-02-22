'use strict';

const express = require('express');

const app = express();
const config = require('./config').config();

const bodyParser = require('body-parser');
const Teacher = require('./data/teacher');
const School = require('./data/school');

const passport = require('passport');
const passportJWT = require('passport-jwt');

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
jwtOptions.secretOrKey = config.jwtSecret;

const helmet = require('helmet');

app.use(helmet());
const ninetyDaysInMilliseconds = 7776000000;
app.use(helmet.hsts({ maxAge: ninetyDaysInMilliseconds, force: true }));
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
app.use(helmet.contentSecurityPolicy({
  // Specify directives as normal.
    directives: {
        defaultSrc: ['http://localhost:1234/*'],
        scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'http://www.google-analytics.com/'],
        styleSrc: ['\'self\'', '\'unsafe-inline\''],
        imgSrc: ['\'self\'', 'http://www.google-analytics.com/'],
        frameSrc: ['\'none\''],
        fontSrc: ['\'self\''],
        objectSrc: ['\'none\''] // An empty array allows nothing through
    },
    reportOnly: false,
    setAllHeaders: true,
    disableAndroid: false,
    browserSniff: true
}));

app.use(passport.initialize());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:1234');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    Teacher.findById(jwt_payload.id, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            School.findById(jwt_payload.id, (err, school) => {
                if (err) {
                    return done(err, false);
                }
                if (school) {
                    return done(null, school);
                }
                return done(null, false);
            });
        }
    });
}));

require('./routes/authentication.js')(app, passport, jwtOptions);
require('./routes/teacher.js')(app, passport, jwtOptions);
require('./routes/school.js')(app, passport, jwtOptions);
require('./routes/calendar.js')(app, passport, jwtOptions);

require('./routes/event.js')(app, passport, jwtOptions);

const port = 3003;

app.listen(port);
console.log('All kicking off on port ' + port);
