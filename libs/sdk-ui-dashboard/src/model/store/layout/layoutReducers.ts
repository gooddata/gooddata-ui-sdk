// (C) 2021-2025 GoodData Corporation
import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";
import { Draft } from "immer";
import {
    areObjRefsEqual,
    ObjRef,
    VisualizationProperties,
    IDashboardFilterReference,
    isDashboardDateFilterReference,
    InsightDrillDefinition,
    isKpiWidget,
    isInsightWidget,
    IDashboardLayout,
    IDashboardLayoutSectionHeader,
    IKpiComparisonDirection,
    IKpiComparisonTypeComparison,
    IDrillToLegacyDashboard,
    IInsightWidgetConfiguration,
    IKpiWidgetConfiguration,
    IDrillDownReference,
    isDashboardAttributeFilterReference,
    isRichTextWidget,
    IDrillDownIntersectionIgnoredAttributes,
    IInsightWidget,
    isVisualizationSwitcherWidget,
    isDashboardLayout,
    IDashboardLayoutSection,
    ScreenSize,
    isDashboardLayoutItem,
    IDashboardLayoutContainerDirection,
} from "@gooddata/sdk-model";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import { WidgetDescription, WidgetHeader } from "../../types/widgetTypes.js";
import { newMapForObjectWithIdentity, ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import { IdentityMapping } from "../../../_staging/dashboard/dashboardLayout.js";
import { setOrDelete } from "../../../_staging/objectUtils/setOrDelete.js";
import { ILayoutSectionPath, ILayoutItemPath } from "../../../types.js";
import { findSections, findSection, findItem, getItemIndex } from "../../../_staging/layout/coordinates.js";
import { resetUndoReducer, undoReducer, withUndo } from "../_infra/undoEnhancer.js";
import {
    ExtendedDashboardItem,
    ExtendedDashboardLayoutSection,
    ExtendedDashboardWidget,
    StashedDashboardItemsId,
    isCustomWidget,
    IItemWithHeight,
} from "../../types/layoutTypes.js";
import { addArrayElements, removeArrayElement } from "../../utils/arrayOps.js";

import { LayoutState } from "./layoutState.js";
import { getWidgetCoordinatesAndItem, resizeInsightWidget } from "./layoutUtils.js";

type LayoutReducer<A> = CaseReducer<LayoutState, PayloadAction<A>>;

//
//
//

const setLayout: LayoutReducer<IDashboardLayout<ExtendedDashboardWidget>> = (state, action) => {
    state.layout = action.payload;

    resetUndoReducer(state);
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
    invariant(state.layout);

    recurseLayoutAndUpdateWidgetIds(state.layout, action.payload);
};

//
// Reducers that manipulate the layout itself - the sections and items
//

type AddSectionActionPayload = {
    section: ExtendedDashboardLayoutSection;
    index: ILayoutSectionPath;
    usedStashes: StashedDashboardItemsId[];
};

const addSection: LayoutReducer<AddSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, section, usedStashes } = action.payload;
    const sections = findSections(state.layout, index);

    addArrayElements(sections, index.sectionIndex, [section]);

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

//
//
//

type RemoveSectionActionPayload = { index: ILayoutSectionPath; stashIdentifier?: StashedDashboardItemsId };

const removeSection: LayoutReducer<RemoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, stashIdentifier } = action.payload;

    if (stashIdentifier) {
        state.stash[stashIdentifier] = findSection(state.layout, index).items;
    }

    const sections = findSections(state.layout, index);
    removeArrayElement(sections, index.sectionIndex);
};

//
//
//

type ChangeSectionActionPayload = { index: ILayoutSectionPath; header: IDashboardLayoutSectionHeader };

const changeSectionHeader: LayoutReducer<ChangeSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, header } = action.payload;

    findSection(state.layout, index).header = header;
};

//
//
//

type ToggleLayoutSectionHeadersPayload = {
    layoutPath: ILayoutItemPath | undefined;
    enableSectionHeaders: boolean;
};

const toggleLayoutSectionHeaders: LayoutReducer<ToggleLayoutSectionHeadersPayload> = (state, action) => {
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

type ToggleLayoutDirectionPayload = {
    layoutPath: ILayoutItemPath | undefined;
    direction: IDashboardLayoutContainerDirection;
};

const toggleLayoutDirection: LayoutReducer<ToggleLayoutDirectionPayload> = (state, action) => {
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

//
//
//

type changeItemsHeightActionPayload = {
    sectionIndex: ILayoutSectionPath;
    itemIndexes: number[];
    height: number;
};

const changeItemsHeight: LayoutReducer<changeItemsHeightActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, itemIndexes, height } = action.payload;

    const section = findSection(state.layout, sectionIndex);
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
    invariant(state.layout);
    const rootLayout = state.layout;
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

//
//
//

type changeItemWidthActionPayload = { layoutPath: ILayoutItemPath; width: number };

const changeItemWidth: LayoutReducer<changeItemWidthActionPayload> = (state, action) => {
    invariant(state.layout);

    const { layoutPath, width } = action.payload;

    const item = findItem(state.layout, layoutPath);

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

const moveSection: LayoutReducer<MoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, toIndex } = action.payload;

    const originalSections = findSections(state.layout, sectionIndex);
    const movedSection = removeArrayElement(originalSections, sectionIndex.sectionIndex);

    const targetSections = findSections(state.layout, toIndex);
    addArrayElements(targetSections, toIndex.sectionIndex, [movedSection]);
};

