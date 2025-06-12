// (C) 2022-2023 GoodData Corporation

import {
    IDashboardFilterReference,
    IInsight,
    IInsightWidgetBase,
    IInsightWidgetConfiguration,
    InsightDrillDefinition,
    insightRef,
    insightTitle,
    uriRef,
    ObjRef,
    VisualizationProperties,
} from "@gooddata/sdk-model";
import identity from "lodash/identity.js";

/**
 * @internal
 */
export type InsightWidgetModifications = (builder: InsightWidgetBuilder) => InsightWidgetBuilder;

/**
 * Creates a new insightWidget with specified identifier and title and with optional modifications.
 *
 * @param insight - the insight object to create widget for.
 * @param modifications - optional modifications
 *
 * @internal
 */
export function newInsightWidget(insight: IInsight, modifications: InsightWidgetModifications = identity) {
    const ref = insightRef(insight);
    const title = insightTitle(insight);
    const builder = new InsightWidgetBuilder(ref, title);

    return modifications(builder).build();
}

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
        insight: uriRef(""),
        type: "insight",
        ignoreDashboardFilters: [],
        drills: [],
        title: "",
        description: "",
    };

    constructor(insightRef: ObjRef, title: string) {
        this.widget.insight = insightRef;
        this.widget.title = title;
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
