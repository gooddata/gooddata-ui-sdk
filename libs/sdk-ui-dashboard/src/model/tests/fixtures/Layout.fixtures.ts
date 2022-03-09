// (C) 2021 GoodData Corporation
import {
    IDashboardLayoutItem,
    IDashboardLayoutSectionHeader,
    IInsightWidget,
    IInsightWidgetDefinition,
    IKpiWidget,
    IKpiWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import { idRef, IInsight, insightId, isObjRef, ObjRef } from "@gooddata/sdk-model";
import { PivotTableWithRowAndColumnAttributes } from "./Insights.fixtures";
import { InsightPlaceholderWidget, KpiPlaceholderWidget } from "../../../widgets/placeholders/types";

export const TestSectionHeader: IDashboardLayoutSectionHeader = {
    title: "Test Section",
    description: "Section added for test purposes",
};

const TestKpiPlaceholderWidget: KpiPlaceholderWidget = {
    type: "customWidget",
    customType: "kpiPlaceholder",
};
export const TestKpiPlaceholderItem: IDashboardLayoutItem<KpiPlaceholderWidget> = {
    type: "IDashboardLayoutItem",
    widget: TestKpiPlaceholderWidget,
    size: {
        xl: {
            gridWidth: 2,
        },
    },
};

const TestInsightPlaceholderWidget: InsightPlaceholderWidget = {
    type: "customWidget",
    customType: "insightPlaceholder",
};
export const TestInsightPlaceholderItem: IDashboardLayoutItem<InsightPlaceholderWidget> = {
    type: "IDashboardLayoutItem",
    widget: TestInsightPlaceholderWidget,
    size: {
        xl: {
            gridWidth: 2,
        },
    },
};
export const TestInsightItem: IDashboardLayoutItem<IInsightWidgetDefinition> = createTestInsightItem(
    PivotTableWithRowAndColumnAttributes,
);

export function createTestInsightItem(
    insightOrInsightRef: IInsight | ObjRef,
): IDashboardLayoutItem<IInsightWidgetDefinition> {
    const insightRef = isObjRef(insightOrInsightRef)
        ? insightOrInsightRef
        : idRef(insightId(insightOrInsightRef), "insight");

    return {
        type: "IDashboardLayoutItem",
        widget: {
            type: "insight",
            insight: insightRef,
            ignoreDashboardFilters: [],
            drills: [],
            title: "Test Insight Item",
            description: "",
        },
        size: {
            xl: {
                gridWidth: 2,
            },
        },
    };
}

export function testItemWithDateDataset<
    T extends IInsightWidget | IKpiWidget | IInsightWidgetDefinition | IKpiWidgetDefinition,
>(item: IDashboardLayoutItem<T>, dataset: ObjRef): IDashboardLayoutItem<T> {
    return {
        ...item,
        widget: {
            ...item.widget,
            dateDataSet: dataset,
        },
    } as IDashboardLayoutItem<T>;
}

export function testItemWithFilterIgnoreList<
    T extends IInsightWidget | IKpiWidget | IInsightWidgetDefinition | IKpiWidgetDefinition,
>(item: IDashboardLayoutItem<T>, displayForms: ObjRef[]): IDashboardLayoutItem<T> {
    return {
        ...item,
        widget: {
            ...item.widget,
            ignoreDashboardFilters: displayForms.map((displayForm) => ({
                type: "attributeFilterReference",
                displayForm,
            })),
        },
    } as IDashboardLayoutItem<T>;
}