//
//
//

type AddSectionItemsActionPayload = {
    layoutPath: ILayoutItemPath;
    items: ExtendedDashboardItem[];
    usedStashes: StashedDashboardItemsId[];
};

const addSectionItems: LayoutReducer<AddSectionItemsActionPayload> = (state, action) => {
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

//
//
//

type MoveSectionItemActionPayload = {
    itemIndex: ILayoutItemPath;
    toItemIndex: ILayoutItemPath;
};

const moveSectionItem: LayoutReducer<MoveSectionItemActionPayload> = (state, action) => {
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

//
//
//

type RemoveSectionItemActionPayload = {
    itemIndex: ILayoutItemPath;
    stashIdentifier?: StashedDashboardItemsId;
};

const removeSectionItem: LayoutReducer<RemoveSectionItemActionPayload> = (state, action) => {
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

//
//
//

type ReplaceSectionItemActionPayload = {
    layoutPath: ILayoutItemPath;
    newItems: ExtendedDashboardItem[];
    stashIdentifier?: StashedDashboardItemsId;
    usedStashes: StashedDashboardItemsId[];
};

const replaceSectionItem: LayoutReducer<ReplaceSectionItemActionPayload> = (state, action) => {
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
// Layout-widget specific reducers
//

const processSection = (section: IDashboardLayoutSection<ExtendedDashboardWidget>) => {
    return section.items.flatMap((item) => {
        let result: typeof item.widget[] = [];
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
    const widgets = allWidgets.filter(Boolean) as NonNullable<typeof allWidgets[number]>[];
    return newMapForObjectWithIdentity(widgets).get(widgetRef);
};

//
//
//

type ReplaceWidgetHeader = {
    ref: ObjRef;
    header: WidgetHeader;
};

const replaceWidgetHeader: LayoutReducer<ReplaceWidgetHeader> = (state, action) => {
    invariant(state.layout);

    const { header, ref } = action.payload;

    const widget = getWidgetByRef(state, ref);

    // this means command handler did not correctly validate that the widget exists before dispatching the
    // reducer action
    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.title = header.title ?? "";
};

//
//
//

type ReplaceWidgetDescription = {
    ref: ObjRef;
    description: WidgetDescription;
};

const replaceWidgetDescription: LayoutReducer<ReplaceWidgetDescription> = (state, action) => {
    invariant(state.layout);

    const { description, ref } = action.payload;

    const widget = getWidgetByRef(state, ref);

    // this means command handler did not correctly validate that the widget exists before dispatching the
    // reducer action
    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.description = description.description ?? "";
};

//
//
//

type ReplaceWidgetDrillDefinitions = {
    ref: ObjRef;
    drillDefinitions: InsightDrillDefinition[];
};

const replaceWidgetDrill: LayoutReducer<ReplaceWidgetDrillDefinitions> = (state, action) => {
    invariant(state.layout);

    const { drillDefinitions, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    // this means command handler did not correctly validate that the widget exists before dispatching the
    // reducer action
    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.drills = drillDefinitions ?? [];
};

//
//
//

type ReplaceWidgetBlacklistHierarchies = {
    ref: ObjRef;
    blacklistHierarchies: IDrillDownReference[];
};

//
const replaceWidgetBlacklistHierarchies: LayoutReducer<ReplaceWidgetBlacklistHierarchies> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { blacklistHierarchies, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.ignoredDrillDownHierarchies = blacklistHierarchies ?? [];
};

//
//
//

type ReplaceWidgetDrillDownIntersectionIgnoredAttributes = {
    ref: ObjRef;
    ignoredDrillDownIntersectionIgnoredAttributes: IDrillDownIntersectionIgnoredAttributes[];
};

//
const replaceWidgetDrillDownIntersectionIgnoredAttributes: LayoutReducer<
    ReplaceWidgetDrillDownIntersectionIgnoredAttributes
> = (state, action) => {
    invariant(state.layout);

    const { ignoredDrillDownIntersectionIgnoredAttributes, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isKpiWidget(widget) || isInsightWidget(widget)));

    widget.drillDownIntersectionIgnoredAttributes = ignoredDrillDownIntersectionIgnoredAttributes ?? [];
};

//
//
//

type ReplaceWidgetVisProperties = {
    ref: ObjRef;
    properties: VisualizationProperties | undefined;
};

const replaceInsightWidgetVisProperties: LayoutReducer<ReplaceWidgetVisProperties> = (state, action) => {
    invariant(state.layout);

    const { properties, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isInsightWidget(widget));
    setOrDelete(widget, "properties", properties);
};

//
//
//

type ReplaceWidgetVisConfiguration = {
    ref: ObjRef;
    config: IInsightWidgetConfiguration | undefined;
};

const replaceInsightWidgetVisConfiguration: LayoutReducer<ReplaceWidgetVisConfiguration> = (
    state,
    action,
) => {
    invariant(state.layout);

    const { config, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isInsightWidget(widget));
    setOrDelete(widget, "configuration", config);
};

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

const replaceInsightWidgetInsight: LayoutReducer<ReplaceWidgetInsight> = (state, action) => {
    invariant(state.layout, "State of layout is empty");

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

//
//
//

type ReplaceWidgetFilterSettings = {
    ref: ObjRef;
    ignoreDashboardFilters?: IDashboardFilterReference[];
    dateDataSet?: ObjRef;
};

const replaceWidgetFilterSettings: LayoutReducer<ReplaceWidgetFilterSettings> = (state, action) => {
    invariant(state.layout);

    const { ignoreDashboardFilters, dateDataSet, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isInsightWidget(widget) || isKpiWidget(widget) || isRichTextWidget(widget)));

    widget.dateDataSet = dateDataSet;
    widget.ignoreDashboardFilters = ignoreDashboardFilters ?? [];
};

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
    invariant(state.layout);

    removeIgnoredAttributeFilterFromLayout(state.layout, action.payload.displayFormRefs);
};

//
//
//

type ReplaceWidgetDateDataset = {
    ref: ObjRef;
    dateDataSet?: ObjRef;
};

const replaceWidgetDateDataset: LayoutReducer<ReplaceWidgetDateDataset> = (state, action) => {
    invariant(state.layout);

    const { dateDataSet, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isInsightWidget(widget) || isKpiWidget(widget)));

    widget.dateDataSet = dateDataSet;
};
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
    invariant(state.layout);

    removeIgnoredDateFilterFromLayout(state.layout, action.payload.dateDataSets);
};

//
//
//

type ReplaceKpiWidgetMeasure = {
    ref: ObjRef;
    measureRef: ObjRef;
};

const replaceKpiWidgetMeasure: LayoutReducer<ReplaceKpiWidgetMeasure> = (state, action) => {
    invariant(state.layout);

    const { ref, measureRef } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));

    widget.kpi.metric = measureRef;
};

//
//
//

type ReplaceKpiWidgetComparison = {
    ref: ObjRef;
    comparisonType: IKpiComparisonTypeComparison;
    comparisonDirection?: IKpiComparisonDirection;
};

const replaceKpiWidgetComparison: LayoutReducer<ReplaceKpiWidgetComparison> = (state, action) => {
    invariant(state.layout);

    const { ref, comparisonType, comparisonDirection } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));

    widget.kpi.comparisonType = comparisonType;
    widget.kpi.comparisonDirection = comparisonDirection;
};

