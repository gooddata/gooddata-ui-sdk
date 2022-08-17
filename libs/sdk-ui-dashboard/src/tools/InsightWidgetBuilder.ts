// (C) 2022 GoodData Corporation

import {
    DrillDefinition,
    IDashboardFilterReference,
    IInsight,
    IInsightWidgetConfiguration,
    insightRef,
    insightTitle,
    ObjRef,
    VisualizationProperties,
} from "@gooddata/sdk-model";

/**
 * Builder for a {@link @gooddata/sdk-model#IDashboardWidget} object.
 *
 * @remarks
 * The builder without any modifications returns a widget with all mandatory data. To apply
 * additional information use builder functions.
 *
 * @internal
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
        this.title = insightTitle(insight);
    }

    withIgnoredDashboardFilters(ignoredDashboardFilters: IDashboardFilterReference[]) {
        this.ignoredDashboardFilters = ignoredDashboardFilters;
        return this;
    }

    withDrills(drills: DrillDefinition[]) {
        this.drills = drills;
        return this;
    }

    withTitle(title: string) {
        this.title = title;
        return this;
    }

    withDescription(description: string) {
        this.description = description;
        return this;
    }

    withConfiguration(config: IInsightWidgetConfiguration) {
        this.configuration = config;
        return this;
    }

    withProperties(props: VisualizationProperties) {
        this.properties = props;
        return this;
    }

    build() {
        return { ...this };
    }
}
