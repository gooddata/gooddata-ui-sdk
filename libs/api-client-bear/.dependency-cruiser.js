const depCruiser = require("../../common/config/dep-cruiser/default.config");

options = {
    forbidden: [
        // api-client-bear relies on string based paths quite heavily, refactoring is not feasible now
        ...depCruiser.DefaultRules.filter((rule) => rule.name !== "not-to-lodash-get"),
        ...depCruiser.DefaultSdkRules,
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
