// (C) 2007-2018 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { RecordingIndex } from "@gooddata/sdk-backend-mockingbird";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightDefinition,
    insightId,
    insightTitle,
    insightVisualizationUrl,
    IVisualizationClass,
    ISettings,
} from "@gooddata/sdk-model";

import { BaseVisualization, FullVisualizationCatalog, IGdcConfig } from "@gooddata/sdk-ui-ext/internal";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";
import { action } from "@storybook/addon-actions";
import React from "react";
import "./insightStories.css";
import { IScenario, MapboxToken, ScenarioGroup } from "../../../src/index.js";
import AllTestScenarioGroups from "../../../scenarios/index.js";
import {
    andResolver,
    createElementCountResolver,
    ScreenshotReadyWrapper,
} from "../../_infra/ScreenshotReadyWrapper.js";
import { ShortPostInteractionTimeout } from "../../_infra/backstopWrapper.js";
import { ConfigurationPanelWrapper } from "../../_infra/ConfigurationPanelWrapper.js";
import { StorybookBackend } from "../../_infra/backend.js";
import { ExamplesRecordings } from "@gooddata/live-examples-workspace";
import { storyGroupFor } from "./storyGroupFactory.js";
import groupBy from "lodash/groupBy.js";
import keyBy from "lodash/keyBy.js";
import sortBy from "lodash/sortBy.js";
import values from "lodash/values.js";
import { PlugVizStories } from "../../_infra/storyGroups.js";
import { wrapWithTheme, getTheme } from "../themeWrapper.js";

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

const DefaultSettings: ISettings = {
    enableAxisNameConfiguration: true,
    enableHidingOfDataPoints: true,
    enableSeparateTotalLabels: true,
};

//
// Inspect recording index & prepare list of Insights to possibly create stories for
//

function getAvailableInsights(recordings: RecordingIndex): IInsight[] {
    /*
     * getting list of insights for storybook must be a sync operation, thus have to access the
     * recording index directly when building storybook...
     */
    return values(recordings.metadata?.insights ?? {}).map((rec) => rec.obj);
}

const Insights = [
    ...getAvailableInsights(ReferenceRecordings.Recordings),
    ...getAvailableInsights(ExamplesRecordings.Recordings),
];
const InsightById = keyBy(Insights, insightId);

const ScenarioGroupsByVis = sortBy(
    values(groupBy<ScenarioGroup<any>>(AllTestScenarioGroups, (g) => g.vis)),
    (groups) => groups[0].vis,
);

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
 * -  4 visualizations are rendered
 * -  the config panel expander is rendered
 *
 * It is important that the story is ready for screenshot when both are true. Otherwise backstop can make
 * the screenshot before the expander is rendered.
 */
const ReportReadyResolver = andResolver(
    createElementCountResolver(4),
    createElementCountResolver(1, [ConfigurationPanelWrapper.DefaultExpandAllClassName]),
);

function plugVizStory(insight: IInsight, testScenario: IScenario<any>) {
    const settings = {
        ...DefaultSettings,
        ...testScenario.backendSettings,
    };

    const backend = StorybookBackend({ globalSettings: settings });

    const visClass = createVisualizationClass(insight);
    const gdcConfig = createGdcConfig(backend, testScenario);

    const wrapper = (child: any) => wrapWithTheme(child, testScenario.tags); // since themes are global anyway, wrap only once
    const effectiveTheme = getTheme(testScenario.tags);

    /*
     * Note: for KD rendering the story passes width&height explicitly. this is to emulate plug vis behavior where
     * context sets/determines both and sends them down.
     */
    return () => {
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
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            featureFlags={settings}
                            config={gdcConfig}
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
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            configPanelClassName={DoNotRenderConfigPanel}
                            featureFlags={settings}
                            config={gdcConfig}
                            theme={effectiveTheme}
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
                            visualizationClass={visClass}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            configPanelClassName={DoNotRenderConfigPanel}
                            featureFlags={settings}
                            config={gdcConfig}
                            theme={effectiveTheme}
                        />
                    </div>

                    <div className="dashboard-like-4">
                        KD third size
                        <BaseVisualization
                            backend={backend}
                            projectId={testScenario.workspaceType}
                            environment="dashboards"
                            insight={insight}
                            width={400}
                            height={362}
                            visualizationClass={visClass}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            configPanelClassName={DoNotRenderConfigPanel}
                            featureFlags={settings}
                            config={gdcConfig}
                            theme={effectiveTheme}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        );
    };
}

ScenarioGroupsByVis.forEach((groups) => {
    /*
     * Sort groups; the order in which stories for the group are created is important as that is the order
     * in which the groups appear in storybook.
     */
    const sortedGroups = sortBy(groups, (g) => g.groupNames.join("/"));

    for (const group of sortedGroups) {
        const storiesForChart = storyGroupFor(PlugVizStories, group);
        const visualOnly: ScenarioGroup<any> = group.forTestTypes("visual");

        visualOnly.scenarioList.forEach((scenario) => {
            if (scenario.tags.includes("no-plug-viz-tests")) {
                // this scenario is forced to skip via tag
                return;
            }

            const insight = InsightById[scenario.insightId];

            if (!insight) {
                if (window.location.hostname === "localhost") {
                    console.warn(
                        `Ignoring test scenario for ${scenario.vis}: ${scenario.name} - insight does not exist.`,
                    );
                }

                return;
            }

            storiesForChart.add(scenario.name, plugVizStory(insight, scenario), {
                screenshot: {
                    clickSelector: `.${ConfigurationPanelWrapper.DefaultExpandAllClassName}`,
                    readySelector: `.${ScreenshotReadyWrapper.OnReadyClassName}`,
                    // give tables some more time to finish rendering
                    postInteractionWait: insightVisualizationUrl(insight).includes("table")
                        ? ShortPostInteractionTimeout
                        : 200,
                },
            });
        });
    }
});
