// (C) 2007-2025 GoodData Corporation

import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";

import { groupBy, keyBy, sortBy } from "lodash-es";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { type RecordingIndex } from "@gooddata/sdk-backend-mockingbird";
import { type IInsight, insightId, insightVisualizationUrl } from "@gooddata/sdk-model";

import { type INeobackstopScenarioConfig, type IStoryParameters } from "./backstopScenario.js";
import { LongPostInteractionTimeout, ShortPostInteractionTimeout } from "./backstopWrapper.js";
import { ConfigurationPanelWrapper } from "./ConfigurationPanelWrapper.js";
import { generateExportName, generateImports, header } from "./generateStories.js";
import { ScreenshotReadyWrapper } from "./ScreenshotReadyWrapper.js";
import { allScenarios } from "../../scenarios/index.js";
import { type ScenarioGroup } from "../../src/index.js";

// delete any pre-existing stories
rmSync("./stories/visual-regression/visualizations/insightStories", { recursive: true, force: true });

/*
 * Code in this file generates stories that render test scenarios using pluggable visualizations.
 *
 * Doing this is slightly more complicated than doing stories using react components. Several aspects
 * factor into this.
 *
 * ---
 *
 * 1  Plug viz renders insights, thus an instance of Insight corresponding to the test scenario must exist in the
 *    reference workspace;
 *
 * 2  Plug viz MAY do some extra auto-magic (such as automatically setting sorts) that will influence what execution
 *    is done against backend => execution recordings done for test scenarios of react components are not sufficient
 *
 * The smoke-and-capture suite takes care of the two above steps in a black-box fashion and populates reference
 * workspace with insights and execution definitions needed for pluggable visualizations.
 *
 * ---
 *
 * Then there is the IChartConfig & vis properties dychotomy. With react components, all visual configuration
 * is done using IChartConfig; BUT Insight's visualization properties DO NOT contain the entire ChartConfig - just
 * parts of it. Stuff such as color palette and number separators are specified by the context and are disconnected
 * from the Insight (typically AD/KD reads these on start and passes them down)
 *
 * The code here must do something similar then - and it achieves this by obtaining the information from the
 * test scenario itself: from the props that are normally sent to react component. If applicable, these
 * props contain the color palette and/or the separators to use.
 *
 * ---
 *
 * Finally, in order to render pluggable visualization the code needs to obtain visualization class of the
 * visualization to render. This is a pure technicality (likely peppered with incorrect design) because all
 * that is actually needed by the plug viz to render is the visualization URL (local:bar etc) which is
 * already present in the Insight. And so the code just auto-generates a fitting visualization class.
 */

//
// Inspect recording index & prepare list of Insights to possibly create stories for
//

function getAvailableInsights(recordings: RecordingIndex): IInsight[] {
    /*
     * getting list of insights for storybook must be a sync operation, thus have to access the
     * recording index directly when building storybook...
     */
    return Object.values(recordings.metadata?.insights ?? {}).map((rec) => rec.obj);
}

const Insights = [...getAvailableInsights(ReferenceRecordings.Recordings)];

const InsightById = keyBy(Insights, insightId);

const ScenarioGroupsByVis = sortBy(
    Object.values(groupBy<ScenarioGroup<any>>(allScenarios, (g) => g.vis)),
    (groups) => groups[0].vis,
);

