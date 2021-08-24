// (C) 2021 GoodData Corporation
import { InsightPlaceholderWidget, KpiPlaceholderWidget } from "../../types/layoutTypes";
import {
    IDashboardLayoutItem,
    IDashboardLayoutSectionHeader,
    IInsightWidget,
    IKpiWidget,
} from "@gooddata/sdk-backend-spi";
import { idRef, IInsight, insightId, isObjRef, ObjRef } from "@gooddata/sdk-model";
import { PivotTableWithRowAndColumnAttributes } from "./Insights.fixtures";

export const TestSectionHeader: IDashboardLayoutSectionHeader = {
    title: "Test Section",
    description: "Section added for test purposes",
};
export const TestKpiPlaceholderWidget: KpiPlaceholderWidget = {
    type: "kpiPlaceholder",
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
export const TestInsightPlaceholderWidget: InsightPlaceholderWidget = {
    type: "insightPlaceholder",
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
export const TestInsightItem: IDashboardLayoutItem<IInsightWidget> = createTestInsightItem(
    PivotTableWithRowAndColumnAttributes,
);

export function createTestInsightItem(
    insightOrInsightRef: IInsight | ObjRef,
): IDashboardLayoutItem<IInsightWidget> {
    const insightRef = isObjRef(insightOrInsightRef)
        ? insightOrInsightRef
        : idRef(insightId(insightOrInsightRef), "insight");

    return {
        type: "IDashboardLayoutItem",
        widget: {
            type: "insight",
            insight: insightRef,
            ref: idRef("newWidget"),
            uri: "newWidgetUri",
            identifier: "newWidgetIdentifier",
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

export function testItemWithDateDataset<T extends IInsightWidget | IKpiWidget>(
    item: IDashboardLayoutItem<T>,
    dataset: ObjRef,
): IDashboardLayoutItem<T> {
    return {
        ...item,
        widget: {
            ...item.widget,
            dateDataSet: dataset,
        },
    } as IDashboardLayoutItem<T>;
}

export function testItemWithFilterIgnoreList<T extends IInsightWidget | IKpiWidget>(
    item: IDashboardLayoutItem<T>,
    displayForms: ObjRef[],
): IDashboardLayoutItem<T> {
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
