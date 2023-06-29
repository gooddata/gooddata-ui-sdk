// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import {
    ObjRef,
    VisualizationProperties,
    InsightDrillDefinition,
    IInsightWidget,
    IInsightWidgetDefinition,
    isInsightWidgetDefinition,
    isInsightWidget,
} from "@gooddata/sdk-model";
import { IWidgetBaseBuilder, WidgetBaseBuilder } from "./widgetFactory.js";
import { ValueOrUpdateCallback } from "../builder.js";

/**
 * Insight widget builder
 *
 * @alpha
 */
export interface IInsightWidgetBuilder extends IWidgetBaseBuilder<IInsightWidget> {
    drills(valueOrUpdateCallback: ValueOrUpdateCallback<InsightDrillDefinition[]>): this;
    insight(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this;
    properties(valueOrUpdateCallback: ValueOrUpdateCallback<VisualizationProperties | undefined>): this;
}

/**
 * @alpha
 */
export class InsightWidgetBuilder extends WidgetBaseBuilder<IInsightWidget> implements IInsightWidgetBuilder {
    constructor(
        protected item: IInsightWidget,
        protected validator?: (item: Partial<IInsightWidget>) => void,
    ) {
        super(item, validator);
    }

    public static for(insightWidget: IInsightWidgetDefinition): InsightWidgetBuilder {
        invariant(
            isInsightWidgetDefinition(insightWidget) || isInsightWidget(insightWidget),
            "Provided data must be IInsightWidget or IInsightWidgetDefinition!",
        );

        return new InsightWidgetBuilder(insightWidget as IInsightWidget);
    }

    public static forNew(insight: ObjRef): InsightWidgetBuilder {
        const emptyInsightWidget: IInsightWidgetDefinition = {
            description: "",
            drills: [],
            ignoreDashboardFilters: [],
            title: "",
            type: "insight",
            insight,
        };
        return InsightWidgetBuilder.for(emptyInsightWidget);
    }

    public drills = (valueOrUpdateCallback: ValueOrUpdateCallback<InsightDrillDefinition[]>): this =>
        this.setWidgetProp("drills", valueOrUpdateCallback);

    public insight = (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this =>
        this.setWidgetProp("insight", valueOrUpdateCallback);

    public properties = (
        valueOrUpdateCallback: ValueOrUpdateCallback<VisualizationProperties | undefined>,
    ): this => this.setWidgetProp("properties", valueOrUpdateCallback);
}

/**
 * @alpha
 */
export const newInsightWidget = (
    insight: ObjRef,
    modifications: (builder: InsightWidgetBuilder) => InsightWidgetBuilder,
): IInsightWidget => {
    return InsightWidgetBuilder.forNew(insight).modify(modifications).build();
};
