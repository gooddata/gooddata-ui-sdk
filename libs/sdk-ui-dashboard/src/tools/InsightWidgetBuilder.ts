// (C) 2022 GoodData Corporation

import {
    IDashboardFilterReference,
    IInsight,
    IInsightWidgetBase,
    IInsightWidgetConfiguration,
    InsightDrillDefinition,
    insightRef,
    insightTitle,
    VisualizationProperties,
} from "@gooddata/sdk-model";

/**
 * Builder for a {@link @gooddata/sdk-model#IInsightWidgetBase} object.
 *
 * @remarks
 * The builder without any modifications returns a widget with all mandatory data. To apply
 * additional information use builder functions.
 *
 * @internal
 */
export class InsightWidgetBuilder {
    widget: { -readonly [K in keyof IInsightWidgetBase]: IInsightWidgetBase[K] } = {
        insight: { uri: "" },
        type: "insight",
        ignoreDashboardFilters: [],
        drills: [],
        title: "",
        description: "",
        configuration: { hideTitle: false },
        properties: {},
    };

    constructor(insight: IInsight) {
        this.widget.insight = insightRef(insight);
        this.widget.title = insightTitle(insight);
    }

    withIgnoreDashboardFilters(ignoreDashboardFilters: IDashboardFilterReference[]) {
        this.widget.ignoreDashboardFilters = ignoreDashboardFilters;
        return this;
    }

    withDrills(drills: InsightDrillDefinition[]) {
        this.widget.drills = drills;
        return this;
    }

    withTitle(title: string) {
        this.widget.title = title;
        return this;
    }

    withDescription(description: string) {
        this.widget.description = description;
        return this;
    }

    withConfiguration(configuration: IInsightWidgetConfiguration) {
        this.widget.configuration = configuration;
        return this;
    }

    withProperties(properties: VisualizationProperties) {
        this.widget.properties = properties;
        return this;
    }

    build(): IInsightWidgetBase {
        return { ...this.widget };
    }
}
