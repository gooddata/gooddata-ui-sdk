// (C) 2019-2022 GoodData Corporation
import { invariant } from "ts-invariant";
import {
    ObjRef,
    KpiDrillDefinition,
    IKpiWidget,
    IKpiWidgetDefinition,
    isKpiWidgetDefinition,
    isKpiWidget,
    IKpi,
    IKpiComparisonDirection,
    IKpiComparisonTypeComparison,
} from "@gooddata/sdk-model";
import { IWidgetBaseBuilder, WidgetBaseBuilder } from "./widgetFactory.js";
import { resolveValueOrUpdateCallback, ValueOrUpdateCallback } from "../builder.js";

/**
 * Kpi widget builder
 *
 * @alpha
 */
export interface IKpiWidgetBuilder extends IWidgetBaseBuilder<IKpiWidget> {
    drills(valueOrUpdateCallback: ValueOrUpdateCallback<KpiDrillDefinition[]>): this;
    measure(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this;
    comparisonType(valueOrUpdateCallback: ValueOrUpdateCallback<IKpiComparisonTypeComparison>): this;
    comparisonDirection(
        valueOrUpdateCallback: ValueOrUpdateCallback<IKpiComparisonDirection | undefined>,
    ): this;
}

/**
 * @alpha
 */
export class KpiWidgetBuilder extends WidgetBaseBuilder<IKpiWidget> implements IKpiWidgetBuilder {
    constructor(protected item: IKpiWidget, protected validator?: (item: Partial<IKpiWidget>) => void) {
        super(item, validator);
    }

    public static for(kpiWidget: IKpiWidgetDefinition): KpiWidgetBuilder {
        invariant(
            isKpiWidgetDefinition(kpiWidget) || isKpiWidget(kpiWidget),
            "Provided data must be IKpiWidget or IKpiWidgetDefinition!",
        );

        return new KpiWidgetBuilder(kpiWidget as IKpiWidget);
    }

    public static forNew(measure: ObjRef): KpiWidgetBuilder {
        const emptyKpiWidget: IKpiWidgetDefinition = {
            description: "",
            drills: [],
            ignoreDashboardFilters: [],
            title: "",
            type: "kpi",
            kpi: {
                metric: measure,
                comparisonType: "none",
            },
        };
        return KpiWidgetBuilder.for(emptyKpiWidget as IKpiWidget);
    }

    // TODO: un-nest legacy kpi
    protected setKpiWidgetProp = <K extends keyof IKpi>(
        prop: K,
        valueOrUpdateCallback: ValueOrUpdateCallback<IKpiWidget["kpi"][K]>,
    ): this => {
        this.setWidget((w) => ({
            ...w,
            kpi: {
                ...w.kpi!,
                [prop]: resolveValueOrUpdateCallback(valueOrUpdateCallback, w.kpi![prop]),
            },
        }));
        return this;
    };

    public drills = (valueOrUpdateCallback: ValueOrUpdateCallback<KpiDrillDefinition[]>): this =>
        this.setWidgetProp("drills", valueOrUpdateCallback);

    public measure = (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this =>
        this.setKpiWidgetProp("metric", valueOrUpdateCallback);

    public comparisonType = (
        valueOrUpdateCallback: ValueOrUpdateCallback<IKpiComparisonTypeComparison>,
    ): this => this.setKpiWidgetProp("comparisonType", valueOrUpdateCallback);

    public comparisonDirection = (
        valueOrUpdateCallback: ValueOrUpdateCallback<IKpiComparisonDirection | undefined>,
    ): this => this.setKpiWidgetProp("comparisonDirection", valueOrUpdateCallback);
}

/**
 * @alpha
 */
export const newKpiWidget = (
    measure: ObjRef,
    modifications: (builder: KpiWidgetBuilder) => KpiWidgetBuilder,
): IKpiWidget => {
    return KpiWidgetBuilder.forNew(measure).modify(modifications).build();
};
