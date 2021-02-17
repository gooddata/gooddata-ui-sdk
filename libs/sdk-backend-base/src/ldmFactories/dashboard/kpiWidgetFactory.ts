// (C) 2019-2021 GoodData Corporation
import invariant from "ts-invariant";
import { ObjRef } from "@gooddata/sdk-model";
import {
    IKpiWidget,
    ValueOrUpdateCallback,
    KpiDrillDefinition,
    ILegacyKpiComparisonTypeComparison,
    ILegacyKpiComparisonDirection,
    resolveValueOrUpdateCallback,
    ILegacyKpi,
    isKpiWidgetDefinition,
    DrillDefinition,
} from "@gooddata/sdk-backend-spi";
import { IWidgetBaseBuilder, WidgetBaseBuilder } from "./factory";

/**
 * Kpi widget builder
 *
 * @alpha
 */
export interface IKpiWidgetBuilder extends IWidgetBaseBuilder<IKpiWidget> {
    drills(valueOrUpdateCallback: ValueOrUpdateCallback<KpiDrillDefinition[]>): this;
    measure(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this;
    comparisonType(valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonTypeComparison>): this;
    comparisonDirection(
        valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonDirection | undefined>,
    ): this;
}

/**
 * @alpha
 */
export class KpiWidgetBuilder extends WidgetBaseBuilder<IKpiWidget> implements IKpiWidgetBuilder {
    constructor(protected item: IKpiWidget, protected validator?: (item: Partial<IKpiWidget>) => void) {
        super(item, validator);
    }

    public static for(kpiWidget: Partial<IKpiWidget>): KpiWidgetBuilder {
        invariant(
            isKpiWidgetDefinition(kpiWidget),
            "Provided data must be IKpiWidget or IKpiWidgetDefinition!",
        );

        return new KpiWidgetBuilder(kpiWidget as IKpiWidget);
    }

    public static forNew(measure: ObjRef): KpiWidgetBuilder {
        const emptyKpiWidget: Partial<IKpiWidget> = {
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
        return KpiWidgetBuilder.for(emptyKpiWidget);
    }

    // TODO: un-nest legacy kpi
    protected setKpiWidgetProp = <K extends keyof ILegacyKpi>(
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
        this.setWidgetProp("drills", valueOrUpdateCallback as DrillDefinition[]);

    public measure = (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this =>
        this.setKpiWidgetProp("metric", valueOrUpdateCallback);

    public comparisonType = (
        valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonTypeComparison>,
    ): this => this.setKpiWidgetProp("comparisonType", valueOrUpdateCallback);

    public comparisonDirection = (
        valueOrUpdateCallback: ValueOrUpdateCallback<ILegacyKpiComparisonDirection | undefined>,
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
