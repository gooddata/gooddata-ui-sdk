// (C) 2007-2018 GoodData Corporation
const express = require('express');
const request = require('supertest');
const gdjs = require('@gooddata/gooddata-js');

const register = require('../register');

function createSdk() {
    const httpResponseObject = { url: 'fake-url' };
    const httpResponseBody = JSON.stringify({ uri: '/gdc/account/profile/123' });
    const apiResponse = new gdjs.ApiResponse(httpResponseObject, httpResponseBody);

    return {
        user: {
            login: jest.fn(() => Promise.resolve({}))
        },
        xhr: {
            post: jest.fn(() => Promise.resolve(apiResponse))
        }
    };
}

const config = {
    domainAdmin: {
        username: 'foo',
        password: 'bar'
    },
    projectIdToAssign: 'projectId',
    userRole: 3
};

function createApp(sdk = createSdk()) {
    const app = express();
    register(app, sdk, config);
    return app;
}

describe('assignProject', () => {
    it('should return 400 for request without body', () => {
        return request(createApp())
            .post('/api/register')
            .send()
            .expect(400);
    });

    it('should return 400 if required values are not provided', () => {
        return request(createApp())
            .post('/api/register')
            .send({ foo: 'bar' })
            .expect(400);
    });

    it('should call sdk.user.login and register user', () => {
        const sdkMock = createSdk();
        const data = {
            login: 'jan.pravdac@gooddata.com',
            password: 'displayFormyJsouNejlepsi',
            verifyPassword: 'displayFormyJsouNejlepsi',
            firstName: 'Jan',
            lastName: 'Pravdac'
        };
        return request(createApp(sdkMock))
            .post('/api/register')
            .send(data)
            .expect(201)
            .then(() => {
                expect(sdkMock.user.login).toHaveBeenCalledTimes(1);
                expect(sdkMock.xhr.post).toHaveBeenCalledTimes(1);
                expect(sdkMock.xhr.post).toHaveBeenCalledWith('/gdc/account/domains/developer/users', {
                    body: JSON.stringify({
                        accountSetting: data
                    })
                });
            });
    });

    it('should return 400 if user is already registered', () => {
        const sdkMock = createSdk();
        sdkMock.xhr.post = jest.fn(() => {
            // eslint-disable-next-line
            return Promise.reject({
                responseBody: JSON.stringify({
                    error: {
                        errorCode: 'gdc1052',
                        message: 'already registered'
                    }
                })
            });
        });

        const data = {
            login: 'jan.pravdac@gooddata.com',
            password: 'displayFormyJsouNejlepsi',
            verifyPassword: 'displayFormyJsouNejlepsi',
            firstName: 'Jan',
            lastName: 'Pravdac'
        };
        return request(createApp(sdkMock))
            .post('/api/register')
            .send(data)
            .expect(400)
            .then((res) => {
                expect(JSON.parse(res.text)).toEqual({
                    error: {
                        errorCode: 'gdc1052',
                        message: 'already registered'
                    }
                });
                expect(sdkMock.user.login).toHaveBeenCalledTimes(1);
                expect(sdkMock.xhr.post).toHaveBeenCalledTimes(1);
                expect(sdkMock.xhr.post).toHaveBeenCalledWith('/gdc/account/domains/developer/users', {
                    body: JSON.stringify({
                        accountSetting: data
                    })
                });
            });
    });
});

