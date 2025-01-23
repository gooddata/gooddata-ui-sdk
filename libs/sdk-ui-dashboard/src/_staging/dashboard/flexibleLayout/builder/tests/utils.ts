// (C) 2019-2025 GoodData Corporation
import { DashboardLayoutBuilder } from "../layout.js";
import { DashboardLayoutSectionBuilder } from "../section.js";
import { DashboardLayoutItemBuilder } from "../item.js";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import { IDashboardLayoutSize } from "@gooddata/sdk-model";
import {
    IDashboardLayoutBuilder,
    IDashboardLayoutItemBuilder,
    IDashboardLayoutSectionBuilder,
} from "../interfaces.js";

export const defaultItemXlSize: IDashboardLayoutSize = { gridWidth: 12, heightAsRatio: 50 };

export const createValueOrUpdateCallbackTestCases = <TValue>(
    value: TValue,
): Array<[string, ValueOrUpdateCallback<TValue | undefined>]> => [
    ["by value", value],
    ["by callback", () => value],
    ["by undefined", undefined],
    ["by callback returning undefined", () => undefined],
];

export const createEmptyDashboardLayoutBuilder = (): IDashboardLayoutBuilder<any> =>
    DashboardLayoutBuilder.forNewLayout();

export const createEmptyDashboardLayoutSectionBuilder = (): IDashboardLayoutSectionBuilder<any> =>
    DashboardLayoutSectionBuilder.for(createEmptyDashboardLayoutBuilder().createSection(), 0);

export const createEmptyDashboardLayoutItemBuilder = (): IDashboardLayoutItemBuilder<any> =>
    DashboardLayoutItemBuilder.for(
        createEmptyDashboardLayoutSectionBuilder().createItem(defaultItemXlSize),
        0,
    );

export const widgetWithNestedLayout = {
    type: "IDashboardLayout",
    sections: [
        {
            type: "IDashboardLayoutSection",
            header: {},
            items: [
                {
                    type: "IDashboardLayoutItem",
                    widget: {
                        type: "insight",
                        insight: {
                            identifier: {
                                id: "5cd25094-6327-4c9c-bf33-ea640062f7e2",
                                type: "visualizationObject",
                            },
                        },
                        ignoreDashboardFilters: [],
                        drills: [],
                        title: "01",
                        description: "",
                        localIdentifier: "f6fc591e-0d9b-466d-a81b-d293a4ae401d",
                    },
                    size: {
                        xl: {
                            gridHeight: 8,
                            gridWidth: 2,
                        },
                    },
                },
            ],
        },
    ],
    configuration: {
        sections: {
            enableHeader: false,
        },
    },
    localIdentifier: "3aef8337-6f37-43ff-ae4b-dcad3f42a8fe",
};
