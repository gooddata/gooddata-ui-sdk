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
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for AreaChart legend position scenarios.
         * This is needed because the legend positioning (especially "legend on right") requires
         * time for the chart to re-layout after the legend is calculated and positioned.
         * Without this delay, the legend sometimes doesn't appear and the chart remains centered
         * instead of being positioned to the left with legend on the right.
         */
        idRegex: /01.*AreaChart.*customization.*legend_position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 500,
        },
    },
    {
        /*
         * Delay for BubbleChart coloring customization scenarios.
         * This is needed because legends sometimes don't render at the time of screenshot capture,
         * or render on the wrong side due to missing delay for layout calculations.
         */
        idRegex: /01.*BubbleChart.*customization.*color.*coloring/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 500,
        },
    },
    {
        /*
         * Delay for BulletChart legend position customization scenario.
         * This is needed because the legend is rendering on the wrong side without proper delay
         * for layout calculations to complete.
         */
        idRegex: /01.*BulletChart.*customization.*legend.position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
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
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for ComboChart legend position customization scenario.
         * This is needed because legends are not rendering at the time of screenshot capture.
         */
        idRegex: /01.*ComboChart.*customization.*legend.position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
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
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for FunnelChart color coloring customization scenario.
         * This is needed because legends are rendering on the wrong side without proper delay
         * for layout calculations.
         */
        idRegex: /01.*FunnelChart.*customization.*color.*coloring/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for FunnelChart alignment customization scenario.
         * This is needed because legends are rendering on the wrong side without proper delay
         * for layout calculations.
         */
        idRegex: /01.*FunnelChart.*customization.*alignment/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for FunnelChart data labels customization scenario.
         * This is needed because legends are rendering on the wrong side without proper delay
         * for layout calculations.
         */
        idRegex: /01.*FunnelChart.*customization.*data.labels/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for FunnelChart legend position customization scenario.
         * This is needed because legends are rendering on the wrong side without proper delay
         * for layout calculations.
         */
        idRegex: /01.*FunnelChart.*customization.*legend.position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for Heatmap base measure and columns scenario.
         * This is needed because legends are rendering on the wrong side without proper delay
         * for layout calculations.
         */
        idRegex: /01.*Heatmap.*base.*measure.and.columns/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for Heatmap axis name configuration customization scenario.
         * This is needed because legends are rendering on the wrong side without proper delay
         * for layout calculations.
         */
        idRegex: /01.*Heatmap.*customization.*axis.name.configuration/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for Heatmap data labels customization scenario.
         * This is needed because legends are rendering on the wrong side without proper delay
         * for layout calculations.
         */
        idRegex: /01.*Heatmap.*customization.*data.labels/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for DependencyWheelChart legend position customization scenario.
         * This is needed because the legend is missing without proper delay for rendering.
         */
        idRegex: /01.*DependencyWheelChart.*customization.*legend.position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for PyramidChart data labels customization scenarios.
         * This is needed because the legend renders on the wrong side without proper timing.
         */
        idRegex: /01.*PyramidChart.*customization.*data_labels/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for Treemap coloring customization scenarios.
         * This is needed because the legend renders on the wrong side without proper timing.
         */
        idRegex: /01.*Treemap.*customization.*color.*coloring/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for Treemap legend position customization scenarios.
         * This is needed because the legend renders on the wrong side without proper timing.
         */
        idRegex: /01.*Treemap.*customization.*legend.position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for ScatterPlot coloring customization scenarios.
         * This is needed because the legend renders on the wrong side without proper timing.
         */
        idRegex: /01.*ScatterPlot.*customization.*color.*coloring/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for WaterfallChart theme font customization scenarios.
         * This is needed because the chart shifts left/right when fonts are not fully loaded.
         */
        idRegex: /01.*WaterfallChart.*customization.*theme.*multi.measures.with.font/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for SankeyChart legend position customization scenarios.
         * This is needed because the legend is missing without proper delay for rendering.
         */
        idRegex: /01.*SankeyChart.*customization.*legend.position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for WaterfallChart legend position customization scenarios.
         * This is needed because the legend is missing without proper delay for rendering.
         */
        idRegex: /01.*WaterfallChart.*customization.*legend.position/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 200,
        },
    },
    {
        /*
         * Delay for Pluggable AreaChart specific scenario with measure, view by date and stack by date.
         * This is needed because the legend is missing without proper delay for rendering.
         */
        idRegex: /04.*AreaChart.*base.*with.one.measure.and.view.by.date.and.stack.by.date/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            clickSelector: ".config-panel-expand-all",
            postInteractionWait: 200,
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific AreaChart pluggable vis stacking scenario.
         * This is needed because the legend renders on the wrong side without proper timing.
         */
        idRegex: /04.*AreaChart.*stacking.*single_measure_with_viewBy_and_stackBy_and_disabled_stacking/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific BarChart pluggable vis stackBy with date scenario.
         * This is needed because the legend is missing without proper timing.
         */
        idRegex: /04.*BarChart.*base.*stackBy_with_one_date/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific BarChart pluggable vis data labels scenario.
         * This is needed because the legend is missing without proper timing.
         */
        idRegex: /04.*BarChart.*customization.*data_labels.*data_labels_forced_hidden_totals_forced_visible/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific BarChart pluggable vis data labels forced hidden totals forced hidden scenario.
         * This is needed because the legend renders on the wrong side without proper timing.
         */
        idRegex: /04.*BarChart.*customization.*data_labels.*data_labels_forced_hidden_totals_forced_hidden/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific BarChart pluggable vis data labels default scenario.
         * This is needed because the legend is missing without proper timing.
         */
        idRegex: /04.*BarChart.*customization.*data_labels.*default/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific BarChart pluggable vis data labels forced visible scenario.
         * This is needed because the legend is missing without proper timing.
         */
        idRegex: /04.*BarChart.*customization.*data_labels.*data_labels_forced_visible$/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific BarChart pluggable vis data labels forced hidden totals auto visibility scenario.
         * This is needed because the legend is missing without proper timing.
         */
        idRegex: /04.*BarChart.*customization.*data_labels.*labels_forced_hidden_totals_auto_visibility/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Delay for specific BarChart pluggable vis color assign color to attribute element stack scenario.
         * This is needed because the legend renders on the wrong side without proper timing.
         */
        idRegex: /04.*BarChart.*customization.*color.*assign_color_to_attribute_element_stack/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            delay: 100,
        },
    },
    {
        /*
         * Tests for repeater stories - either created automatically for test scenarios or created manually.
         */
        idRegex: /(01).*Repeater.*/g,
        config: {
            delay: 2500,
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
         * Tests for pivot table stories - either created automatically for test scenarios or created manually.
         * These have same selectors as the rest of the visualizations but want to have increased mismatch
         * threshold as tables can be large which can make bugs related to first (sticky) row slip through.
         */
        idRegex: /(01|02).*Pivot.*/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            misMatchThreshold: 0.01,
        },
    },
    {
        /*
         * PivotTableNext only: give it a small settle time.
         */
        idRegex: /(01|02).*PivotTableNext.*/g,
        config: {
            delay: 4000, // wait for column resizing to complete
            misMatchThreshold: 0.01,
        },
    },
    {
        /*
         * Tests for Headline dont require high threshold
         */
        idRegex: /(02).*Headline.*/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
            misMatchThreshold: 0.01,
        },
    },
    {
        /*
         * Tests for visualization stories - either created automatically for test scenarios or created manually
         */
        idRegex: /(01|02).*/g,
        config: {
            readySelector: ".screenshot-ready-wrapper-done",
        },
    },
    {
        /*
         * Pluggable PivotTableNext only: give it a small settle time.
         */
        idRegex: /04.*PivotTableNext.*/g,
        config: {
            delay: 4000, // wait for column resizing to complete
            misMatchThreshold: 0.01,
        },
    },
    {
        /*
         * Tests for pluggable pivot table.
         *
         * For these we want to have increased mismatch threshold as tables can be large which can make bugs
         * related to first (sticky) row slip through.
         */
        idRegex: /04.*Pivot.*/g,
        config: {
            misMatchThreshold: 0.01,
        },
    },
    {
        /*
         * Tests for pluggable visualizations. All backstop config is provided on per-story basis.
         */
        idRegex: /04.*/g,
        config: {},
    },
    {
        /*
         * Tests for Filtering components
         */
        idRegex: /(10).*/g,
        config: {
            readySelector: ".screenshot-target",
        },
    },
    {
        /*
         * Tests for configuration controls components
         */
        idRegex: /(11).*/g,
        config: {
            readySelector: ".screenshot-target",
        },
    },
    {
        /*
         * Tests for UI KIT components
         */
        idRegex: /(12).*/g,
        config: {
            readySelector: ".screenshot-target",
        },
    },
    {
        /*
         * Tests for UI KIT Icon components
         */
        idRegex: /(12).*Icon.*/g,
        config: {
            readySelector: ".screenshot-target",
            misMatchThreshold: 0.01,
        },
    },
    {
        /*
         * Tests for Web Components
         */
        idRegex: /(13).*/g,
        config: {
            misMatchThreshold: 0.01,
            delay: 2000, // wait for a bit for the async import to resolve
        },
    },
    {
        /*
         * Tests for GenAI
         */
        idRegex: /(14).*/g,
        config: {
            misMatchThreshold: 0.01,
        },
    },
    {
        /*
         * Tests for new Ui-Kit Components
         */
        idRegex: /(15).*/g,
        config: {
            readySelector: ".screenshot-target",
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
    return `http://${process.env.DOCKER === "true" ? "storybook" : "localhost"}:8080/iframe.html?id=${encodeURIComponent(id)}`;
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
                    `Cannot determine BackstopJS configuration for scenario from story: ${label}; This story will not be screenshot tested using Backstop.`,
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
