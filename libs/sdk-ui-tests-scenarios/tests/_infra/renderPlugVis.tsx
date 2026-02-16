// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";

import {
    type IInsight,
    type IInsightDefinition,
    type IVisualizationClass,
    insightVisualizationUrl,
    uriRef,
} from "@gooddata/sdk-model";
import {
    BaseVisualization,
    DEFAULT_LANGUAGE,
    DEFAULT_MESSAGES,
    FullVisualizationCatalog,
} from "@gooddata/sdk-ui-ext/internal";

import { type ChartInteractions, backendWithCapturing } from "./backendWithCapturing.js";
import { type IScenario } from "../../src/index.js";

function createVisualizationClass(insight: IInsightDefinition): IVisualizationClass {
    const visClassUri = insightVisualizationUrl(insight);

    return {
        visualizationClass: {
            identifier: visClassUri,
            uri: "test",
            url: visClassUri,
            title: visClassUri,
            icon: "none",
            iconSelected: "none",
            checksum: "",
        },
    };
}

/**
 * Mount insight representing a particular test scenario.
 *
 * @param scenario - test scenario which the insight represents
 * @param insight - insight definition
 * @param normalize - indicates whether execution normalization should take place
 */
export async function mountInsight(
    scenario: IScenario<any>,
    insight: IInsightDefinition,
    normalize: boolean = false,
): Promise<ChartInteractions> {
    const [backend, promisedInteractions] = backendWithCapturing(normalize, scenario.backendSettings);
    const persistedInsight: IInsight = {
        insight: {
            identifier: "test",
            uri: "test",
            ref: uriRef("test"),
            ...insight.insight,
        },
    };
    const visualizationClass = createVisualizationClass(insight);

    // Extract drillableItems from the test scenario props
    const drillableItems = scenario.props["drillableItems"];

    /*
     * Mapbox token flies in through IGdcConfig; some value is needed for mock-rendering of
     * the Geo charts
     */

    render(
        <BaseVisualization
            config={{ mapboxToken: "this-is-not-real-token" }}
            backend={backend}
            projectId={scenario.workspaceType}
            insight={persistedInsight}
            visualizationClass={visualizationClass}
            visualizationCatalog={FullVisualizationCatalog}
            onError={() => {}}
            pushData={() => {}}
            onLoadingChanged={() => {}}
            messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]}
            drillableItems={drillableItems}
        />,
    );

    return await promisedInteractions;
}
