// (C) 2019-2022 GoodData Corporation
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
