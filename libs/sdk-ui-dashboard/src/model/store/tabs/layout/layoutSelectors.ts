// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { isEmpty, partition } from "lodash-es";
import { invariant } from "ts-invariant";

import {
    DrillDefinition,
    IDashboardLayout,
    IDrillDownReference,
    IDrillToLegacyDashboard,
    IInsightWidget,
    IKpiWidget,
    IWidget,
    InsightDrillDefinition,
    ObjRef,
    ScreenSize,
    isDashboardAttributeFilter,
    isDashboardCommonDateFilter,
    isDashboardLayout,
    isInsightWidget,
    isKpiWidget,
    isVisualizationSwitcherWidget,
    objRefToString,
} from "@gooddata/sdk-model";

import { LayoutStash, LayoutState, layoutInitialState } from "./layoutState.js";
import { ObjRefMap, newMapForObjectWithIdentity } from "../../../../_staging/metadata/objRefMap.js";
import { filterContextItemsToDashboardFiltersByWidget } from "../../../../converters/index.js";
import { IDashboardFilter, ILayoutCoordinates, ILayoutItemPath } from "../../../../types.js";
import {
    isInsightPlaceholderWidget,
    isKpiPlaceholderWidget,
    isPlaceholderWidget,
} from "../../../../widgets/index.js";
import { DashboardLayoutCommands } from "../../../commands/index.js";
import {
    ExtendedDashboardWidget,
    ICustomWidget,
    isCustomWidget,
    isExtendedDashboardLayoutWidget,
} from "../../../types/layoutTypes.js";
import { createMemoizedSelector } from "../../_infra/selectors.js";
import { UndoableCommand, createUndoableCommandsMapping } from "../../_infra/undoEnhancer.js";
import { selectEnableIgnoreCrossFiltering } from "../../config/configSelectors.js";
import {
    selectCrossFilteringFiltersLocalIdentifiers,
    selectCrossFilteringFiltersLocalIdentifiersByWidgetRef,
} from "../../drill/drillSelectors.js";
import { getWidgetCoordinates, isItemWithBaseWidget } from "../../tabs/layout/layoutUtils.js";
import { DashboardSelector } from "../../types.js";
import { selectFilterContextFilters } from "../filterContext/filterContextSelectors.js";
import { DEFAULT_TAB_ID } from "../index.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../tabsSelectors.js";

const selectSelf = createSelector(selectTabs, selectActiveTabLocalIdentifier, (tabs, activeTabId) => {
    if (!tabs || !activeTabId) {
        return layoutInitialState;
    }
    const activeTab = tabs.find((tab) => tab.localIdentifier === activeTabId);

    return activeTab?.layout ?? layoutInitialState;
});

const selectTabsArray = createSelector(selectTabs, (tabs) => [...(tabs ?? [])]);

/**
 * Returns layout keyed by tab identifier.
 *
 * @internal
 */
export const selectLayoutByTab: DashboardSelector<
    Record<string, IDashboardLayout<ExtendedDashboardWidget> | undefined>
> = createSelector(selectTabsArray, (tabs) => {
    if (!tabs.length) {
        return {};
    }

    return tabs.reduce<Record<string, IDashboardLayout<ExtendedDashboardWidget> | undefined>>((acc, tab) => {
        const identifier = tab.localIdentifier ?? DEFAULT_TAB_ID;
        acc[identifier] = tab.layout?.layout ?? undefined;
        return acc;
    }, {});
});

/**
 * This selector returns current layout's stash. This stash can contain items that were removed from the layout with the
 * intent of further using the item elsewhere on the layout. The stash is a mapping of stashIdentifier to an array
 * of stashed items. The stash identifiers and stash usage is fully under control of the user.
 *
 * @internal
 */
export const selectStash: DashboardSelector<LayoutStash> = createSelector(
    selectSelf,
    (layoutState: LayoutState) => {
        return layoutState.stash;
    },
);

/**
 * This selector returns commands that impacted the layout and can now be undone.
 *
 * @internal
 */
export const selectUndoableLayoutCommands: DashboardSelector<UndoableCommand<DashboardLayoutCommands>[]> =
    createSelector(selectSelf, (layoutState: LayoutState) => {
        return createUndoableCommandsMapping(layoutState);
    });

