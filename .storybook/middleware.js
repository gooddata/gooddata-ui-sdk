const register = require('@gooddata/mock-js');

function registerMocks(app) {
    const schema = require('../mock-schema.json');
    return register.default(app, { schema });
}

module.exports = registerMocks;
