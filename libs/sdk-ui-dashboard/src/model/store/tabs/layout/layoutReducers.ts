// (C) 2021-2025 GoodData Corporation

import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";
import { invariant } from "ts-invariant";

import {
    IDashboardFilterReference,
    IDashboardLayout,
    IDashboardLayoutContainerDirection,
    IDashboardLayoutSection,
    IDashboardLayoutSectionHeader,
    IDrillDownIntersectionIgnoredAttributes,
    IDrillDownReference,
    IDrillToLegacyDashboard,
    IInsightWidget,
    IInsightWidgetConfiguration,
    IKpiComparisonDirection,
    IKpiComparisonTypeComparison,
    IKpiWidgetConfiguration,
    InsightDrillDefinition,
    ObjRef,
    ScreenSize,
    VisualizationProperties,
    areObjRefsEqual,
    isDashboardAttributeFilterReference,
    isDashboardDateFilterReference,
    isDashboardLayout,
    isDashboardLayoutItem,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import { LayoutState, layoutInitialState } from "./layoutState.js";
import { getWidgetCoordinatesAndItem, resizeInsightWidget } from "./layoutUtils.js";
import { IdentityMapping } from "../../../../_staging/dashboard/dashboardLayout.js";
import {
    findItem,
    findSection,
    findSections,
    getItemIndex,
} from "../../../../_staging/layout/coordinates.js";
import { ObjRefMap, newMapForObjectWithIdentity } from "../../../../_staging/metadata/objRefMap.js";
import { setOrDelete } from "../../../../_staging/objectUtils/setOrDelete.js";
import { ILayoutItemPath, ILayoutSectionPath } from "../../../../types.js";
import {
    ExtendedDashboardItem,
    ExtendedDashboardLayoutSection,
    ExtendedDashboardWidget,
    IItemWithHeight,
    IItemWithWidth,
    StashedDashboardItemsId,
    isCustomWidget,
} from "../../../types/layoutTypes.js";
import { WidgetDescription, WidgetHeader } from "../../../types/widgetTypes.js";
import { addArrayElements, removeArrayElement } from "../../../utils/arrayOps.js";
import { resetUndoReducer, undoReducer, withUndo } from "../../_infra/undoEnhancer.js";
import { TabsState } from "../tabsState.js";

// Core layout reducer type (operates directly on LayoutState, which extends UndoEnhancedState)
// Use this type for reducers that will be wrapped with withUndo
type CoreLayoutReducer<P> = CaseReducer<LayoutState, PayloadAction<P>>;

// Generic layout reducer type (operates on TabsState and extracts LayoutState)
// This is the most common type for reducers that manipulate layout through tabs
type LayoutReducer<A> = CaseReducer<TabsState, PayloadAction<A>>;

// Wrapped reducer type (operates on TabsState) - same as LayoutReducer
type AdaptedLayoutReducer<P> = CaseReducer<TabsState, PayloadAction<P>>;

/**
 * Adapts a core layout reducer (for LayoutState) to a tabs reducer (for TabsState).
 * Automatically applies the reducer to the active tab's layout state.
 */
function adaptLayoutReducer<P>(coreLayoutReducer: CoreLayoutReducer<P>): AdaptedLayoutReducer<P> {
    return (state: Draft<TabsState>, action: PayloadAction<P>) => {
        const activeTab = state.tabs?.find((tab) => tab.localIdentifier === state.activeTabLocalIdentifier);
        if (!activeTab) return;

        const layoutState = activeTab.layout;
        if (!layoutState) return;

        // Call the reducer - it may mutate the draft or return a new state (e.g., when wrapped with withUndo)
        const result = coreLayoutReducer(layoutState as Draft<LayoutState>, action);

        // If the reducer returns a new state (like withUndo does), replace the layout
        if (result !== undefined) {
            activeTab.layout = result;
        }
    };
}

/**
 * Helper function to get the active tab's layout state.
 * Initializes the layout if it doesn't exist.
 * Returns undefined if no active tab is found.
 */
function getActiveTabLayout(state: Draft<TabsState>): Draft<LayoutState> | undefined {
    if (!state.tabs || !state.activeTabLocalIdentifier) {
        return undefined;
    }

    const activeTab = state.tabs.find((tab) => tab.localIdentifier === state.activeTabLocalIdentifier);
    if (!activeTab) {
        return undefined;
    }

    // Initialize layout state if it doesn't exist
    if (!activeTab.layout) {
        activeTab.layout = { ...layoutInitialState };
    }

    return activeTab.layout;
}

//
//
//

const setLayout: LayoutReducer<IDashboardLayout<ExtendedDashboardWidget>> = (state, action) => {
    const layoutState = getActiveTabLayout(state);
    if (!layoutState) {
        return;
    }

    layoutState.layout = action.payload;
    resetUndoReducer(layoutState);
};

//
//
//

function recurseLayoutAndUpdateWidgetIds(
    layout: Draft<IDashboardLayout<ExtendedDashboardWidget>>,
    mapping: ObjRefMap<IdentityMapping>,
) {
    layout.sections.forEach((section) => {
        section.items.forEach((item) => {
            const widget = item.widget;

            if (isDashboardLayout(widget)) {
                return recurseLayoutAndUpdateWidgetIds(widget, mapping);
            }

            if (!isInsightWidget(widget) && !isKpiWidget(widget)) {
                return;
            }

            const { updated: newIdentity } = mapping.get(widget.ref) ?? {};

            if (!newIdentity) {
                return;
            }

            widget.ref = newIdentity.ref;
            widget.uri = newIdentity.uri;
            widget.identifier = newIdentity.identifier;
        });
    });
}

const updateWidgetIdentities: LayoutReducer<ObjRefMap<IdentityMapping>> = (state, action) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);

    recurseLayoutAndUpdateWidgetIds(layoutState.layout, action.payload);
};

