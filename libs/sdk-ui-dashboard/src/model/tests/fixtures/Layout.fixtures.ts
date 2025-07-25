// (C) 2021-2025 GoodData Corporation
import {
    idRef,
    IInsight,
    insightId,
    isObjRef,
    ObjRef,
    IKpiWidget,
    IKpiWidgetDefinition,
    IInsightWidget,
    IInsightWidgetDefinition,
    IDashboardLayoutSectionHeader,
    IDashboardLayoutItem,
    IRichTextWidget,
    IdentifierRef,
    IVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import { PivotTableWithRowAndColumnAttributes } from "./Insights.fixtures.js";
import {
    InsightPlaceholderWidget,
    KpiPlaceholderWidget,
    newInsightPlaceholderWidget,
    newKpiPlaceholderWidget,
} from "../../../widgets/index.js";

export const TestSectionHeader: IDashboardLayoutSectionHeader = {
    title: "Test Section",
    description: "Section added for test purposes",
};

const TestKpiPlaceholderWidget = newKpiPlaceholderWidget();
export const TestKpiPlaceholderItem: IDashboardLayoutItem<KpiPlaceholderWidget> = {
    type: "IDashboardLayoutItem",
    widget: TestKpiPlaceholderWidget,
    size: {
        xl: {
            gridWidth: 2,
        },
    },
};

const TestInsightPlaceholderWidget = newInsightPlaceholderWidget();
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

export const TestRichTextItem: IDashboardLayoutItem<IRichTextWidget> = createTestRichTextItem(
    idRef("richTextWidgetRef"),
);

export function createTestRichTextItem(ref: IdentifierRef): IDashboardLayoutItem<IRichTextWidget> {
    return {
        type: "IDashboardLayoutItem",
        widget: {
            type: "richText",
            ref,
            content: "",
            ignoreDashboardFilters: [],
            drills: [],
            title: "Test Rich Text Item",
            description: "",
            identifier: ref.identifier,
            uri: `/${ref.identifier}`,
        },
        size: {
            xl: {
                gridWidth: 6,
            },
        },
    };
}

export const TestVisualizationSwitcherItem: IDashboardLayoutItem<IVisualizationSwitcherWidget> =
    createTestVisualizationSwitcherItem(idRef("visualizationSwitcherWidgetRef"));

export function createTestVisualizationSwitcherItem(
    ref: IdentifierRef,
): IDashboardLayoutItem<IVisualizationSwitcherWidget> {
    return {
        type: "IDashboardLayoutItem",
        widget: {
            type: "visualizationSwitcher",
            ref,
            visualizations: [],
            ignoreDashboardFilters: [],
            drills: [],
            title: "Visualization Switcher Text Item",
            description: "",
            identifier: ref.identifier,
            uri: `/${ref.identifier}`,
        },
        size: {
            xl: {
                gridWidth: 6,
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
