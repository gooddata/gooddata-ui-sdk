// (C) 2007-2018 GoodData Corporation
const bodyParser = require('body-parser');

module.exports = (app, sdk, { domainAdmin, projectIdToAssign, userRole }) => {
    if (!domainAdmin.username || !domainAdmin.password || !projectIdToAssign) {
        // eslint-disable-next-line no-console
        console.warn('Set up DOMAIN_ADMIN_USERNAME/PASSWORD and PROJECT_ID_TO_ASSIGN for the /api/assign-project endpoint to work.');
    }

    app.post('/api/assign-project', bodyParser.json(), (req, res) => {
        const { body } = req;
        if (!body) {
            return res.status(400).send('Missing body');
        }

        const keys = ['user'];
        const missingKeys = keys.filter(f => !body[f]);
        if (missingKeys.length > 0) {
            return res.status(400).send(`Missing parameters: ${missingKeys.join(', ')}`);
        }

        return sdk.user.login(domainAdmin.username, domainAdmin.password).then(() => {
            return sdk.xhr.post(`/gdc/projects/${projectIdToAssign}/users`, {
                body: JSON.stringify({
                    user: {
                        content: {
                            status: 'ENABLED',
                            userRoles: [`/gdc/projects/${projectIdToAssign}/roles/${userRole}`]
                        },
                        links: {
                            self: body.user
                        }
                    }
                })
            }).then((result) => {
                // eslint-disable-next-line no-console
                console.log('POST', result.response.url, '>>>', result.getData());

                return res.status(200).json({
                    status: 'success'
                });
            });
        }).catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err); // Log all errors to console

            if (err.responseBody) {
                return res.status(400).send(err.responseBody);
            }

            return res.status(400).json({
                message: 'unknown error'
            });
        });
    });
};

