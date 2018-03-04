'use strict';

const moment = require('moment');
const Event = require('../data/event');
const Teacher = require('../data/teacher');

const YEAR = moment().format('YYYY');
const MONTH = moment().format('MM');

const getDaysInMonth = (month, year) => {
    return moment(`${month}-${year}`, 'MM-YYYY').daysInMonth();
};

const getFirstDayOfMonth = (month, year) => {
    const dayNum = moment(`${month}-${year}`, 'MM-YYYY').format('d');
    return parseInt(dayNum);
};

const generateMonthArr = (daysInMonth, firstDayOfMonth, month, year) => {
    const date = moment(`${month}-${year}`, 'MM-YYYY');
    let arr = [];

    // pad start of month if not Monday
    if (firstDayOfMonth !== 1) {
        for (let j = 1; j < firstDayOfMonth; j += 1) {
            arr.push({
                date: {
                    placeholder: true
                }
            });
        }
    }

    // Fill calendarData arr
    for (let i = 1; i <= daysInMonth; i += 1) {
        let dayNum = i < 10 ? '0' + i.toString() : i.toString();

        arr.push({
            date: {
                'day-num': dayNum,
                'month-num': date.format('MM')
            },
            availability: {
            },
            events: []
        });
    }
    return arr;
};

const mapEventTime = (time) => {
    const map = {
        'All day': 'full',
        Afternoon: 'afternoon',
        Morning: 'morning'
    };
    return map[time];
};

module.exports = (app, passport) => {
    app.get('/calendar/school/:month/:year', (req, res) => {
        const month = req.params.month || moment().format('MMMM');
        const year = req.params.year || moment().format('YYYY');

        // get all events with school id for that month
        // for each day in month:
        // group events for taht day
        // if today pending, add that
    });

    app.get('/calendar/teacher/:month?/:year?', passport.authenticate('jwt', { session: false }), (req, res) => {
        const month = req.params.month || moment().format('MM');
        const year = req.params.year || moment().format('YYYY');

        const daysInMonth = getDaysInMonth(month, year);
        const firstDayOfMonth = getFirstDayOfMonth(month, year);
        const calendarData = generateMonthArr(daysInMonth, firstDayOfMonth, month, year);

        const availability = req.user.availability && req.user.availability[`${month}-${year}`] ? req.user.availability[`${month}-${year}`] : {};

        Event.find({ teacherId: req.user.id, 'date.month': month }, (err, result) => {
            if (err) {
                res.status(500, { err });
            }

            calendarData.forEach((calEl) => {
                if (!calEl.date.placeholder) {
                    result.forEach((eventEl) => {
                        if (calEl.date['day-num'] === eventEl.date.day) {
                            calEl.availability.free = false;
                            calEl.availability.unavailable = false;
                            calEl.availability[mapEventTime(eventEl.time)] = true;
                            calEl.event = eventEl;
                        }
                    });
                    // fill availability
                    if (availability[calEl.date['day-num']]) {
                        calEl.availability.free = true;
                    } else if (Object.keys(calEl.availability).length === 0) {
                        calEl.availability.unavailable = true;
                    }

                    if (moment().format('DD') === calEl.date['day-num']) {
                        calEl.date.today = true;
                    }
                }
            });
            res.status(200).json(calendarData);
        });
    });

    app.post('/calendar/teacher/:month?/:year?', passport.authenticate('jwt', { session: false }), (req, res) => {
        // expect data in form {'day-02': true}
        const month = req.params.month || moment().format('MM');
        const year = req.params.year || moment().format('YYYY');

        const newAvailability = req.body.calendarData;
        // get teacher events
        Event.find({ teacherId: req.user.id, 'date.month': month }, (err, result) => {
            if (err) {
                res.status(500, { err });
            }

            const availability = {};
            result.forEach((event) => {
                const val = `day-${event.date.day}`;
                // don't update currently booked dates
                if (newAvailability[val] === false || newAvailability[val] === true) {
                    delete newAvailability[val];
                }
            });

            let day;
            for (let el in newAvailability) {
                day = el.split('-')[1];
                availability[day.toString()] = newAvailability[el];
            }

            // package data in right form
            const key = `${month}-${year}`;
            const currentAvailability = req.user.availability ? req.user.availability[key] : {};
            const mergedAvailability = Object.assign({}, currentAvailability, availability);
            const toUpdate = {};
            toUpdate[key] = mergedAvailability;

            Teacher.findByIdAndUpdate({ _id: req.user.id }, { availability: toUpdate }, { upsert: true }, (err, teacher) => {
                if (err) {
                    res.status(500).json({ message: 'An error occured', err });
                } else if (teacher) {
                    res.status(200).json({ message: 'Calendar updated' });
                } else {
                    res.status(500).json({ message: 'Teacher id not found' });
                }
            });
        });
    });
};