/**
 * Payload for updating widget identities for a specific tab.
 */
type UpdateWidgetIdentitiesForTabPayload = {
    tabId: string;
    mapping: ObjRefMap<IdentityMapping>;
};

/**
 * Updates widget identities for a specific tab after a dashboard save.
 * This ensures that temporary widget IDs are replaced with persistent IDs
 * for widgets in the specified tab's layout.
 *
 * @param state - The tabs state
 * @param action - Object containing tabId and the identity mapping for that tab's widgets
 */
const updateWidgetIdentitiesForTab: LayoutReducer<UpdateWidgetIdentitiesForTabPayload> = (state, action) => {
    if (!state.tabs) {
        return;
    }

    const { tabId, mapping } = action.payload;
    const tab = state.tabs.find((t) => t.localIdentifier === tabId);

    if (!tab?.layout?.layout) {
        return;
    }

    recurseLayoutAndUpdateWidgetIds(tab.layout.layout, mapping);
};

//
// Reducers that manipulate the layout itself - the sections and items
//

type AddSectionActionPayload = {
    section: ExtendedDashboardLayoutSection;
    index: ILayoutSectionPath;
    usedStashes: StashedDashboardItemsId[];
};

// Core reducer that operates directly on LayoutState (which extends UndoEnhancedState)
const addSectionCore: CoreLayoutReducer<AddSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, section, usedStashes } = action.payload;
    const sections = findSections(state.layout, index);

    addArrayElements(sections, index.sectionIndex, [section]);

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

// Wrap with undo and adapt to TabsState
const addSection = adaptLayoutReducer(withUndo(addSectionCore));

//
//
//

type RemoveSectionActionPayload = { index: ILayoutSectionPath; stashIdentifier?: StashedDashboardItemsId };

const removeSectionCore: CoreLayoutReducer<RemoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, stashIdentifier } = action.payload;

    if (stashIdentifier) {
        state.stash[stashIdentifier] = findSection(state.layout, index).items;
    }

    const sections = findSections(state.layout, index);
    removeArrayElement(sections, index.sectionIndex);
};

// Wrap with undo and adapt to TabsState
const removeSection = adaptLayoutReducer(withUndo(removeSectionCore));

//
//
//

type ChangeSectionActionPayload = { index: ILayoutSectionPath; header: IDashboardLayoutSectionHeader };

const changeSectionHeaderCore: CoreLayoutReducer<ChangeSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, header } = action.payload;

    findSection(state.layout, index).header = header;
};

// Wrap with undo and adapt to TabsState
const changeSectionHeader = adaptLayoutReducer(withUndo(changeSectionHeaderCore));

//
//
//

type ToggleLayoutSectionHeadersPayload = {
    layoutPath: ILayoutItemPath | undefined;
    enableSectionHeaders: boolean;
};

const toggleLayoutSectionHeadersCore: CoreLayoutReducer<ToggleLayoutSectionHeadersPayload> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { layoutPath, enableSectionHeaders } = action.payload;
    const layout = layoutPath === undefined ? state.layout : findItem(state.layout, layoutPath);

    if (isDashboardLayoutItem(layout) && isDashboardLayout(layout.widget)) {
        layout.widget = {
            ...layout.widget,
            configuration: {
                ...(layout.widget.configuration ?? {}),
                sections: {
                    ...(layout.widget.configuration?.sections ?? {}),
                    enableHeader: enableSectionHeaders,
                },
            },
        };
    }
};

// Wrap with undo and adapt to TabsState
const toggleLayoutSectionHeaders = adaptLayoutReducer(withUndo(toggleLayoutSectionHeadersCore));

