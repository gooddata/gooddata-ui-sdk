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
    widget: IInsightWidgetBase = {
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
        this.widget = {
            ...this.widget,
            insight: insightRef(insight),
            title: insightTitle(insight),
        };
    }

    withIgnoreDashboardFilters(ignoreDashboardFilters: IDashboardFilterReference[]) {
        this.widget = {
            ...this.widget,
            ignoreDashboardFilters,
        };
        return this;
    }

    withDrills(drills: InsightDrillDefinition[]) {
        this.widget = {
            ...this.widget,
            drills,
        };
        return this;
    }

    withTitle(title: string) {
        this.widget = {
            ...this.widget,
            title,
        };
        return this;
    }

    withDescription(description: string) {
        this.widget = {
            ...this.widget,
            description,
        };
        return this;
    }

    withConfiguration(configuration: IInsightWidgetConfiguration) {
        this.widget = {
            ...this.widget,
            configuration,
        };
        return this;
    }

    withProperties(properties: VisualizationProperties) {
        this.widget = {
            ...this.widget,
            properties,
        };
        return this;
    }

    build(): IInsightWidgetBase {
        return { ...this.widget };
    }
}
