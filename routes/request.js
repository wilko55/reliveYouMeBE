const Nexmo = require('nexmo');
const config = require('../config').config();

module.exports = (app, passport) => {
    app.post('/request/contactBySMS', (req, res) => {
        const idsToContact = '';

        const nexmo = new Nexmo({
            apiKey: config.nexmo.API_KEY,
            apiSecret: config.nexmo.API_SECRET
        });

        nexmo.message.sendSms('Relieve You Me', '+447584633437', 'Testing SMS, click reliveyoume.com/reply/123 or www.relieveyoume.com/reply.123');
    });
};
