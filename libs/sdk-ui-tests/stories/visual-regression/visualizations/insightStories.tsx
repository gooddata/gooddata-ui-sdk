// (C) 2007-2025 GoodData Corporation

import { groupBy, sortBy } from "lodash-es";
import { action } from "storybook/actions";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IInsight,
    type IInsightDefinition,
    type ISettings,
    type IVisualizationClass,
    insightId,
    insightTitle,
    insightVisualizationUrl,
} from "@gooddata/sdk-model";
import {
    BaseVisualization,
    DEFAULT_MESSAGES,
    FullVisualizationCatalog,
    type IGdcConfig,
} from "@gooddata/sdk-ui-ext/internal";
import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";

import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";

import { allScenarios } from "../../../scenarios/index.js";
import { type IScenario, MapboxToken, type ScenarioGroup } from "../../../src/index.js";
import { StorybookBackend } from "../../_infra/backend.js";
import { ConfigurationPanelWrapper } from "../../_infra/ConfigurationPanelWrapper.js";
import {
    ScreenshotReadyWrapper,
    andResolver,
    createElementCountResolver,
} from "../../_infra/ScreenshotReadyWrapper.js";
import { getTheme, wrapWithTheme } from "../themeWrapper.js";
import "./insightStories.css";

const DefaultSettings: ISettings = {
    enableSeparateTotalLabels: true,
    enableLineChartTrendThreshold: true,
};

//
// Story creation
//

function createVisualizationClass(insight: IInsightDefinition): IVisualizationClass {
    const visClassUri = insightVisualizationUrl(insight);

    return {
        visualizationClass: {
            orderIndex: 0,
            uri: visClassUri,
            identifier: visClassUri,
            url: visClassUri,
            title: visClassUri,
            icon: "none",
            iconSelected: "none",
            checksum: "",
        },
    };
}

function createGdcConfig(backend: IAnalyticalBackend, testScenario: IScenario<any>): IGdcConfig {
    const scenarioProps = testScenario.propsFactory(backend, testScenario.workspaceType);

    return {
        colorPalette: scenarioProps.config?.colorPalette,
        separators: scenarioProps.config?.separators,
        mapboxToken: MapboxToken,
    };
}

const DoNotRenderConfigPanel = "this-classname-should-not-exist-in-the-document";

/*
 * This ready resolver returns true when both are true:
 *
 * -  3 visualizations are rendered
 * -  the config panel expander is rendered
 *
 * It is important that the story is ready for screenshot when both are true. Otherwise backstop can make
 * the screenshot before the expander is rendered.
 */
const ReportReadyResolver = andResolver(
    createElementCountResolver(3),
    createElementCountResolver(1, [ConfigurationPanelWrapper.DefaultExpandAllClassName]),
);

export function plugVizStory(insight: IInsight, testScenario: IScenario<any>) {
    const isPivotTableNext = testScenario.vis === "PivotTableNext";
    const settings = {
        ...DefaultSettings,
        ...testScenario.backendSettings,
        enableNewPivotTable: isPivotTableNext,
    };

    const backend = StorybookBackend({ globalSettings: settings });

    const visClass = createVisualizationClass(insight);
    const gdcConfig = createGdcConfig(backend, testScenario);

    const wrapper = (child: any) => wrapWithTheme(child, testScenario.tags); // since themes are global anyway, wrap only once
    const effectiveTheme = getTheme(testScenario.tags);

    // Extract drillableItems from the test scenario props
    const drillableItems = testScenario.props["drillableItems"];
    const locale = "en-US";

    /*
     * Note: for KD rendering the story passes width&height explicitly. this is to emulate plug vis behavior where
     * context sets/determines both and sends them down.
     */
    return () => {
        const messages = DEFAULT_MESSAGES;

        return wrapper(
            <ScreenshotReadyWrapper className="plugviz-report" resolver={ReportReadyResolver}>
                <h3>
                    {insightTitle(insight)} ({insightId(insight)})
                </h3>
                <ConfigurationPanelWrapper />
                <div className="render-variants">
                    <div className="ad-like-render">
                        AD
                        <BaseVisualization
                            backend={backend}
                            projectId={testScenario.workspaceType}
                            insight={insight}
                            visualizationClass={visClass}
                            messages={messages[locale]}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            featureFlags={settings}
                            config={gdcConfig}
                            drillableItems={drillableItems}
                            // AD does not support theming, so do not use the theme prop there
                        />
                    </div>

                    <div className="dashboard-like-12">
                        KD full size
                        <BaseVisualization
                            backend={backend}
                            projectId={testScenario.workspaceType}
                            environment="dashboards"
                            insight={insight}
                            width={1362}
                            height={362}
                            visualizationClass={visClass}
                            messages={messages[locale]}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            configPanelClassName={DoNotRenderConfigPanel}
                            featureFlags={settings}
                            config={gdcConfig}
                            theme={effectiveTheme}
                            drillableItems={drillableItems}
                        />
                    </div>

                    <div className="dashboard-like-6">
                        KD half size
                        <BaseVisualization
                            backend={backend}
                            projectId={testScenario.workspaceType}
                            environment="dashboards"
                            insight={insight}
                            width={665}
                            height={362}
                            messages={messages[locale]}
                            visualizationClass={visClass}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            configPanelClassName={DoNotRenderConfigPanel}
                            featureFlags={settings}
                            config={gdcConfig}
                            theme={effectiveTheme}
                            drillableItems={drillableItems}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        );
    };
}

const ScenarioGroupsByVis = sortBy(
    Object.values(groupBy<ScenarioGroup<any>>(allScenarios, (g) => g.vis)),
    (groups) => groups[0].vis,
);

export function getScenariosGroupByIndexes(
    groupsIndex: number,
    groupIndex: number,
    scenarioIndex: number,
): IScenario<any> {
    const groups = ScenarioGroupsByVis[groupsIndex];

    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    const group = sortedGroups[groupIndex];

    const visualOnly: ScenarioGroup<any> = group.forTestTypes("visual");
    if (visualOnly.isEmpty()) throw new Error("No visual tests");

    return visualOnly.scenarioList[scenarioIndex];
}