/**
 * This selector returns dashboard's layout. It is expected that the selector is called only after the layout state
 * is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectLayout: DashboardSelector<IDashboardLayout<ExtendedDashboardWidget>> = createSelector(
    selectSelf,
    (layoutState: LayoutState) => {
        invariant(layoutState.layout, "attempting to access uninitialized layout state");

        return layoutState.layout;
    },
);

/**
 * This selector returns dashboard's current layout screen size. Valid screen size is provided after first render.
 *
 * @public
 */
export const selectScreen: DashboardSelector<ScreenSize | undefined> = createSelector(
    selectSelf,
    (layoutState: LayoutState) => {
        return layoutState.screen;
    },
);

const filterOutCustomWidgets = (layout: IDashboardLayout<ExtendedDashboardWidget>) => {
    const dashboardLayout: IDashboardLayout<IWidget> = {
        ...layout,
        sections: layout.sections
            .map((section) => {
                return {
                    ...section,
                    items: section.items.filter(isItemWithBaseWidget).map((item) => {
                        if (item.widget && isExtendedDashboardLayoutWidget(item.widget)) {
                            const filteredLayout = filterOutCustomWidgets(item.widget);
                            const widget: IWidget = item.widget;
                            return {
                                ...item,
                                widget: {
                                    ...widget,
                                    sections: filteredLayout.sections,
                                },
                            };
                        }
                        return item;
                    }),
                };
            })
            .filter((section) => !isEmpty(section.items)),
    };

    return dashboardLayout;
};

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
export const selectBasicLayout: DashboardSelector<IDashboardLayout<IWidget>> = createSelector(
    selectLayout,
    filterOutCustomWidgets,
);

/**
 * Selects dashboard widgets in an obj ref an array. This map will include both analytical and custom
 * widgets that are placed on the dashboard and also all widgets from visualization switchers
 *
 * @internal
 */
const getLayoutWidgets = (layout: IDashboardLayout<ExtendedDashboardWidget>) => {
    const items: ExtendedDashboardWidget[] = [];

    for (const section of layout.sections) {
        for (const item of section.items) {
            if (!item.widget) {
                continue;
            }
            if (isDashboardLayout(item.widget)) {
                items.push(item.widget);
                items.push(...getLayoutWidgets(item.widget));
            } else {
                items.push(item.widget);
                if (isVisualizationSwitcherWidget(item.widget)) {
                    items.push(...item.widget.visualizations);
                }
            }
        }
    }
    return items;
};
/**
 * Selects dashboard widgets in an obj ref an array. This map will include both analytical and custom
 * widgets that are placed on the dashboard and also all widgets from visualization switchers
 *
 * @internal
 */
export const selectWidgets: DashboardSelector<ExtendedDashboardWidget[]> = createSelector(
    selectLayout,
    getLayoutWidgets, // process layout recursively
);

/**
 * Selects dashboard widgets in an obj ref to widget map. This map will include both analytical and custom
 * widgets that are placed on the dashboard.
 *
 * @internal
 */
export const selectWidgetsMap: DashboardSelector<ObjRefMap<ExtendedDashboardWidget>> = createSelector(
    selectWidgets,
    (widgets) => {
        return newMapForObjectWithIdentity(widgets);
    },
);

/**
 * Selects widget by its ref (including custom widgets).
 *
 * @remarks
 * To limit the scope only to analytical widgets, use {@link selectAnalyticalWidgetByRef}.
 *
 * @alpha
 */
export const selectWidgetByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<ExtendedDashboardWidget | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) =>
        createSelector(selectWidgetsMap, (widgetMap): ExtendedDashboardWidget | undefined => {
            if (!ref) {
                return undefined;
            }

            return widgetMap.get(ref);
        }),
);

/**
 * Selects filterable widget by its ref (including custom widgets).
 * This selector will return undefined if the provided ref to non-filterable widget.
 *
 * @remarks
 * To limit the scope only to analytical widgets, use {@link selectAnalyticalWidgetByRef}.
 *
 * @alpha
 */
export const selectFilterableWidgetByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IWidget | ICustomWidget | undefined> = createMemoizedSelector(
    (ref: ObjRef | undefined) =>
        createSelector(selectWidgetsMap, (widgetMap): IWidget | ICustomWidget | undefined => {
            if (!ref) {
                return undefined;
            }
            const widget = widgetMap.get(ref);
            if (!widget || isExtendedDashboardLayoutWidget(widget)) {
                return undefined;
            }
            return widget;
        }),
);

