// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import { LayoutState } from "./layoutState";
import invariant from "ts-invariant";
import { IDashboardLayout, IDashboardLayoutItem } from "@gooddata/sdk-backend-spi";
import { isInsightPlaceholderWidget, isKpiPlaceholderWidget } from "../../types/layoutTypes";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.layout,
);

/**
 * This selector returns dashboard's layout. It is expected that the selector is called only after the layout state
 * is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @internal
 */
export const selectLayout = createSelector(selectSelf, (layoutState: LayoutState) => {
    invariant(layoutState.layout, "attempting to access uninitialized layout state");

    return layoutState.layout;
});

function isItemWithBaseWidget(obj: IDashboardLayoutItem<unknown>): obj is IDashboardLayoutItem {
    const widget = obj.widget;
    return !isKpiPlaceholderWidget(widget) && !isInsightPlaceholderWidget(widget);
}

/**
 * This selector returns the basic dashboard layout that does not contain any client-side extensions.
 *
 * TODO: we need to get to a point where this selector is not needed. the layout component needs to recognize that the
 *  layout may contain client-side customizations. Furthermore, the dashboard saving should be enhanced so that the
 *  client-side customization can also be persisted.
 *
 * @internal
 */
export const selectBasicLayout = createSelector(selectLayout, (layout) => {
    const dashboardLayout: IDashboardLayout = {
        ...layout,
        sections: layout.sections.map((section) => {
            return {
                ...section,
                items: section.items.filter(isItemWithBaseWidget),
            };
        }),
    };

    return dashboardLayout;
});
