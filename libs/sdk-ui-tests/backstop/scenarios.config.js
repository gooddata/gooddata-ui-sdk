// (C) 2007-2019 GoodData Corporation

const stories = require("./stories");

/*
 * BackstopJS configuration for scenarios created for storybook stories.
 *
 * This contains list of objects as:
 *
 * {
 *    idRegex: pattern,
 *    config: { ... }
 * }
 *
 * Where
 *
 * - idRegex is regular expression to match against the scenario identifier. Scenario identifier is
 *   constructed as "storybookKind_storybookName".
 *
 * - config is object with BackstopJS configuration; typically should contain at least the readySelector. This
 *   object will be passed to BackstopJS as-is.
 *
 * If no config matches the scenario ID, then the scenario will not be tested using BackstopJS
 */

const ScenarioConfig = [
    {
        // this is for customization stories that generate multiple variants with different config; we have
        // a special ready wrapper for these
        idRegex: /.*(data labels|coloring|legend)/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
        },
    },
    {
        idRegex: /(01|02).*/g,
        config: {
            readySelector:
                ".screenshot-target, .screenshot-wrapper .highcharts-container, " +
                ".screenshot-wrapper .s-headline-value, " +
                ".screenshot-wrapper .s-pivot-table .s-loading-done",
        },
    },
];

// --------------------------------------------------------------------
// Internals;
//
// there should be no need to touch these when customizing backstop scenarios config for stories
// --------------------------------------------------------------------

function scenarioLabel(kind, name) {
    return `${kind} - ${name}`;
}

function scenarioUrl(kind, name) {
    return `http://storybook/iframe.html?selectedKind=${encodeURIComponent(
        kind,
    )}&selectedStory=${encodeURIComponent(name)}`;
}

function scenarioConfig(kind, name) {
    const id = `${kind}_${name}`;

    const foundConfig = ScenarioConfig.find(({ idRegex }) => {
        return id.match(idRegex) !== null;
    });

    if (foundConfig === undefined) {
        console.warn(
            "Cannot determine BackstopJS configuration for scenario with ID: ",
            id,
            "; This story will not be screenshot tested using Backstop.",
        );

        return {};
    }

    return foundConfig.config;
}

module.exports = stories
    .map(({ kind, name }) => {
        const config = scenarioConfig(kind, name);

        return config !== undefined
            ? {
                  label: scenarioLabel(kind, name),
                  url: scenarioUrl(kind, name),
                  ...config,
              }
            : undefined;
    })
    .filter(scenario => scenario !== undefined);