type ToggleLayoutDirectionPayload = {
    layoutPath: ILayoutItemPath | undefined;
    direction: IDashboardLayoutContainerDirection;
};

const toggleLayoutDirectionCore: CoreLayoutReducer<ToggleLayoutDirectionPayload> = (state, action) => {
    invariant(state.layout);

    const { layoutPath, direction } = action.payload;
    const layout = layoutPath === undefined ? state.layout : findItem(state.layout, layoutPath);

    if (isDashboardLayoutItem(layout) && isDashboardLayout(layout.widget)) {
        layout.widget = {
            ...layout.widget,
            configuration: {
                ...(layout.widget.configuration ?? {}),
                direction,
            },
        };
    }
};

// Wrap with undo and adapt to TabsState
const toggleLayoutDirection = adaptLayoutReducer(withUndo(toggleLayoutDirectionCore));

//
//
//

type changeItemsHeightActionPayload = {
    sectionIndex: ILayoutSectionPath;
    itemIndexes: number[];
    height: number;
};

const changeItemsHeight: LayoutReducer<changeItemsHeightActionPayload> = (state, action) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);

    const { sectionIndex, itemIndexes, height } = action.payload;

    const section = findSection(layoutState.layout, sectionIndex);
    itemIndexes.forEach((itemIndex) => {
        const item = section.items[itemIndex];
        if (isCustomWidget(item.widget)) {
            return;
        }

        item.size = {
            ...item.size,
            xl: {
                ...item.size.xl,
                gridHeight: height,
            },
        };
    });
};

//
//
//

type updateHeightOfMultipleItemsActionPayload = {
    itemsWithSizes: IItemWithHeight[];
};

const updateHeightOfMultipleItems: LayoutReducer<updateHeightOfMultipleItemsActionPayload> = (
    state,
    action,
) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);
    const rootLayout = layoutState.layout;
    const { itemsWithSizes } = action.payload;

    itemsWithSizes.forEach(({ itemPath, height }) => {
        const item = findItem(rootLayout, itemPath);
        if (isCustomWidget(item.widget)) {
            return;
        }
        item.size = {
            ...item.size,
            xl: {
                ...item.size.xl,
                gridHeight: height,
            },
        };
    });
};

type updateWidthOfMultipleItemsActionPayload = {
    itemsWithSizes: IItemWithWidth[];
};

const updateWidthOfMultipleItems: LayoutReducer<updateWidthOfMultipleItemsActionPayload> = (
    state,
    action,
) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);
    const rootLayout = layoutState.layout;
    const { itemsWithSizes } = action.payload;

    itemsWithSizes.forEach(({ itemPath, width }) => {
        const item = findItem(rootLayout, itemPath);
        if (isCustomWidget(item.widget)) {
            return;
        }
        item.size = {
            ...item.size,
            xl: {
                ...item.size.xl,
                gridWidth: width,
            },
        };
    });
};

//
//
//

type changeItemWidthActionPayload = { layoutPath: ILayoutItemPath; width: number };

const changeItemWidth: LayoutReducer<changeItemWidthActionPayload> = (state, action) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);

    const { layoutPath, width } = action.payload;

    const item = findItem(layoutState.layout, layoutPath);

    item.size = {
        ...item.size,
        xl: {
            ...item.size.xl,
            gridWidth: width,
        },
    };
};

//
//
//

type MoveSectionActionPayload = { sectionIndex: ILayoutSectionPath; toIndex: ILayoutSectionPath };

const moveSectionCore: CoreLayoutReducer<MoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, toIndex } = action.payload;

    const originalSections = findSections(state.layout, sectionIndex);
    const movedSection = removeArrayElement(originalSections, sectionIndex.sectionIndex);

    const targetSections = findSections(state.layout, toIndex);
    addArrayElements(targetSections, toIndex.sectionIndex, [movedSection]);
};

// Wrap with undo and adapt to TabsState
const moveSection = adaptLayoutReducer(withUndo(moveSectionCore));

//
//
//

type AddSectionItemsActionPayload = {
    layoutPath: ILayoutItemPath;
    items: ExtendedDashboardItem[];
    usedStashes: StashedDashboardItemsId[];
};

