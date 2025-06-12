const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        // we need all dep in dev because this package is tooling and its dependencies ocurred in FOSSA scan
        ...depCruiser.DefaultRules.filter(rule => rule.name !== 'not-to-dev-dep'),
        ...depCruiser.DefaultSdkRules
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
