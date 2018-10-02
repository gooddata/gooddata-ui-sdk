// (C) 2007-2018 GoodData Corporation
const { pick } = require('lodash');
const bodyParser = require('body-parser');

module.exports = (app, sdk, { domainAdmin }) => {
    if (!domainAdmin.username || !domainAdmin.password) {
        // eslint-disable-next-line no-console
        console.warn('Set up DOMAIN_ADMIN_USERNAME/PASSWORD for the /api/register endpoint to work.');
    }

    app.post('/api/register', bodyParser.json(), (req, res) => {
        console.log('Server req /api/register'); // eslint-disable-line no-console
        const { body } = req;
        if (!body) {
            return res.status(400).send('Missing body');
        }

        const keys = ['login', 'password', 'verifyPassword', 'firstName', 'lastName'];
        const missingKeys = keys.filter(f => !body[f]);
        if (missingKeys.length > 0) {
            return res.status(400).send(`Missing parameters: ${missingKeys.join(', ')}`);
        }

        return sdk.user.login(domainAdmin.username, domainAdmin.password).then(() => {
            const params = {
                accountSetting: pick(body, keys)
            };
            return sdk.xhr.post('/gdc/account/domains/developer/users', {
                body: JSON.stringify(params)
            }).then((result) => {
                // eslint-disable-next-line no-console
                console.log('POST', result.response.url, '>>>', result.getData());

                res.status(201).json({
                    uri: result.getData().uri
                });
            });
        }).catch((err) => {
            // Log other errors to console
            console.log(err); // eslint-disable-line no-console

            if (err.responseBody) {
                return res.status(400).send(err.responseBody);
            }

            return res.status(400).json({
                message: 'unknown error'
            });
        });
    });
};