const addSectionItemsCore: CoreLayoutReducer<AddSectionItemsActionPayload> = (state, action) => {
    invariant(state.layout);

    const { layoutPath, items, usedStashes } = action.payload;
    const section = findSection(state.layout, layoutPath);

    invariant(section);

    const itemIndexAtTargetSection = getItemIndex(layoutPath);
    addArrayElements(section.items, itemIndexAtTargetSection, items);

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

// Wrap with undo and adapt to TabsState
const addSectionItems = adaptLayoutReducer(withUndo(addSectionItemsCore));

//
//
//

type MoveSectionItemActionPayload = {
    itemIndex: ILayoutItemPath;
    toItemIndex: ILayoutItemPath;
};

const moveSectionItemCore: CoreLayoutReducer<MoveSectionItemActionPayload> = (state, action) => {
    invariant(state.layout);

    const { itemIndex, toItemIndex } = action.payload;
    const fromSection = findSection(state.layout, itemIndex);
    const toSection = findSection(state.layout, toItemIndex);

    invariant(fromSection);
    invariant(toSection);

    const itemIndexAtSourceSection = getItemIndex(itemIndex);
    const item = removeArrayElement(fromSection.items, itemIndexAtSourceSection);

    invariant(item);

    const itemIndexAtTargetSection = getItemIndex(toItemIndex);
    addArrayElements(toSection.items, itemIndexAtTargetSection, [item]);
};

// Wrap with undo and adapt to TabsState
const moveSectionItem = adaptLayoutReducer(withUndo(moveSectionItemCore));

//
//
//

type RemoveSectionItemActionPayload = {
    itemIndex: ILayoutItemPath;
    stashIdentifier?: StashedDashboardItemsId;
};

const removeSectionItemCore: CoreLayoutReducer<RemoveSectionItemActionPayload> = (state, action) => {
    invariant(state.layout);

    const { itemIndex, stashIdentifier } = action.payload;
    const section = findSection(state.layout, itemIndex);

    invariant(section);

    const item = removeArrayElement(section.items, getItemIndex(itemIndex));

    invariant(item);

    if (stashIdentifier) {
        state.stash[stashIdentifier] = [item];
    }
};

// Wrap with undo and adapt to TabsState
const removeSectionItem = adaptLayoutReducer(withUndo(removeSectionItemCore));

//
//
//

type ReplaceSectionItemActionPayload = {
    layoutPath: ILayoutItemPath;
    newItems: ExtendedDashboardItem[];
    stashIdentifier?: StashedDashboardItemsId;
    usedStashes: StashedDashboardItemsId[];
};

const replaceSectionItemCore: CoreLayoutReducer<ReplaceSectionItemActionPayload> = (state, action) => {
    invariant(state.layout);

    const { layoutPath, newItems, stashIdentifier, usedStashes } = action.payload;
    const section = findSection(state.layout, layoutPath);

    invariant(section);

    const itemIndexAtSourceSection = getItemIndex(layoutPath);
    const item = removeArrayElement(section.items, itemIndexAtSourceSection);

    invariant(item);

    if (stashIdentifier) {
        state.stash[stashIdentifier] = [item];
    }

    addArrayElements(section.items, itemIndexAtSourceSection, newItems);

    usedStashes.forEach((usedStash) => {
        /*
         * It is a valid case that the new item is taken from a stash and the replaced item is then
         * used to replace the same stash.
         */
        if (stashIdentifier !== undefined && usedStash === stashIdentifier) {
            return;
        }

        delete state.stash[usedStash];
    });
};

//
// Wrap with undo and adapt to TabsState
const replaceSectionItem = adaptLayoutReducer(withUndo(replaceSectionItemCore));

//
//
//

// Layout-widget specific reducers
//

const processSection = (section: IDashboardLayoutSection<ExtendedDashboardWidget>) => {
    return section.items.flatMap((item) => {
        let result: (typeof item.widget)[] = [];
        const widget = item.widget;
        if (widget === undefined) {
            return [];
        }
        if (isVisualizationSwitcherWidget(widget)) {
            result = [widget, ...widget.visualizations];
            return result;
        } else if (isDashboardLayout(widget)) {
            result = [widget, ...widget.sections.flatMap(processSection)];
            return result;
        }
        return [widget];
    }) as ExtendedDashboardWidget[];
};

const getWidgetByRef = (
    state: Draft<LayoutState>,
    widgetRef: ObjRef,
): Draft<ExtendedDashboardWidget> | undefined => {
    const allWidgets = state?.layout?.sections.flatMap(processSection) ?? [];
    const widgets = allWidgets.filter(Boolean) as NonNullable<(typeof allWidgets)[number]>[];
    return newMapForObjectWithIdentity(widgets).get(widgetRef);
};

//
//
//

type ReplaceWidgetHeader = {
    ref: ObjRef;
    header: WidgetHeader;
};

const replaceWidgetHeaderCore: CoreLayoutReducer<ReplaceWidgetHeader> = (state, action) => {
    invariant(state.layout);

    const { header, ref } = action.payload;

    const widget = getWidgetByRef(state, ref);

    // this means command handler did not correctly validate that the widget exists before dispatching the
    // reducer action
    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.title = header.title ?? "";
};

// Wrap with undo and adapt to TabsState
const replaceWidgetHeader = adaptLayoutReducer(withUndo(replaceWidgetHeaderCore));

//
//
//

type ReplaceWidgetDescription = {
    ref: ObjRef;
    description: WidgetDescription;
};

const replaceWidgetDescriptionCore: CoreLayoutReducer<ReplaceWidgetDescription> = (state, action) => {
    invariant(state.layout);

    const { description, ref } = action.payload;

    const widget = getWidgetByRef(state, ref);

    // this means command handler did not correctly validate that the widget exists before dispatching the
    // reducer action
    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.description = description.description ?? "";
};

// Wrap with undo and adapt to TabsState
const replaceWidgetDescription = adaptLayoutReducer(withUndo(replaceWidgetDescriptionCore));

//
//
//

type ReplaceWidgetDrillDefinitions = {
    ref: ObjRef;
    drillDefinitions: InsightDrillDefinition[];
};

const replaceWidgetDrill: LayoutReducer<ReplaceWidgetDrillDefinitions> = (state, action) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);

    const { drillDefinitions, ref } = action.payload;
    const widget = getWidgetByRef(layoutState, ref);

    // this means command handler did not correctly validate that the widget exists before dispatching the
    // reducer action
    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.drills = drillDefinitions ?? [];
};

