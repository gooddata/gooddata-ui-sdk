// (C) 2007-2025 GoodData Corporation

import { ScenarioGroup } from "../../src/index.js";
import allScenarios from "../../scenarios/index.js";
import groupBy from "lodash/groupBy.js";
import sortBy from "lodash/sortBy.js";
import values from "lodash/values.js";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { generateExportName, generateImports, header } from "./generateStories.js";

// delete any pre-existing stories
rmSync("./stories/visual-regression/visualizations/scenarioStories", { recursive: true, force: true });

const ScenarioGroupsByVis = values(groupBy<ScenarioGroup<any>>(allScenarios, (g) => g.vis));
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

ScenarioGroupsByVis.forEach((groups, groupsIndex) => {
    /*
     * Sort groups; the order in which stories for the group are created is important as that is the order
     * in which the groups appear in storybook.
     */
    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    // for some reason, multiple groups can have identical groupNames, which caused a bug where the files overwrite each other
    // the simplest way to deal with this, will be to group them by groupNames, using lodash, same as above
    // then we iterate over that, and create one file per groupedSortedGroups
    const groupedSortedGroups = values(
        groupBy<ScenarioGroup<any>>(sortedGroups, (g) => g.groupNames.join("/")),
    );

    groupedSortedGroups.forEach((groupedGroup, groupedGroupIndex) => {
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

        const helperFileNamedImports = ["getScenariosGroupByIndexes"];

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

                storyExports.push(`export const ${exportName} = () => groupedStory(getScenariosGroupByIndexes(${groupsIndex}, ${groupIndex}), ${JSON.stringify(
                    wrapperStyle,
                    null,
                    4,
                )})();
${exportName}.parameters = { kind: "${group.testConfig.visual.groupUnder}", screenshot: true };`);

                // we need an additional import
                helperFileNamedImports.push("groupedStory");
            } else {
                // otherwise there will be story-per-scenario
                const scenarios = visualOnly.asScenarioDescAndScenario();

                scenarios.forEach(([name]) => {
                    const exportName = generateExportName(name);

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
${exportName}.parameters = { kind: "${name}", screenshot: true };`);
                });

                // we need additional imports
                helperFileNamedImports.push("buildStory", "withCustomSetting", "backend");
            }
        });

        if (storyExports.length === 0) return;

        const requires = generateImports([
            {
                source: `${pathToRoot}stories/visual-regression/visualizations/scenarioStories.js`,
                namedImports: [...new Set(helperFileNamedImports)],
            },
        ]);

        const fileContents = `${header}\n\n${requires}\n\n${defaultExport}\n\n${storyExports.join("\n\n")}\n`;

        mkdirSync(fileDirectory, { recursive: true });
        writeFileSync(filePath, fileContents);
    });
});