//
//
//

type ReplaceKpiWidgetDrill = {
    ref: ObjRef;
    drill: IDrillToLegacyDashboard | undefined;
};

const replaceKpiWidgetDrill: LayoutReducer<ReplaceKpiWidgetDrill> = (state, action) => {
    invariant(state.layout);

    const { ref, drill } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));

    widget.drills = drill ? [drill] : [];
};

//
//
//

type ReplaceKpiWidgetConfiguration = {
    ref: ObjRef;
    config: IKpiWidgetConfiguration | undefined;
};

const replaceKpiWidgetConfiguration: LayoutReducer<ReplaceKpiWidgetConfiguration> = (state, action) => {
    invariant(state.layout);

    const { config, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isKpiWidget(widget));
    setOrDelete(widget, "configuration", config);
};

//
//
//

type ReplaceRichTextWidgetContent = {
    ref: ObjRef;
    content: string;
};

const replaceRichTextWidgetContent: LayoutReducer<ReplaceRichTextWidgetContent> = (state, action) => {
    invariant(state.layout);

    const { content, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isRichTextWidget(widget));
    setOrDelete(widget, "content", content);
};

type ChangeWidgetIgnoreCrossFiltering = {
    ref: ObjRef;
    ignoreCrossFiltering?: boolean;
};