const replaceWidgetDrillCore: CoreLayoutReducer<ReplaceWidgetDrillDefinitions> = (state, action) => {
    invariant(state.layout);

    const { drillDefinitions, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    // this means command handler did not correctly validate that the widget exists before dispatching the
    // reducer action
    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.drills = drillDefinitions ?? [];
};

const replaceWidgetDrills = adaptLayoutReducer(withUndo(replaceWidgetDrillCore));
//
//
//

type ReplaceWidgetBlacklistHierarchies = {
    ref: ObjRef;
    blacklistHierarchies: IDrillDownReference[];
};

//
const replaceWidgetBlacklistHierarchiesCore: CoreLayoutReducer<ReplaceWidgetBlacklistHierarchies> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { blacklistHierarchies, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.ignoredDrillDownHierarchies = blacklistHierarchies ?? [];
};

// Wrap with undo and adapt to TabsState
const replaceWidgetBlacklistHierarchies = adaptLayoutReducer(withUndo(replaceWidgetBlacklistHierarchiesCore));
//
//
//

type ReplaceWidgetBlacklistAttributes = {
    ref: ObjRef;
    blacklistAttributes: ObjRef[];
};

//
const replaceWidgetBlacklistAttributesCore: CoreLayoutReducer<ReplaceWidgetBlacklistAttributes> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { blacklistAttributes, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.ignoredDrillToUrlAttributes = blacklistAttributes ?? [];
};

// Wrap with undo and adapt to TabsState
const replaceWidgetBlacklistAttributes = adaptLayoutReducer(withUndo(replaceWidgetBlacklistAttributesCore));
//
//
//

type ReplaceWidgetDrillDownIntersectionIgnoredAttributes = {
    ref: ObjRef;
    ignoredDrillDownIntersectionIgnoredAttributes: IDrillDownIntersectionIgnoredAttributes[];
};

//
const replaceWidgetDrillDownIntersectionIgnoredAttributesCore: CoreLayoutReducer<
    ReplaceWidgetDrillDownIntersectionIgnoredAttributes
> = (state, action) => {
    invariant(state.layout);

    const { ignoredDrillDownIntersectionIgnoredAttributes, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.drillDownIntersectionIgnoredAttributes = ignoredDrillDownIntersectionIgnoredAttributes ?? [];
};

// Wrap with undo and adapt to TabsState
const replaceWidgetDrillDownIntersectionIgnoredAttributes = adaptLayoutReducer(
    withUndo(replaceWidgetDrillDownIntersectionIgnoredAttributesCore),
);

//
//
//

type ReplaceWidgetVisProperties = {
    ref: ObjRef;
    properties: VisualizationProperties | undefined;
};

const replaceInsightWidgetVisPropertiesCore: CoreLayoutReducer<ReplaceWidgetVisProperties> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { properties, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isInsightWidget(widget));
    setOrDelete(widget, "properties", properties);
};

// Wrap with undo and adapt to TabsState
const replaceInsightWidgetVisProperties = adaptLayoutReducer(withUndo(replaceInsightWidgetVisPropertiesCore));
//
//
//

type ReplaceWidgetVisConfiguration = {
    ref: ObjRef;
    config: IInsightWidgetConfiguration | undefined;
};

const replaceInsightWidgetVisConfigurationCore: CoreLayoutReducer<ReplaceWidgetVisConfiguration> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { config, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isInsightWidget(widget));
    setOrDelete(widget, "configuration", config);
};

