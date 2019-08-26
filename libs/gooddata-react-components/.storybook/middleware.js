const register = require('@gooddata/mock-js');

function registerMocks(app) {
    const schema = require('../mock-schema.js');
    const config = {
        randomSeed: 'reactcomponents',
        pollCount: 1
    };
    return register.default(app, { schema, config });
}

module.exports = registerMocks;
