// (C) 2007-2018 GoodData Corporation
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedBackend, RecordedBackendConfig, RecordingIndex } from "@gooddata/sdk-backend-mockingbird";
import { ISettings } from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightDefinition,
    insightTitle,
    insightVisualizationUrl,
    IVisualizationClass,
} from "@gooddata/sdk-model";

import {
    BaseVisualization,
    ConfigPanelClassName,
    FullVisualizationCatalog,
} from "@gooddata/sdk-ui/dist/internal";

import "@gooddata/sdk-ui/styles/css/main.css";
import "@gooddata/sdk-ui/styles/css/pivotTable.css";
import "@gooddata/sdk-ui/styles/internal/css/config_panel.css";
import "@gooddata/sdk-ui/styles/internal/css/dropdown_icons.css";
import { action } from "@storybook/addon-actions";
import { storiesOf } from "@storybook/react";
import * as React from "react";
import { PlugVizStories } from "../_infra/storyGroups";
import "./insightStories.css";
import groupBy = require("lodash/groupBy");

const DefaultWorkspace = "testWorkspace";
const DefaultSettings: ISettings = {
    enableAxisNameConfiguration: true,
};
const DefaultBackendConfig: RecordedBackendConfig = {
    globalSettings: DefaultSettings,
};

const backend = recordedBackend(ReferenceRecordings.Recordings, DefaultBackendConfig);

function getAvailableInsights(recordings: RecordingIndex): IInsight[] {
    /*
     * getting list of insights for storybook must be a sync operation, thus have to access the
     * recording index directly when building storybook...
     */
    return Object.values(recordings.metadata?.insights ?? {}).map(rec => rec.obj);
}

const Insights = getAvailableInsights(ReferenceRecordings.Recordings);
const InsightsByVisUrl = Object.entries(groupBy(Insights, insightVisualizationUrl));

function createVisualizationClass(insight: IInsightDefinition): IVisualizationClass {
    const visClassUri = insightVisualizationUrl(insight);

    return {
        visualizationClass: {
            identifier: visClassUri,
            url: visClassUri,
            title: visClassUri,
            icon: "none",
            iconSelected: "none",
            checksum: "",
        },
    };
}

function plugVizStory(insight: IInsight) {
    /*
     * visualization classes are not that important in these stories (ideally, vis class would not
     * even be on the base vis props and everything comes from the insight).
     *
     * story gets around this by generating vis class on the fly.
     */

    return () => {
        return (
            <div className="plugviz-report">
                <h3>{insightTitle(insight)}</h3>
                <div className={ConfigPanelClassName} />
                <div className="render-variants">
                    <div className="ad-like-render">
                        AD
                        <BaseVisualization
                            backend={backend}
                            projectId={DefaultWorkspace}
                            insight={insight}
                            visualizationClass={createVisualizationClass(insight)}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            featureFlags={DefaultSettings}
                        />
                    </div>

                    <div className="dashboard-like-12">
                        KD full size
                        <BaseVisualization
                            backend={backend}
                            projectId={DefaultWorkspace}
                            environment="dashboards"
                            insight={insight}
                            visualizationClass={createVisualizationClass(insight)}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            featureFlags={DefaultSettings}
                        />
                    </div>

                    <div className="dashboard-like-6">
                        KD half size
                        <BaseVisualization
                            backend={backend}
                            projectId={DefaultWorkspace}
                            environment="dashboards"
                            insight={insight}
                            visualizationClass={createVisualizationClass(insight)}
                            visualizationCatalog={FullVisualizationCatalog}
                            onError={action("onError")}
                            pushData={action("pushData")}
                            onLoadingChanged={action("onLoadingChanged")}
                            featureFlags={DefaultSettings}
                        />
                    </div>
                </div>
            </div>
        );
    };
}

InsightsByVisUrl.forEach(([visUrl, insights]) => {
    const plugVizStories = storiesOf(`${PlugVizStories}/${visUrl}`, module);

    insights.forEach((insight: IInsight) => {
        plugVizStories.add(insightTitle(insight), plugVizStory(insight));
    });
});