// Wrap with undo and adapt to TabsState
const replaceInsightWidgetVisConfiguration = adaptLayoutReducer(
    withUndo(replaceInsightWidgetVisConfigurationCore),
);

//
//
//

type ReplaceWidgetInsight = {
    ref: ObjRef;
    insightRef: ObjRef;
    properties: VisualizationProperties | undefined;
    header: WidgetHeader | undefined;
    newSize?: IVisualizationSizeInfo;
};

const replaceInsightWidgetInsightCore: CoreLayoutReducer<ReplaceWidgetInsight> = (state, action) => {
    invariant(state.layout);

    const { insightRef, properties, ref, header, newSize } = action.payload;
    const widget = getWidgetByRef(state, ref);
    const data = getWidgetCoordinatesAndItem(state.layout, ref);

    invariant(isInsightWidget(widget), "IInsightWidget is missing in state");

    if (properties) {
        widget.properties = properties;
    }

    if (header?.title) {
        widget.title = header.title;
    }

    widget.insight = insightRef;

    if (newSize && data?.item) {
        data.item.size.xl = resizeInsightWidget(data.item.size.xl, newSize);
    }
};

// Wrap with undo and adapt to TabsState
const replaceInsightWidgetInsight = adaptLayoutReducer(withUndo(replaceInsightWidgetInsightCore));
//
//

type ReplaceWidgetFilterSettings = {
    ref: ObjRef;
    ignoreDashboardFilters?: IDashboardFilterReference[];
    dateDataSet?: ObjRef;
};

const replaceWidgetFilterSettingsCore: CoreLayoutReducer<ReplaceWidgetFilterSettings> = (state, action) => {
    invariant(state.layout);

    const { ignoreDashboardFilters, dateDataSet, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isInsightWidget(widget) || isKpiWidget(widget) || isRichTextWidget(widget)));

    widget.dateDataSet = dateDataSet;
    widget.ignoreDashboardFilters = ignoreDashboardFilters ?? [];
};

// Wrap with undo and adapt to TabsState
const replaceWidgetFilterSettings = adaptLayoutReducer(withUndo(replaceWidgetFilterSettingsCore));
//
//
//

type RemoveIgnoredAttributeFilter = {
    displayFormRefs: ObjRef[];
};

const removeIgnoredAttributeFilterFromLayout = (
    layout: Draft<IDashboardLayout<ExtendedDashboardWidget>>,
    displayFormRefs: ObjRef[],
) => {
    layout.sections.forEach((section) => {
        section.items.forEach((item) => {
            const widget = item.widget;

            if (isInsightWidget(widget) || isKpiWidget(widget)) {
                widget.ignoreDashboardFilters = widget.ignoreDashboardFilters.filter((filter) => {
                    if (isDashboardDateFilterReference(filter)) {
                        return true;
                    }

                    return (
                        displayFormRefs.find((removed) => areObjRefsEqual(removed, filter.displayForm)) ===
                        undefined
                    );
                });
            } else if (isDashboardLayout(widget)) {
                removeIgnoredAttributeFilterFromLayout(widget, displayFormRefs);
            }
        });
    });
};

const removeIgnoredAttributeFilter: LayoutReducer<RemoveIgnoredAttributeFilter> = (state, action) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);

    removeIgnoredAttributeFilterFromLayout(layoutState.layout, action.payload.displayFormRefs);
};

//
//
//

type ReplaceWidgetDateDataset = {
    ref: ObjRef;
    dateDataSet?: ObjRef;
};

const replaceWidgetDateDatasetCore: CoreLayoutReducer<ReplaceWidgetDateDataset> = (state, action) => {
    invariant(state.layout);

    const { dateDataSet, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isInsightWidget(widget) || isKpiWidget(widget)));

    widget.dateDataSet = dateDataSet;
};

// Wrap with undo and adapt to TabsState
const replaceWidgetDateDataset = adaptLayoutReducer(withUndo(replaceWidgetDateDatasetCore));
//
//
//

type RemoveIgnoredDateFilter = {
    dateDataSets: ObjRef[];
};

const removeIgnoredDateFilterFromLayout = (
    layout: Draft<IDashboardLayout<ExtendedDashboardWidget>>,
    dateDataSets: ObjRef[],
) => {
    layout.sections.forEach((section) => {
        section.items.forEach((item) => {
            const widget = item.widget;

            if (isInsightWidget(widget) || isKpiWidget(widget)) {
                widget.ignoreDashboardFilters = widget.ignoreDashboardFilters.filter((filter) => {
                    if (isDashboardAttributeFilterReference(filter)) {
                        return true;
                    }

                    return (
                        dateDataSets.find((removed) => areObjRefsEqual(removed, filter.dataSet)) === undefined
                    );
                });
            } else if (isDashboardLayout(widget)) {
                removeIgnoredDateFilterFromLayout(widget, dateDataSets);
            }
        });
    });
};