ScenarioGroupsByVis.forEach((groups, groupsIndex) => {
    /*
     * Sort groups; the order in which stories for the group are created is important as that is the order
     * in which the groups appear in storybook.
     */
    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    // eslint-disable-next-line sonarjs/cognitive-complexity
    sortedGroups.forEach((group, groupIndex) => {
        // because we have duplicate group names, and duplicate scenario names within those duplicate group names
        // we have to create a unique file if one with the same name exists, otherwise they will overwrite each other

        let groupName = "";
        let fileDirectory = "";
        let filePath = "";
        let groupNameModifier = "-01";
        let uniqueFilePathFound = false;
        while (!uniqueFilePathFound) {
            let groupNameParts = [group.vis, ...group.groupNames];

            groupName = ["04 Stories For Pluggable Vis", ...groupNameParts].join("/");

            groupNameParts[groupNameParts.length - 1] =
                groupNameParts[groupNameParts.length - 1] + groupNameModifier;
            groupNameParts = groupNameParts.map((g) => g.replaceAll(/\s+/g, "-"));

            const fileName = `${groupNameParts.pop()}.generated.stories.tsx`;
            fileDirectory = `./stories/visual-regression/visualizations/insightStories/${
                groupNameParts.join("/") + (groupNameParts.length > 0 ? "/" : "")
            }`;
            filePath = `${fileDirectory}${fileName}`;

            if (!existsSync(filePath)) {
                uniqueFilePathFound = true;
                break;
            }

            groupNameModifier =
                "-" + (parseInt(groupNameModifier.substring(1)) + 1).toString().padStart(2, "0");
        }

        const defaultExport = `export default {
    title: "${groupName}",
};`;

        const filePathDepth = filePath.split("/").length - 2; // one at the start and one at the end
        const pathToRoot = "../".repeat(filePathDepth);

        const requires = generateImports([
            {
                source: "@gooddata/sdk-model",
                namedImports: ["IInsight"],
            },
            {
                source: "@gooddata/sdk-ui-pivot/styles/css/main.css",
            },
            {
                source: "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css",
            },
            {
                source: "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css",
            },
            {}, // spacer for eslint to be happier
            {
                source: `${pathToRoot}stories/visual-regression/visualizations/insightStories.js`,
                namedImports: ["getScenariosGroupByIndexes", "plugVizStory"],
            },
            {
                source: `${pathToRoot}stories/_infra/backstopScenario.js`,
                namedImports: ["IStoryParameters"],
            },
            {
                source: `${pathToRoot}/stories/visual-regression/visualizations/insightStories.css`,
            },
        ]);

        const storyExports: string[] = [];

        // only interested in scenarios for visual regression
        const visualOnly: ScenarioGroup<any> = group.forTestTypes("visual");

        if (visualOnly.isEmpty()) {
            // it is completely valid that some groups have no scenarios for visual regression
            return;
        }

        visualOnly.scenarioList.forEach((scenario, scenarioIndex) => {
            if (scenario.tags.includes("no-plug-viz-tests")) {
                // this scenario is forced to skip via tag
                return;
            }

            const insight = InsightById[scenario.insightId];

            if (!insight) {
                if (window.location.hostname === "localhost" && !scenario.tags.includes("mock-no-insight")) {
                    console.warn(
                        `Ignoring test scenario for ${scenario.vis}: ${scenario.name} - insight does not exist.`,
                    );
                }
                return;
            }

            const exportName = generateExportName(scenario.name);

            const screenshotConfig: INeobackstopScenarioConfig | undefined = group.testConfig.visual.skip
                ? undefined
                : {
                      clickSelector: `.${ConfigurationPanelWrapper.DefaultExpandAllClassName}`,
                      readySelector: `.${ScreenshotReadyWrapper.OnReadyClassName}`,
                      // give specific charts some more time to finish rendering
                      postInteractionWait: insightVisualizationUrl(insight).includes("table")
                          ? ShortPostInteractionTimeout
                          : insightVisualizationUrl(insight).includes("repeater")
                            ? LongPostInteractionTimeout
                            : 200,
                      ...(undefined === group.testConfig.visual.delay
                          ? {}
                          : { delay: group.testConfig.visual.delay }),
                      ...(group.testConfig.visual.viewports
                          ? { viewports: group.testConfig.visual.viewports }
                          : {}),
                      ...(group.testConfig.visual.reloadAfterReady
                          ? { reloadAfterReady: group.testConfig.visual.reloadAfterReady }
                          : {}),
                      ...(group.testConfig.visual.misMatchThreshold === undefined
                          ? {}
                          : { misMatchThreshold: group.testConfig.visual.misMatchThreshold }),
                  };

            storyExports.push(`export const ${exportName} = () => plugVizStory(${JSON.stringify(
                insight,
                null,
                4,
            )} as unknown as IInsight, getScenariosGroupByIndexes(${groupsIndex}, ${groupIndex}, ${scenarioIndex}))();
${exportName}.parameters = ${JSON.stringify(
                {
                    kind: scenario.name,
                    screenshot: screenshotConfig,
                } satisfies IStoryParameters,
                null,
                4,
            )} satisfies IStoryParameters;`);
        });

        if (storyExports.length === 0) return;

        const fileContents = `${header}\n\n${requires}\n\n${defaultExport}\n\n${storyExports.join("\n\n")}\n`;

        mkdirSync(fileDirectory, { recursive: true });
        writeFileSync(filePath, fileContents);
    });
});
