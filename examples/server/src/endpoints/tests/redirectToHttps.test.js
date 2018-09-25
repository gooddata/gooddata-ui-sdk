// (C) 2007-2018 GoodData Corporation
const express = require('express');
const request = require('supertest');

const redirectToHttps = require('../redirectToHttps');

function createApp() {
    const app = express();
    redirectToHttps(app);
    app.get('/', (req, res) => { res.send('GET request to homepage'); });
    return app;
}

describe('redirectToHttps', () => {
    const prevenv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    it('should redirect on NODE_ENV = production', () => {
        return request(createApp())
            .get('/')
            .send()
            .expect(302)
            .then((res) => {
                expect(res.get('location').substr(0, 8)).toEqual('https://');

                process.env.NODE_ENV = prevenv;
            });
    });
});