const removeIgnoredDateFilter: LayoutReducer<RemoveIgnoredDateFilter> = (state, action) => {
    const layoutState = getActiveTabLayout(state);
    invariant(layoutState?.layout);

    removeIgnoredDateFilterFromLayout(layoutState.layout, action.payload.dateDataSets);
};

//
//
//

type ReplaceKpiWidgetMeasure = {
    ref: ObjRef;
    measureRef: ObjRef;
};

const replaceKpiWidgetMeasureCore: CoreLayoutReducer<ReplaceKpiWidgetMeasure> = (state, action) => {
    invariant(state.layout);

    const { ref, measureRef } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));

    widget.kpi.metric = measureRef;
};

// Wrap with undo and adapt to TabsState
const replaceKpiWidgetMeasure = adaptLayoutReducer(withUndo(replaceKpiWidgetMeasureCore));
//
//
//

type ReplaceKpiWidgetComparison = {
    ref: ObjRef;
    comparisonType: IKpiComparisonTypeComparison;
    comparisonDirection?: IKpiComparisonDirection;
};

const replaceKpiWidgetComparisonCore: CoreLayoutReducer<ReplaceKpiWidgetComparison> = (state, action) => {
    invariant(state.layout);

    const { ref, comparisonType, comparisonDirection } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));

    widget.kpi.comparisonType = comparisonType;
    widget.kpi.comparisonDirection = comparisonDirection;
};

// Wrap with undo and adapt to TabsState
const replaceKpiWidgetComparison = adaptLayoutReducer(withUndo(replaceKpiWidgetComparisonCore));
//
//
//

type ReplaceKpiWidgetDrill = {
    ref: ObjRef;
    drill: IDrillToLegacyDashboard | undefined;
};

const replaceKpiWidgetDrillCore: CoreLayoutReducer<ReplaceKpiWidgetDrill> = (state, action) => {
    invariant(state.layout);

    const { ref, drill } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));

    widget.drills = drill ? [drill] : [];
};

// Wrap with undo and adapt to TabsState
const replaceKpiWidgetDrill = adaptLayoutReducer(withUndo(replaceKpiWidgetDrillCore));
//
//
//

type ReplaceKpiWidgetConfiguration = {
    ref: ObjRef;
    config: IKpiWidgetConfiguration | undefined;
};

const replaceKpiWidgetConfigurationCore: CoreLayoutReducer<ReplaceKpiWidgetConfiguration> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { config, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));
    setOrDelete(widget, "configuration", config);
};

// Wrap with undo and adapt to TabsState
const replaceKpiWidgetConfiguration = adaptLayoutReducer(withUndo(replaceKpiWidgetConfigurationCore));
//
//
//

type ReplaceRichTextWidgetContent = {
    ref: ObjRef;
    content: string;
};

const replaceRichTextWidgetContentCore: CoreLayoutReducer<ReplaceRichTextWidgetContent> = (state, action) => {
    invariant(state.layout);

    const { content, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isRichTextWidget(widget));
    setOrDelete(widget, "content", content);
};

// Wrap with undo and adapt to TabsState
const replaceRichTextWidgetContent = adaptLayoutReducer(withUndo(replaceRichTextWidgetContentCore));

type ChangeWidgetIgnoreCrossFiltering = {
    ref: ObjRef;
    ignoreCrossFiltering?: boolean;
};

const changeWidgetIgnoreCrossFilteringCore: CoreLayoutReducer<ChangeWidgetIgnoreCrossFiltering> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { ignoreCrossFiltering, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isInsightWidget(widget) || isKpiWidget(widget)));

    widget.ignoreCrossFiltering = ignoreCrossFiltering;
};

// Wrap with undo and adapt to TabsState
const changeWidgetIgnoreCrossFiltering = adaptLayoutReducer(withUndo(changeWidgetIgnoreCrossFilteringCore));

//
//
//

type AddVisualizationSwitcherWidgetVisualization = {
    ref: ObjRef;
    visualization: IInsightWidget;
    newSize?: IVisualizationSizeInfo;
};

const addVisualizationSwitcherWidgetVisualizationCore: CoreLayoutReducer<
    AddVisualizationSwitcherWidgetVisualization