/**
 * Selects analytical widget by its ref. This selector will return undefined if the provided
 * widget ref is not analytical widget, eg. custom widget or nested layout.
 *
 * @remarks
 * To include custom widgets as well, use {@link selectWidgetByRef}.
 *
 * @alpha
 */
export const selectAnalyticalWidgetByRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<IWidget | undefined> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectWidgetsMap, (widgetMap): IWidget | undefined => {
        if (!ref) {
            return undefined;
        }

        const widget = widgetMap.get(ref);

        if (!widget || isCustomWidget(widget) || isExtendedDashboardLayoutWidget(widget)) {
            return undefined;
        }

        return widget;
    }),
);

/**
 * @alpha
 */
export const selectIgnoredDrillDownHierarchiesByWidgetRef: (
    ref: ObjRef,
) => DashboardSelector<IDrillDownReference[]> = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectAnalyticalWidgetByRef(ref), (widget) => widget?.ignoredDrillDownHierarchies ?? []),
);

/**
 * Selects widget drills by the widget ref.
 *
 * @alpha
 */
export const selectWidgetDrills: (
    ref: ObjRef | undefined,
) => DashboardSelector<IDrillToLegacyDashboard[] | InsightDrillDefinition[] | DrillDefinition[]> =
    createMemoizedSelector((ref: ObjRef | undefined) =>
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
export const selectAllFiltersForWidgetByRef: (
    ref: ObjRef,
) => DashboardSelector<[IDashboardFilter[], IDashboardFilter[]]> = createMemoizedSelector((ref: ObjRef) => {
    return createSelector(
        selectWidgetByRef(ref),
        selectFilterContextFilters,
        selectCrossFilteringFiltersLocalIdentifiersByWidgetRef(ref),
        selectEnableIgnoreCrossFiltering,
        selectWidgetIgnoreCrossFiltering(ref),
        selectCrossFilteringFiltersLocalIdentifiers,
        (
            widget,
            dashboardFilters,
            crossFilteringFiltersLocalIdentifiers,
            isIgnoreCrossFilteringEnabled,
            shouldIgnoreCrossFiltering,
            allCrossFilteringLocalIdentifiers,
        ) => {
            invariant(widget, `widget with ref ${objRefToString(ref)} does not exist in the state`);

            if (isExtendedDashboardLayoutWidget(widget)) {
                return [[], []];
            }

            // Widget is the source of cross-filtering, so filtering out the cross-filtering filters
            const filtersWithoutCrossFilteringFilters = dashboardFilters.filter((f) => {
                if (isDashboardAttributeFilter(f)) {
                    return !crossFilteringFiltersLocalIdentifiers?.includes(
                        f.attributeFilter.localIdentifier!,
                    );
                }

                return true;
            });

            // Widget ignores cross-filtering, so we should remove all cross-filtering filters
            const filtersWithoutAllCrossFiltering =
                isIgnoreCrossFilteringEnabled && shouldIgnoreCrossFiltering
                    ? filtersWithoutCrossFilteringFilters.filter((f) => {
                          if (isDashboardAttributeFilter(f)) {
                              return !allCrossFilteringLocalIdentifiers.includes(
                                  f.attributeFilter.localIdentifier!,
                              );
                          }

                          return true;
                      })
                    : [...filtersWithoutCrossFilteringFilters];

            const [commonDateFilters, otherFilters] = partition(
                filtersWithoutAllCrossFiltering,
                isDashboardCommonDateFilter,
            );

            return [
                filterContextItemsToDashboardFiltersByWidget(commonDateFilters, widget),
                filterContextItemsToDashboardFiltersByWidget(otherFilters, widget),
            ];
        },
    );
});

const selectAllWidgets = createSelector(selectWidgetsMap, (widgetMap) => {
    return Array.from(widgetMap.values());
});

/**
 * Selects a boolean indicating if the dashboard is empty.
 *
 * @alpha
 */
export const selectIsLayoutEmpty: DashboardSelector<boolean> = createSelector(
    selectAllWidgets,
    (allWidgets) => {
        return allWidgets.length === 0;
    },
);

/**
 * Selects all KPI widgets in the layout.
 *
 * @alpha
 */
export const selectAllKpiWidgets: DashboardSelector<IKpiWidget[]> = createSelector(
    selectAllWidgets,
    (allWidgets) => {
        return allWidgets.filter(isKpiWidget);
    },
);

/**
 * Selects all insight widgets in the layout.
 *
 * @alpha
 */
export const selectAllInsightWidgets: DashboardSelector<ExtendedDashboardWidget[]> = createSelector(
    selectAllWidgets,
    (allWidgets) => {
        return allWidgets.filter(isInsightWidget);
    },
);

/**
 * Selects all custom widgets in the layout.
 *
 * @alpha
 */
export const selectAllCustomWidgets: DashboardSelector<ExtendedDashboardWidget[]> = createSelector(
    selectAllWidgets,
    (allWidgets) => {
        return allWidgets.filter(isCustomWidget);
    },
);

/**
 * Selects all non-custom widgets in the layout.
 *
 * @alpha
 */
export const selectAllAnalyticalWidgets: DashboardSelector<IWidget[]> = createSelector(
    selectAllWidgets,
    (allWidgets) => {
        return allWidgets.filter((w): w is IKpiWidget | IInsightWidget => !isCustomWidget(w));
    },
);

/**
 * Selects a boolean indicating if the dashboard contains at least one non-custom widget.
 *
 * @alpha
 */
export const selectLayoutHasAnalyticalWidgets: DashboardSelector<boolean> = createSelector(
    selectAllAnalyticalWidgets,
    (allAnalyticalWidgets) => {
        return allAnalyticalWidgets.length > 0;
    },
);

/**
 * Selects layout path for a given widget.
 *
 * @alpha
 */
export const selectWidgetPathByRef: (ref: ObjRef) => DashboardSelector<ILayoutItemPath> =
    createMemoizedSelector((ref: ObjRef) => {
        return createSelector(selectLayout, (layout): ILayoutItemPath => {
            const coords = getWidgetCoordinates(layout, ref);
            invariant(coords, `widget with ref ${objRefToString(ref)} does not exist in the state`);
            return coords;
        });
    });

/**
 * Selects layout coordinates for a given widget.
 *
 * @alpha
 *
 * @deprecated The selector returns coordinates in its parent layout. The information is not useful on its
 *  own when dashboard uses nested layout. For this case use {@link selectWidgetPathByRef} instead.
 *
 *  TODO LX-648: remove this selector, exported only for backward compatible reasons.
 */
export const selectWidgetCoordinatesByRef: (ref: ObjRef) => DashboardSelector<ILayoutCoordinates> =
    createMemoizedSelector((ref: ObjRef) => {
        return createSelector(selectLayout, (layout): ILayoutCoordinates => {
            const coords = getWidgetCoordinates(layout, ref);
            invariant(coords, `widget with ref ${objRefToString(ref)} does not exist in the state`);
            return coords[coords.length - 1];
        });
    });

/**
 * @internal
 */
export const selectWidgetPlaceholder: DashboardSelector<ExtendedDashboardWidget | undefined> = createSelector(
    selectAllCustomWidgets,
    (customWidgets) => {
        return customWidgets.find(isPlaceholderWidget);
    },
);

/**
 * @internal
 */
export const selectWidgetPlaceholderPath: DashboardSelector<ILayoutItemPath | undefined> = createSelector(
    selectWidgetPlaceholder,
    selectLayout,
    (widgetPlaceholder, layout) => {
        return widgetPlaceholder ? getWidgetCoordinates(layout, widgetPlaceholder.ref) : undefined;
    },
);

/**
 * @internal
 *
 * @deprecated The selector returns coordinates in its parent layout. The information is not useful on its
 *  own when dashboard uses nested layout. For this case use {@link selectWidgetPlaceholderPath} instead.
 *
 *  TODO LX-648: remove this selector, exported only for backward compatible reasons.
 */
export const selectWidgetPlaceholderCoordinates: DashboardSelector<ILayoutCoordinates | undefined> =
    createSelector(selectWidgetPlaceholder, selectLayout, (widgetPlaceholder, layout) => {
        const path = widgetPlaceholder ? getWidgetCoordinates(layout, widgetPlaceholder.ref) : undefined;
        return path === undefined ? undefined : path[path.length - 1];
    });

/**
 * @internal
 */
export const selectInsightWidgetPlaceholder: DashboardSelector<ExtendedDashboardWidget | undefined> =
    createSelector(selectAllCustomWidgets, (customWidgets) => {
        return customWidgets.find(isInsightPlaceholderWidget);
    });

/**
 * @internal
 */
export const selectInsightWidgetPlaceholderPath: DashboardSelector<ILayoutItemPath | undefined> =
    createSelector(selectInsightWidgetPlaceholder, selectLayout, (widgetPlaceholder, layout) => {
        return widgetPlaceholder ? getWidgetCoordinates(layout, widgetPlaceholder.ref) : undefined;
    });

/**
 * @internal
 *
 * @deprecated The selector returns coordinates in its parent layout. The information is not useful on its
 *  own when dashboard uses nested layout. For this case use {@link selectInsightWidgetPlaceholderPath} instead.
 *
 *  TODO LX-648: remove this selector, exported only for backward compatible reasons.
 */
export const selectInsightWidgetPlaceholderCoordinates: DashboardSelector<ILayoutCoordinates | undefined> =
    createSelector(selectInsightWidgetPlaceholder, selectLayout, (widgetPlaceholder, layout) => {
        const path = widgetPlaceholder ? getWidgetCoordinates(layout, widgetPlaceholder.ref) : undefined;
        return path === undefined ? undefined : path[path.length - 1];
    });

/**
 * @internal
 */
export const selectKpiWidgetPlaceholder: DashboardSelector<ExtendedDashboardWidget | undefined> =
    createSelector(selectAllCustomWidgets, (customWidgets) => {
        return customWidgets.find(isKpiPlaceholderWidget);
    });

/**
 * @internal
 */
export const selectKpiWidgetPlaceholderPath: DashboardSelector<ILayoutItemPath | undefined> = createSelector(
    selectKpiWidgetPlaceholder,
    selectLayout,
    (widgetPlaceholder, layout) => {
        return widgetPlaceholder ? getWidgetCoordinates(layout, widgetPlaceholder.ref) : undefined;
    },
);

/**
 * @internal
 *
 * @deprecated The selector returns coordinates in its parent layout. The information is not useful on its
 *  own when dashboard uses nested layout. For this case use {@link selectKpiWidgetPlaceholderPath} instead.
 *
 *  TODO LX-648: remove this selector, exported only for backward compatible reasons.
 */
export const selectKpiWidgetPlaceholderCoordinates: DashboardSelector<ILayoutCoordinates | undefined> =
    createSelector(selectKpiWidgetPlaceholder, selectLayout, (widgetPlaceholder, layout) => {
        const path = widgetPlaceholder ? getWidgetCoordinates(layout, widgetPlaceholder.ref) : undefined;
        return path === undefined ? undefined : path[path.length - 1];
    });

/**
 * Selects whether widget should ignore cross-filtering filters
 *
 * @alpha
 */
export const selectWidgetIgnoreCrossFiltering: (ref: ObjRef) => DashboardSelector<boolean> =
    createMemoizedSelector((ref: ObjRef) =>
        createSelector(selectAnalyticalWidgetByRef(ref), (widget) => {
            return widget?.ignoreCrossFiltering ?? false;
        }),
    );

/**
 * Selects the local identifier of the tab that contains the specified widget.
 * Returns undefined if the widget is not found in any tab.
 *
 * @param ref - widget reference to search for
 * @returns local identifier of the tab containing the widget, or undefined if not found
 *
 * @alpha
 */
export const selectTabLocalIdentifierByWidgetRef: (
    ref: ObjRef | undefined,
) => DashboardSelector<string | undefined> = createMemoizedSelector((ref: ObjRef | undefined) =>
    createSelector(selectTabs, (tabs): string | undefined => {
        if (!ref || !tabs) {
            return undefined;
        }

        // Search through all tabs to find which one contains the widget
        for (const tab of tabs) {
            if (tab.layout?.layout) {
                const widgetCoordinates = getWidgetCoordinates(tab.layout.layout, ref);
                if (widgetCoordinates) {
                    return tab.localIdentifier;
                }
            }
        }

        return undefined;
    }),
);

/**
 * Maps widget local identifiers to the tab that contains them.
 *
 * @alpha
 */
export const selectWidgetLocalIdToTabIdMap: DashboardSelector<Record<string, string>> = createSelector(
    selectTabs,
    (tabs) => {
        if (!tabs) {
            return {};
        }

        return tabs.reduce<Record<string, string>>((acc, tab) => {
            if (!tab.localIdentifier || !tab.layout?.layout) {
                return acc;
            }

            const widgets = getLayoutWidgets(tab.layout.layout);
            widgets.forEach((widget) => {
                if (widget.localIdentifier) {
                    acc[widget.localIdentifier] = tab.localIdentifier as string;
                }
            });

            return acc;
        }, {});
    },
);
