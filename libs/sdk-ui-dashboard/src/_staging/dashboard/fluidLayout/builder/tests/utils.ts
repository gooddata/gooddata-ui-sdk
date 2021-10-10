// (C) 2019-2021 GoodData Corporation
import { DashboardLayoutBuilder } from "../layout";
import { DashboardLayoutSectionBuilder } from "../section";
import { DashboardLayoutItemBuilder } from "../item";
import { ValueOrUpdateCallback } from "@gooddata/sdk-backend-base";
import { IDashboardLayoutSize } from "@gooddata/sdk-backend-spi";
import {
    IDashboardLayoutBuilder,
    IDashboardLayoutItemBuilder,
    IDashboardLayoutSectionBuilder,
} from "../interfaces";

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
    DashboardLayoutSectionBuilder.for(createEmptyDashboardLayoutBuilder().addSection(), 0);

export const createEmptyDashboardLayoutItemBuilder = (): IDashboardLayoutItemBuilder<any> =>
    DashboardLayoutItemBuilder.for(createEmptyDashboardLayoutSectionBuilder().addItem(defaultItemXlSize), 0);
