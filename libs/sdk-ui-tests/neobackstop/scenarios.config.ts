/*
 * BackstopJS global configuration for scenarios created for storybook stories.
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
 *   constructed as "storybookKind_storybookName", e.g. "14 GenAI/SemanticSearch/short".
 *
 * - config is object with BackstopJS configuration; typically should contain at least the readySelector. This
 *   object will be passed to BackstopJS as-is.
 *
 * If no config matches the scenario ID, then the scenario will not be tested using BackstopJS
 */

import { IStoryInfo } from "../stories/_infra/toBackstop";

const ScenarioConfig = [
    {
        /*
         * Specific delay for the single measure bar chart scenario.
         * This is needed because the label on the bar chart changes colour after render,
         * from black to white.
         */
        idRegex: /01.*BarChart.*base.*single_measure$/g,
        config: {
            delay: {
                postReady: 200,
            },
        },
    },
    {
        /*
         * Delay for ColumnChart theme font customization scenario.
         * This is needed because the chart shifts slightly left/right when fonts are not fully loaded
         * at the time of screenshot capture.
         */
        idRegex: /01.*ColumnChart.*customization.*theme.*font/g,
        config: {
            delay: {
                postReady: 200,
            },
        },
    },
    {
        /*
         * Delay for FunnelChart theme font customization scenario.
         * This is needed because text is shifting up/down when fonts are not fully loaded
         * at the time of screenshot capture.
         */
        idRegex: /01.*FunnelChart.*customization.*theme.*font/g,
        config: {
            delay: {
                postReady: 200,
            },
        },
    },
    {
        /*
         * Delay for WaterfallChart theme font customization scenarios.
         * This is needed because the chart shifts left/right when fonts are not fully loaded.
         */
        idRegex: /01.*WaterfallChart.*customization.*theme.*multi.measures.with.font/g,
        config: {
            delay: {
                postReady: 100,
            },
        },
    },
    {
        /*
         * Tests for repeater stories - either created automatically for test scenarios or created manually.
         */
        idRegex: /(01).*Repeater.*/g,
        config: {
            delay: {
                postReady: 2500,
            },
        },
    },
    {
        // this is for customization stories that generate multiple variants with different config; we have
        // a special ready wrapper for these
        idRegex: /.*(data labels|coloring|legend|canvas)/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
        },
    },
    {
        /*
         * PivotTableNext only: give it a small settle time.
         */
        idRegex: /(01).*PivotTableNext.*/g,
        config: {
            delay: {
                postReady: 4000, // wait for column resizing to complete
            },
        },
    },
];

// --------------------------------------------------------------------
// Internals;
//
// there should be no need to touch these when customizing backstop scenarios config for stories
// --------------------------------------------------------------------

function scenarioLabel(storyKind: string, storyName: string, scenarioName: string) {
    const storyDerivedName = `${storyKind} - ${storyName}`;

    return scenarioName !== undefined ? `${storyDerivedName} - ${scenarioName}` : storyDerivedName;
}

function scenarioUrlForId(id: string) {
    // see docker-compose-neobackstop.yaml for the network name, to hide watermark in tests we need localhost or ag-grid.com
    return `http://${process.env.DOCKER === "true" ? "ag-grid.com" : "localhost"}:8080/iframe.html?id=${encodeURIComponent(id)}`;
}

/**
 * As a convenience, the screenshot testing infrastructure allows to globally define backstop JS configurations
 * to associate to scenarios automatically created for storybook stories. The association is done based on
 * story kind & name regex match.
 *
 * @param kind story kind
 * @param name story name
 */
function scenarioGlobalConfig(kind, name) {
    const id = `${kind}_${name}`;

    const configurations = ScenarioConfig.filter(({ idRegex }) => {
        return id.match(idRegex) !== null;
    });

    if (configurations.length === 0) {
        return {};
    }

    let object = {};
    for (const configuration of configurations) object = { ...configuration.config, ...object };

    return object;
}

export default (stories: IStoryInfo[]) => {
    return stories
        .map((story) => {
            const { storyId, storyKind, storyName, scenarioName, scenarioConfig: localConfig } = story;
            const label = scenarioLabel(storyKind, storyName, scenarioName);

            /*
             * Create configuration for this scenario. Find global configuration that applies for scenario done
             * for this kind of story (if any) and then overlay the config with local scenario (if any)
             *
             * If the resulting configuration is empty, then the story will not be tested using backstop - as it is
             * not clear what to wait for.
             */
            const globalConfig = scenarioGlobalConfig(storyKind, storyName);
            const scenarioConfig = {
                ...globalConfig,
                ...localConfig,
            };

            if (Object.keys(scenarioConfig).length === 0) {
                console.warn(
                    `Cannot determine NeoBackstop configuration for scenario from story: ${label}; This story will not be screenshot tested using Backstop.`,
                );

                return undefined;
            }

            return {
                id: label.replace(/[/ ]/g, "_").replace(/[@()%,'&:]/g, ""),
                label: label,
                url: scenarioUrlForId(storyId),
                ...scenarioConfig,
            };
        })
        .filter((scenario) => scenario !== undefined);
};