const changeWidgetIgnoreCrossFiltering: LayoutReducer<ChangeWidgetIgnoreCrossFiltering> = (state, action) => {
    invariant(state.layout);

    const { ignoreCrossFiltering, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && (isInsightWidget(widget) || isKpiWidget(widget)));

    widget.ignoreCrossFiltering = ignoreCrossFiltering;
};

//
//
//

type AddVisualizationSwitcherWidgetVisualization = {
    ref: ObjRef;
    visualization: IInsightWidget;
    newSize?: IVisualizationSizeInfo;
};

const addVisualizationSwitcherWidgetVisualization: LayoutReducer<
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

type UpdateVisualizationSwitcherWidgetVisualizations = {
    ref: ObjRef;
    visualizations: IInsightWidget[];
};

const updateVisualizationSwitcherWidgetVisualizations: LayoutReducer<
    UpdateVisualizationSwitcherWidgetVisualizations
> = (state, action) => {
    invariant(state.layout);

    const { visualizations, ref } = action.payload;
    const widgetRef = getWidgetByRef(state, ref);

    invariant(widgetRef && isVisualizationSwitcherWidget(widgetRef));

    widgetRef.visualizations = visualizations;
};

type ResizeVisualizationSwitcherOnInsightChanged = {
    ref: ObjRef;
    newSize?: IVisualizationSizeInfo;
};

const resizeVisualizationSwitcherOnInsightChanged: LayoutReducer<
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

//
// Reducers that manipulate the layout itself - the sections and items
//

type SetScreenActionPayload = {
    screen: ScreenSize;
};

const setScreen: LayoutReducer<SetScreenActionPayload> = (state, action) => {
    state.screen = action.payload.screen;
};

export const layoutReducers = {
    setLayout,
    setScreen,
    updateWidgetIdentities,
    removeIgnoredAttributeFilter,
    removeIgnoredDateFilter,
    addSection: withUndo(addSection),
    removeSection: withUndo(removeSection),
    moveSection: withUndo(moveSection),
    changeSectionHeader: withUndo(changeSectionHeader),
    addSectionItems: withUndo(addSectionItems),
    moveSectionItem: withUndo(moveSectionItem),
    removeSectionItem: withUndo(removeSectionItem),
    replaceSectionItem: withUndo(replaceSectionItem),
    replaceWidgetHeader: withUndo(replaceWidgetHeader),
    replaceWidgetDescription: withUndo(replaceWidgetDescription),
    replaceWidgetDrillWithoutUndo: replaceWidgetDrill, // useful in internal sanitization use cases
    replaceWidgetDrills: withUndo(replaceWidgetDrill),
    replaceWidgetBlacklistHierarchies: withUndo(replaceWidgetBlacklistHierarchies),
    replaceWidgetDrillDownIntersectionIgnoredAttributes: withUndo(
        replaceWidgetDrillDownIntersectionIgnoredAttributes,
    ),
    replaceInsightWidgetVisProperties: withUndo(replaceInsightWidgetVisProperties),
    replaceInsightWidgetVisConfiguration: withUndo(replaceInsightWidgetVisConfiguration),
    replaceInsightWidgetInsight: withUndo(replaceInsightWidgetInsight),
    replaceWidgetFilterSettings: withUndo(replaceWidgetFilterSettings),
    replaceWidgetDateDataset: withUndo(replaceWidgetDateDataset),
    replaceKpiWidgetMeasure: withUndo(replaceKpiWidgetMeasure),
    replaceKpiWidgetComparison: withUndo(replaceKpiWidgetComparison),
    replaceKpiWidgetDrillWithoutUndo: replaceKpiWidgetDrill, // useful in internal sanitization use cases
    replaceKpiWidgetDrill: withUndo(replaceKpiWidgetDrill),
    replaceKpiWidgetConfiguration: withUndo(replaceKpiWidgetConfiguration),
    replaceRichTextWidgetContent: withUndo(replaceRichTextWidgetContent),
    addVisualizationSwitcherWidgetVisualization: withUndo(addVisualizationSwitcherWidgetVisualization),
    updateVisualizationSwitcherWidgetVisualizations: withUndo(
        updateVisualizationSwitcherWidgetVisualizations,
    ),
    undoLayout: undoReducer,
    clearLayoutHistory: resetUndoReducer,
    changeItemsHeight: changeItemsHeight,
    changeItemWidth: changeItemWidth,
    changeWidgetIgnoreCrossFiltering: withUndo(changeWidgetIgnoreCrossFiltering),
    resizeVisualizationSwitcherOnInsightChanged: withUndo(resizeVisualizationSwitcherOnInsightChanged),
    toggleLayoutSectionHeaders: withUndo(toggleLayoutSectionHeaders),
    toggleLayoutDirection: withUndo(toggleLayoutDirection),
    updateHeightOfMultipleItems,
};
