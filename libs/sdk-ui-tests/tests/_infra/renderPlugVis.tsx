// (C) 2007-2020 GoodData Corporation

import {
    IInsight,
    IInsightDefinition,
    insightVisualizationUrl,
    IVisualizationClass,
} from "@gooddata/sdk-model";
import { FullVisualizationCatalog, BaseVisualization } from "@gooddata/sdk-ui-ext/dist/internal";
import { backendWithCapturing, ChartInteractions } from "./backendWithCapturing";
import { mount, ReactWrapper } from "enzyme";
import noop = require("lodash/noop");
import React from "react";

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

class PlugVisRendererUsingEnzyme {
    public result: ReactWrapper | undefined;

    public renderFun(component: any, _: Element): void {
        this.result = mount(component);
    }
}

export async function mountInsight(insight: IInsightDefinition): Promise<ChartInteractions> {
    const [backend, promisedInteractions] = backendWithCapturing();
    const persistedInsight: IInsight = {
        insight: {
            identifier: "test",
            uri: "test",
            ...insight.insight,
        },
    };
    const visualizationClass = createVisualizationClass(insight);
    const enzymeRenderer = new PlugVisRendererUsingEnzyme();

    mount(
        <BaseVisualization
            backend={backend}
            projectId="testWorkspace"
            insight={persistedInsight}
            visualizationClass={visualizationClass}
            visualizationCatalog={FullVisualizationCatalog}
            onError={noop}
            pushData={noop}
            onLoadingChanged={noop}
            renderer={enzymeRenderer.renderFun}
        />,
    );
    const interactions = await promisedInteractions;

    interactions.effectiveProps = enzymeRenderer.result?.props();

    return interactions;
}
