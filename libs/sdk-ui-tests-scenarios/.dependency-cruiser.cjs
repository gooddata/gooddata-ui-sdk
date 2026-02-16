// (C) 2026 GoodData Corporation

const depCruiser = require("../../common/config/dep-cruiser/default.config");

const options = {
    forbidden: [
        // not-to-dev-dep: all deps are dev because this package is tooling and its dependencies occurred in FOSSA scan
        // not-to-unresolvable: dep-cruiser can't resolve subpath exports (e.g. storybook/actions), TypeScript handles this
        ...depCruiser.DefaultRules.filter(
            (rule) => rule.name !== "not-to-dev-dep" && rule.name !== "not-to-unresolvable",
        ),
        ...depCruiser.DefaultSdkRules,
    ],
    options: depCruiser.DefaultOptions,
};

module.exports = options;