> = (state, action) => {
    invariant(state.layout);

    const { visualization, ref, newSize } = action.payload;
    const widgetRef = getWidgetByRef(state, ref);
    const data = getWidgetCoordinatesAndItem(state.layout, ref);

    invariant(widgetRef && isVisualizationSwitcherWidget(widgetRef));

    widgetRef.visualizations.push(visualization);

    if (newSize && data?.item) {
        data.item.size.xl = resizeInsightWidget(data.item.size.xl, newSize);
    }
};

// Wrap with undo and adapt to TabsState
const addVisualizationSwitcherWidgetVisualization = adaptLayoutReducer(
    withUndo(addVisualizationSwitcherWidgetVisualizationCore),
);

type UpdateVisualizationSwitcherWidgetVisualizations = {
    ref: ObjRef;
    visualizations: IInsightWidget[];
};

const updateVisualizationSwitcherWidgetVisualizationsCore: CoreLayoutReducer<
    UpdateVisualizationSwitcherWidgetVisualizations
> = (state, action) => {
    invariant(state.layout);

    const { visualizations, ref } = action.payload;
    const widgetRef = getWidgetByRef(state, ref);

    invariant(widgetRef && isVisualizationSwitcherWidget(widgetRef));

    widgetRef.visualizations = visualizations;
};

// Wrap with undo and adapt to TabsState
const updateVisualizationSwitcherWidgetVisualizations = adaptLayoutReducer(
    withUndo(updateVisualizationSwitcherWidgetVisualizationsCore),
);

type ResizeVisualizationSwitcherOnInsightChanged = {
    ref: ObjRef;
    newSize?: IVisualizationSizeInfo;
};

const resizeVisualizationSwitcherOnInsightChangedCore: CoreLayoutReducer<
    ResizeVisualizationSwitcherOnInsightChanged
> = (state, action) => {
    invariant(state.layout);

    const { ref, newSize } = action.payload;
    const widgetRef = getWidgetByRef(state, ref);
    const data = getWidgetCoordinatesAndItem(state.layout, ref);

    invariant(widgetRef && isVisualizationSwitcherWidget(widgetRef));

    if (newSize && data?.item) {
        data.item.size.xl = resizeInsightWidget(data.item.size.xl, newSize);
    }
};

// Wrap with undo and adapt to TabsState
const resizeVisualizationSwitcherOnInsightChanged = adaptLayoutReducer(
    withUndo(resizeVisualizationSwitcherOnInsightChangedCore),
);

//
// Reducers that manipulate the layout itself - the sections and items
//

type SetScreenActionPayload = {
    screen: ScreenSize;
};

const setScreen: LayoutReducer<SetScreenActionPayload> = (state, action) => {
    // Update screen for all tabs, not just the active one
    // Screen size is a global property that affects all tabs
    state.tabs?.forEach((tab) => {
        if (tab.layout) {
            tab.layout.screen = action.payload.screen;
        }
    });
};

export const layoutReducers = {
    setLayout,
    setScreen,
    updateWidgetIdentities,
    updateWidgetIdentitiesForTab,
    removeIgnoredAttributeFilter,
    removeIgnoredDateFilter,
    addSection,
    removeSection,
    moveSection,
    changeSectionHeader,
    addSectionItems,
    moveSectionItem,
    removeSectionItem,
    replaceSectionItem,
    replaceWidgetHeader,
    replaceWidgetDescription,
    replaceWidgetDrillWithoutUndo: replaceWidgetDrill, // useful in internal sanitization use cases
    replaceWidgetDrills,
    replaceWidgetBlacklistHierarchies,
    replaceWidgetBlacklistAttributes,
    replaceWidgetDrillDownIntersectionIgnoredAttributes,
    replaceInsightWidgetVisProperties,
    replaceInsightWidgetVisConfiguration,
    replaceInsightWidgetInsight,
    replaceWidgetFilterSettings,
    replaceWidgetDateDataset,
    replaceKpiWidgetMeasure,
    replaceKpiWidgetComparison,
    replaceKpiWidgetDrillWithoutUndo: replaceWidgetDrill, // useful in internal sanitization use cases
    replaceKpiWidgetDrill,
    replaceKpiWidgetConfiguration,
    replaceRichTextWidgetContent,
    addVisualizationSwitcherWidgetVisualization,
    updateVisualizationSwitcherWidgetVisualizations,
    undoLayout: adaptLayoutReducer(undoReducer),
    clearLayoutHistory: adaptLayoutReducer((state: Draft<LayoutState>, _action: PayloadAction<void>) => {
        resetUndoReducer(state);
    }),
    changeItemsHeight,
    changeItemWidth,
    changeWidgetIgnoreCrossFiltering,
    resizeVisualizationSwitcherOnInsightChanged,
    toggleLayoutSectionHeaders,
    toggleLayoutDirection,
    updateHeightOfMultipleItems,
    updateWidthOfMultipleItems,
};
