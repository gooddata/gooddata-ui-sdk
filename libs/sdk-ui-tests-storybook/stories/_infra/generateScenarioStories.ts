// (C) 2007-2026 GoodData Corporation

import { mkdirSync, rmSync, writeFileSync } from "fs";

import { groupBy, sortBy } from "lodash-es";
import { format } from "oxfmt";

import { type ScenarioGroup, allScenarios } from "@gooddata/sdk-ui-tests-scenarios";

import { type INeobackstopScenarioConfig, State } from "./backstopScenario.js";
import { generateExportName, generateImports, header } from "./generateStories.js";
import { replaceStateInJson } from "./stateReplacer.js";

// delete any pre-existing stories
rmSync("./stories/visual-regression/visualizations/scenarioStories", { recursive: true, force: true });

const ScenarioGroupsByVis = Object.values(groupBy<ScenarioGroup<any>>(allScenarios, (g) => g.vis));
const DefaultWrapperStyle = { width: 800, height: 400 };

// this part validates that a developer has not unknowingly created scenarios with the same name in any 1 scenario group
ScenarioGroupsByVis.forEach((groups, groupsIndex) => {
    groups.forEach((group, groupIndex) => {
        const nameCounts: Record<string, number> = {};
        group.scenarioList.forEach((scenario) => {
            const name = scenario.name;
            nameCounts[name] = (nameCounts[name] || 0) + 1;
        });
        const duplicates = Object.entries(nameCounts)
            .filter(([_, count]) => count > 1)
            .map(([name]) => name);
        if (duplicates.length > 0) {
            throw new Error(
                `Duplicate scenario names in group [vis=${group.vis}, groupNames=${JSON.stringify(
                    group.groupNames,
                )}] (groupsIndex=${groupsIndex}, groupIndex=${groupIndex}): ${duplicates.join(", ")}`,
            );
        }
    });
});

