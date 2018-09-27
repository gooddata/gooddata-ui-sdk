// (C) 2007-2018 GoodData Corporation
const { factory } = require('@gooddata/gooddata-js');
const https = require('https');
const fs = require('fs');
const express = require('express');
require('dotenv').config();

const proxy = require('./endpoints/proxy');
const register = require('./endpoints/register');
const assignProject = require('./endpoints/assignProject');
const staticFiles = require('./endpoints/staticFiles');
const redirectToHttps = require('./endpoints/redirectToHttps');

const config = {
    serveFrom: `${__dirname}/../../dist/`,
    port: process.env.PORT || 3009,
    https: process.env.HTTPS || false,
    domain: process.env.DOMAIN || 'https://developer.na.gooddata.com/',
    domainAdmin: {
        username: process.env.DOMAIN_ADMIN_USERNAME,
        password: process.env.DOMAIN_ADMIN_PASSWORD
    },
    projectIdToAssign: process.env.PROJECT_ID_TO_ASSIGN,
    userRole: process.env.USER_ROLE || 3
};
console.log(`Examples-node-server config: ${JSON.stringify(config, false, '\t')}`); // eslint-disable-line no-console

const endpoints = [
    redirectToHttps,
    register,
    assignProject,
    proxy,
    staticFiles
];

const sdk = factory({ domain: config.domain });

const app = express();
endpoints.forEach(handler => handler(app, sdk, config));

if (config.https) {
    console.log('[hint] HTTPS certificates could be generated with: \n       openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt'); // eslint-disable-line no-console,max-len
    const options = {
        key: fs.readFileSync('./server.key'),
        cert: fs.readFileSync('./server.crt'),
        requestCert: false,
        rejectUnauthorized: false
    };
    https.createServer(options, app).listen(config.port, () => {
        console.log(`Listening on https://localhost:${config.port}...`); // eslint-disable-line no-console
    });
} else {
    app.listen(config.port);
    console.log(`Listening on http://localhost:${config.port}...`); // eslint-disable-line no-console
}
