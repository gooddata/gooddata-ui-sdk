// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { ObjRef, objRefToString } from "@gooddata/sdk-model";
import invariant from "ts-invariant";
import { DashboardState } from "../types";
import { LayoutState } from "./layoutState";
import {
    IDashboardLayout,
    IDashboardLayoutItem,
    isInsightWidget,
    isKpiWidget,
    IWidget,
} from "@gooddata/sdk-backend-spi";
import { ExtendedDashboardWidget, isCustomWidget } from "../../types/layoutTypes";
import { createUndoableCommandsMapping } from "../_infra/undoEnhancer";
import { newMapForObjectWithIdentity } from "../../../_staging/metadata/objRefMap";
import { selectFilterContextFilters } from "../filterContext/filterContextSelectors";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../converters";
import { createMemoizedSelector } from "../_infra/selectors";
import isEmpty from "lodash/isEmpty";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.layout,
);

/**
 * This selector returns current layout's stash. This stash can contain items that were removed from the layout with the
 * intent of further using the item elsewhere on the layout. The stash is a mapping of stashIdentifier to an array
 * of stashed items. The stash identifiers and stash usage is fully under control of the user.
 *
 * @internal
 */
export const selectStash = createSelector(selectSelf, (layoutState: LayoutState) => {
    return layoutState.stash;
});

/**
 * This selector returns commands that impacted the layout and can now be undone.
 *
 * @internal
 */
export const selectUndoableLayoutCommands = createSelector(selectSelf, (layoutState: LayoutState) => {
    return createUndoableCommandsMapping(layoutState);
});

/**
 * This selector returns dashboard's layout. It is expected that the selector is called only after the layout state
 * is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectLayout = createSelector(selectSelf, (layoutState: LayoutState) => {
    invariant(layoutState.layout, "attempting to access uninitialized layout state");

    return layoutState.layout;
});

function isItemWithBaseWidget(
    obj: IDashboardLayoutItem<ExtendedDashboardWidget>,
): obj is IDashboardLayoutItem<IWidget> {
    const widget = obj.widget;

    return isInsightWidget(widget) || isKpiWidget(widget);
}

/**
 * This selector returns the basic dashboard layout that does not contain any client-side extensions.
 *
 * This selector exists because analytical backend impls are not yet ready to handle persistence of custom
 * widgets (that may have arbitrary payloads). The selector is used only in save and saveAs command handlers,
 * where it obtains the layout without any custom widgets and persists that. Note that the save/saveAs
 * handlers will not wipe the custom widgets from the state during the save - so at this point the custom
 * widgets are treated as client-side extensions.
 *
 * Note: this selector also intentionally removes empty sections; dashboard cannot cope with them and
 * they may readily appear if user adds section full of custom widgets and then does saveAs; such sections
 * would end up empty.
 *
 * @internal
 */
export const selectBasicLayout = createSelector(selectLayout, (layout) => {
    const dashboardLayout: IDashboardLayout<IWidget> = {
        ...layout,
        sections: layout.sections
            .map((section) => {
                return {
                    ...section,
                    items: section.items.filter(isItemWithBaseWidget),
                };
            })
            .filter((section) => !isEmpty(section.items)),
    };

    return dashboardLayout;
});

/**
 * Selects dashboard widgets in an obj ref an array. This map will include both analytical and custom
 * widgets that are placed on the dashboard.
 *
 * @internal
 */
export const selectWidgets = createSelector(selectLayout, (layout) => {
    const items: ExtendedDashboardWidget[] = [];

    for (const section of layout.sections) {
        for (const item of section.items) {
            if (!item.widget) {
                continue;
            }

            items.push(item.widget);
        }
    }

    return items;
});

/**
 * Selects dashboard widgets in an obj ref to widget map. This map will include both analytical and custom
 * widgets that are placed on the dashboard.
 *
 * @internal
 */
export const selectWidgetsMap = createSelector(selectWidgets, (widgets) => {
    return newMapForObjectWithIdentity(widgets);
});

/**
 * Selects widget by its ref (including custom widgets).
 *
 * @remarks
 * To limit the scope only to analytical widgets, use {@link selectAnalyticalWidgetByRef}.
 *
 * @alpha
 */
export const selectWidgetByRef = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectWidgetsMap, (widgetMap): ExtendedDashboardWidget | undefined => {
        if (!ref) {
            return undefined;
        }

        return widgetMap.get(ref);
    }),
);

/**
 * Selects analytical widget by its ref. This selector will return undefined if the provided
 * widget ref is for a custom widget.
 *
 * @remarks
 * To include custom widgets as well, use {@link selectWidgetByRef}.
 *
 * @alpha
 */
export const selectAnalyticalWidgetByRef = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectWidgetsMap, (widgetMap): IWidget | undefined => {
        if (!ref) {
            return undefined;
        }

        const widget = widgetMap.get(ref);

        if (!widget || isCustomWidget(widget)) {
            return undefined;
        }

        return widget;
    }),
);

/**
 * Selects widget drills by the widget ref.
 *
 * @alpha
 */
export const selectWidgetDrills = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectAnalyticalWidgetByRef(ref), (widget) => widget?.drills ?? []),
);

/**
 * Selects all filters from filter context converted to filters specific for a widget specified by a ref.
 *
 * @remarks
 * This does NOT resolve things like ignored filters for a widget, etc.
 *
 * @internal
 */
export const selectAllFiltersForWidgetByRef = createMemoizedSelector((ref: ObjRef) => {
    return createSelector(selectWidgetByRef(ref), selectFilterContextFilters, (widget, dashboardFilters) => {
        invariant(widget, `widget with ref ${objRefToString(ref)} does not exist in the state`);
        return filterContextItemsToDashboardFiltersByWidget(dashboardFilters, widget);
    });
});

const selectAllWidgets = createSelector(selectWidgetsMap, (widgetMap) => {
    return Array.from(widgetMap.values());
});

/**
 * Selects a boolean indicating if the dashboard is empty.
 *
 * @alpha
 */
export const selectIsLayoutEmpty = createSelector(selectAllWidgets, (allWidgets) => {
    return allWidgets.length === 0;
});

/**
 * Selects all KPI widgets in the layout.
 *
 * @alpha
 */
export const selectAllKpiWidgets = createSelector(selectAllWidgets, (allWidgets) => {
    return allWidgets.filter(isKpiWidget);
});

/**
 * Selects all insight widgets in the layout.
 *
 * @alpha
 */
export const selectAllInsightWidgets = createSelector(selectAllWidgets, (allWidgets) => {
    return allWidgets.filter(isInsightWidget);
});

/**
 * Selects all custom widgets in the layout.
 *
 * @alpha
 */
export const selectAllCustomWidgets = createSelector(selectAllWidgets, (allWidgets) => {
    return allWidgets.filter(isCustomWidget);
});
