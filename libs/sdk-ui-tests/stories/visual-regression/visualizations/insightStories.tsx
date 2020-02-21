// (C) 2007-2018 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend, RecordedBackendConfig, RecordingIndex } from "@gooddata/sdk-backend-mockingbird";
import { ISettings } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightDefinition,
    insightId,
    insightTitle,
    insightVisualizationUrl,
    IVisualizationClass,
} from "@gooddata/sdk-model";

import { BaseVisualization, FullVisualizationCatalog, IGdcConfig } from "@gooddata/sdk-ui-ext/dist/internal";

import "@gooddata/sdk-ui/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/pivotTable.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui-ext/styles/internal/css/dropdown_icons.css";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { PlugVizStories } from "../_infra/storyGroups";
import "./insightStories.css";
import { ScenarioTestInput, ScenarioTestMembers } from "../../../src";
import AllTestScenarioGroups from "../../../scenarios";
import {
    andResolver,
    createElementCountResolver,
    ScreenshotReadyWrapper,
} from "../_infra/ScreenshotReadyWrapper";
import { withScreenshot } from "../_infra/backstopWrapper";
import { ConfigurationPanelWrapper } from "../_infra/ConfigurationPanelWrapper";
import groupBy = require("lodash/groupBy");
import keyBy = require("lodash/keyBy");
import flatten = require("lodash/flatten");

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

const DefaultWorkspace = "testWorkspace";
const DefaultSettings: ISettings = {
    enableAxisNameConfiguration: true,
};

const DefaultBackendConfig: RecordedBackendConfig = {
    globalSettings: DefaultSettings,
};

const backend = recordedBackend(ReferenceRecordings.Recordings, DefaultBackendConfig);

//
// Inspect recording index & prepare list of Insights to possibly create stories for
//

function getAvailableInsights(recordings: RecordingIndex): IInsight[] {
    /*
     * getting list of insights for storybook must be a sync operation, thus have to access the
     * recording index directly when building storybook...
     */
    return Object.values(recordings.metadata?.insights ?? {}).map(rec => rec.obj);
}

const Insights = getAvailableInsights(ReferenceRecordings.Recordings);
const InsightsByVisUrl = Object.entries(groupBy(Insights, insightVisualizationUrl));

//
// Inspect test scenarios and key them by their corresponding insight ID
//

const AllTestScenarios: Array<ScenarioTestInput<any>> = flatten<ScenarioTestInput<any>>(
    AllTestScenarioGroups.map(g => g.forTestTypes("visual").asTestInput()),
);
const TestScenariosByInsightId = keyBy(AllTestScenarios, scenario => scenario[ScenarioTestMembers.InsightId]);

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

function createGdcConfig(testScenario: ScenarioTestInput<any>): IGdcConfig {
    const scenarioProps = testScenario[ScenarioTestMembers.PropsFactory](backend, DefaultWorkspace);

    return {
        colorPalette: scenarioProps.config?.colorPalette,
        separators: scenarioProps.config?.separators,
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

function plugVizStory(insight: IInsight, testScenario: ScenarioTestInput<any>) {
    const visClass = createVisualizationClass(insight);
    const gdcConfig = createGdcConfig(testScenario);

    return () => {
        return withScreenshot(
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
                            projectId={DefaultWorkspace}
                            insight={insight}
                            visualizationClass={visClass}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            featureFlags={DefaultSettings}
                            config={gdcConfig}
                        />
                    </div>

                    <div className="dashboard-like-12">
                        KD full size
                        <BaseVisualization
                            backend={backend}
                            projectId={DefaultWorkspace}
                            environment="dashboards"
                            insight={insight}
                            visualizationClass={visClass}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            configPanelClassName={DoNotRenderConfigPanel}
                            featureFlags={DefaultSettings}
                            config={gdcConfig}
                        />
                    </div>

                    <div className="dashboard-like-6">
                        KD half size
                        <BaseVisualization
                            backend={backend}
                            projectId={DefaultWorkspace}
                            environment="dashboards"
                            insight={insight}
                            visualizationClass={visClass}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            configPanelClassName={DoNotRenderConfigPanel}
                            featureFlags={DefaultSettings}
                            config={gdcConfig}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
            {
                clickSelector: `.${ConfigurationPanelWrapper.DefaultExpandAllClassName}`,
                readySelector: `.${ScreenshotReadyWrapper.OnReadyClassName}`,
                postInteractionWait: 200,
            },
        );
    };
}

InsightsByVisUrl.forEach(([visUrl, insights]) => {
    const plugVizStories = storiesOf(`${PlugVizStories}/${visUrl}`, module);

    insights.forEach((insight: IInsight) => {
        const testScenario = TestScenariosByInsightId[insightId(insight)];

        if (!testScenario) {
            // tslint:disable-next-line:no-console
            console.warn(
                `Ignoring insight ${insightId(insight)} (${insightTitle(
                    insight,
                )}})} as there is no test scenario defined for the insight with this ID. `,
            );

            // do nothing if insight does not correspond to test scenario
            return;
        }

        plugVizStories.add(insightTitle(insight), plugVizStory(insight, testScenario));
    });
});
