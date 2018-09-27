// (C) 2007-2018 GoodData Corporation
const express = require('express');
const request = require('supertest');
const gdjs = require('@gooddata/gooddata-js');

const assignProject = require('../assignProject');


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
    assignProject(app, sdk, config);
    return app;
}

describe('assignProject', () => {
    it('should return 400 for request without body', () => {
        return request(createApp())
            .post('/api/assign-project')
            .send()
            .expect(400);
    });

    it('should return 400 if user is not provided', () => {
        return request(createApp())
            .post('/api/assign-project')
            .send({ foo: 'bar' })
            .expect(400);
    });

    it('should call sdk.user.login and post user to project', () => {
        const sdkMock = createSdk();
        return request(createApp(sdkMock))
            .post('/api/assign-project')
            .send({ user: '6f56e9d96c3bfdf09b65e26314a33c95' })
            .expect(200)
            .then(() => {
                expect(sdkMock.user.login).toHaveBeenCalledTimes(1);
                expect(sdkMock.xhr.post).toHaveBeenCalledTimes(1);
                expect(sdkMock.xhr.post).toHaveBeenCalledWith('/gdc/projects/projectId/users', {
                    body: JSON.stringify({
                        user: {
                            content: {
                                status: 'ENABLED',
                                userRoles: ['/gdc/projects/projectId/roles/3']
                            },
                            links: {
                                self: '6f56e9d96c3bfdf09b65e26314a33c95'
                            }
                        }
                    })
                });
            });
    });
});

