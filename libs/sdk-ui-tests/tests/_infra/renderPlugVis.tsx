// (C) 2007-2020 GoodData Corporation

import {
    IInsight,
    IInsightDefinition,
    insightVisualizationUrl,
    IVisualizationClass,
    uriRef,
} from "@gooddata/sdk-model";
import { BaseVisualization, FullVisualizationCatalog } from "@gooddata/sdk-ui-ext/internal";
import { backendWithCapturing, ChartInteractions } from "./backendWithCapturing.js";
import { render } from "@testing-library/react";
import React from "react";
import { IScenario } from "../../src/index.js";
import noop from "lodash/noop.js";

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
    const [backend, promisedInteractions] = backendWithCapturing(normalize);
    const persistedInsight: IInsight = {
        insight: {
            identifier: "test",
            uri: "test",
            ref: uriRef("test"),
            ...insight.insight,
        },
    };
    const visualizationClass = createVisualizationClass(insight);

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
            onError={noop}
            pushData={noop}
            onLoadingChanged={noop}
        />,
    );

    return await promisedInteractions;
}
