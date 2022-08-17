// (C) 2022 GoodData Corporation

import {
    DrillDefinition,
    IDashboardFilterReference,
    IInsight,
    IInsightWidgetConfiguration,
    insightRef,
    ObjRef,
    VisualizationProperties,
} from "@gooddata/sdk-model";

/**
 * @alpha
 */
export class InsightWidgetBuilder {
    insight: ObjRef;
    type: string = "insight";
    ignoredDashboardFilters: IDashboardFilterReference[] = [];
    drills: DrillDefinition[] = [];
    title: string = "";
    description: string = "";
    configuration: IInsightWidgetConfiguration = { hideTitle: false };
    properties: VisualizationProperties = {};

    constructor(insight: IInsight) {
        this.insight = insightRef(insight);
    }

    setIgnoredDashboardFilters(ignoredDashboardFilters: IDashboardFilterReference[]) {
        this.ignoredDashboardFilters = ignoredDashboardFilters;
        return this;
    }

    setDrills(drills: DrillDefinition[]) {
        this.drills = drills;
        return this;
    }

    setTitle(title: string) {
        this.title = title;
        return this;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setConfiguration(config: IInsightWidgetConfiguration) {
        this.configuration = config;
    }

    setProperties(props: VisualizationProperties) {
        this.properties = props;
    }

    build() {
        return { ...this };
    }
}