for (const [groupsIndex, groups] of ScenarioGroupsByVis.entries()) {
    /*
     * Sort groups; the order in which stories for the group are created is important as that is the order
     * in which the groups appear in storybook.
     */
    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    // for some reason, multiple groups can have identical groupNames, which caused a bug where the files overwrite each other
    // the simplest way to deal with this, will be to group them by groupNames, using lodash, same as above
    // then we iterate over that, and create one file per groupedSortedGroups
    const groupedSortedGroups = Object.values(
        groupBy<ScenarioGroup<any>>(sortedGroups, (g) => g.groupNames.join("/")),
    );

    for (const [groupedGroupIndex, groupedGroup] of groupedSortedGroups.entries()) {
        const firstGroup = groupedGroup[0];

        let groupNameParts = [firstGroup.vis, ...firstGroup.groupNames];

        const groupName = ["01 Stories From Test Scenarios", ...groupNameParts].join("/");

        const defaultExport = `export default {
    title: "${groupName}",
};`;

        groupNameParts = groupNameParts.map((g) => g.replaceAll(/\s+/g, "-"));

        const fileName = `${groupNameParts.pop()}.generated.stories.tsx`;
        const fileDirectory = `./stories/visual-regression/visualizations/scenarioStories/${
            groupNameParts.join("/") + (groupNameParts.length > 0 ? "/" : "")
        }`;
        const filePath = `${fileDirectory}${fileName}`;

        const filePathDepth = filePath.split("/").length - 2; // one at the start and one at the end
        const pathToRoot = "../".repeat(filePathDepth);

        const helperFileNamedImports: string[] = ["getScenariosGroupByIndexes"];

        const storyExports: string[] = [];

        groupedGroup.forEach((group, newGroupIndex) => {
            const groupIndex =
                groupedSortedGroups.slice(0, groupedGroupIndex).reduce((s, g) => s + g.length, 0) +
                newGroupIndex;

            // only interested in scenarios for visual regression
            const visualOnly: ScenarioGroup<any> = group.forTestTypes("visual");

            if (visualOnly.isEmpty()) {
                // it is completely valid that some groups have no scenarios for visual regression
                return;
            }

            // group may specify the size for its screenshots; if not there, use the default
            const wrapperStyle = group.testConfig.visual.screenshotSize || DefaultWrapperStyle;

            if (group.testConfig.visual.groupUnder) {
                // group may specify, that the scenarios should be grouped under a single story

                const exportName = generateExportName(group.testConfig.visual.groupUnder);

                // Build screenshot config - always include readySelector for "01" stories
                const config: INeobackstopScenarioConfig = {
                    readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
                };
                if (group.testConfig.visual.delay !== undefined) {
                    config.delay = group.testConfig.visual.delay;
                }
                if (group.testConfig.visual.viewports) {
                    config.viewports = group.testConfig.visual.viewports;
                }
                if (group.testConfig.visual.reloadAfterReady) {
                    config.reloadAfterReady = group.testConfig.visual.reloadAfterReady;
                }
                if (group.testConfig.visual.misMatchThreshold !== undefined) {
                    config.misMatchThreshold = group.testConfig.visual.misMatchThreshold;
                }

                storyExports.push(`export const ${exportName} = () => groupedStory(getScenariosGroupByIndexes(${groupsIndex}, ${groupIndex}), ${JSON.stringify(
                    wrapperStyle,
                    null,
                    4,
                )})();
${exportName}.parameters = { kind: "${group.testConfig.visual.groupUnder}", screenshot: ${group.testConfig.visual.skip ? "undefined" : replaceStateInJson(JSON.stringify(config))} } satisfies IStoryParameters;`);

                // we need an additional import
                helperFileNamedImports.push("groupedStory");
            } else {
                // otherwise there will be story-per-scenario
                const scenarios = visualOnly.asScenarioDescAndScenario();

                scenarios.forEach(([name]) => {
                    const exportName = generateExportName(name);

                    // Build screenshot config - always include readySelector for "01" stories
                    const config: INeobackstopScenarioConfig = {
                        readySelector: { selector: ".screenshot-ready-wrapper-done", state: State.Attached },
                    };
                    if (group.testConfig.visual.delay !== undefined) {
                        config.delay = group.testConfig.visual.delay;
                    }
                    if (group.testConfig.visual.viewports) {
                        config.viewports = group.testConfig.visual.viewports;
                    }
                    if (group.testConfig.visual.reloadAfterReady) {
                        config.reloadAfterReady = group.testConfig.visual.reloadAfterReady;
                    }
                    if (group.testConfig.visual.misMatchThreshold !== undefined) {
                        config.misMatchThreshold = group.testConfig.visual.misMatchThreshold;
                    }

                    storyExports.push(`export const ${exportName} = () => (() => {
    const scenarios = getScenariosGroupByIndexes(${groupsIndex}, ${groupIndex}).asScenarioDescAndScenario();
    const scenarioAndDescriptions = scenarios.filter(([name]) => name === "${name}");
    if (scenarioAndDescriptions.length === 0)
        throw new Error("Failed to find scenario '${name}'");
    if (scenarioAndDescriptions.length > 1)
        throw new Error("Multiple '${name}' scenarios found");
    const scenarioAndDescription = scenarioAndDescriptions[0];

    const scenario = scenarioAndDescription[1];

    const { propsFactory, workspaceType, component: Component } = scenario;
    const props = propsFactory(
        withCustomSetting(backend, scenario.backendSettings),
        workspaceType,
    );

    return buildStory(
        Component,
        props,
        ${JSON.stringify(wrapperStyle, null)},
        scenario.tags,
    )();
})();
${exportName}.parameters = { kind: "${name}", screenshot: ${group.testConfig.visual.skip ? "undefined" : replaceStateInJson(JSON.stringify(config))} } satisfies IStoryParameters;`);
                });

                // we need additional imports
                helperFileNamedImports.push("backend", "buildStory", "withCustomSetting");
            }
        });

        if (storyExports.length === 0) continue;

        helperFileNamedImports.sort();

        const requires = generateImports([
            {
                source: `${pathToRoot}stories/visual-regression/visualizations/scenarioStories.js`,
                namedImports: [...new Set(helperFileNamedImports)],
            },
            {
                source: `${pathToRoot}stories/_infra/backstopScenario.js`,
                namedImports: ["IStoryParameters", "State"],
            },
        ]);

        const fileContents = `${header}\n\n${requires}\n\n${defaultExport}\n\n${storyExports.join("\n\n")}\n`;
        const formatted = await format(filePath, fileContents);

        mkdirSync(fileDirectory, { recursive: true });
        writeFileSync(filePath, formatted.code);
    }
}
