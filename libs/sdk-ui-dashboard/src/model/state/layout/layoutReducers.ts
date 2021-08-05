// (C) 2021 GoodData Corporation
import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { LayoutState } from "./layoutState";
import {
    IDashboardFilterReference,
    IDashboardLayout,
    IDashboardLayoutSectionHeader,
    InsightDrillDefinition,
    isInsightWidget,
    isKpiWidget,
} from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import { undoReducer, withUndo } from "../_infra/undoEnhancer";
import {
    ExtendedDashboardItem,
    ExtendedDashboardLayoutSection,
    RelativeIndex,
    StashedDashboardItemsId,
} from "../../types/layoutTypes";
import { addArrayElements, moveArrayElement, removeArrayElement } from "../../utils/arrayOps";
import { areObjRefsEqual, ObjRef, VisualizationProperties } from "@gooddata/sdk-model";
import { WidgetHeader } from "../../types/widgetTypes";
import flatMap from "lodash/flatMap";
import { Draft } from "immer";

type LayoutReducer<A> = CaseReducer<LayoutState, PayloadAction<A>>;

//
//
//

const setLayout: LayoutReducer<IDashboardLayout> = (state, action) => {
    state.layout = action.payload;
};

//
// Reducers that manipulate the layout itself - the sections and items
//

type AddSectionActionPayload = {
    section: ExtendedDashboardLayoutSection;
    index: RelativeIndex;
    usedStashes: StashedDashboardItemsId[];
};

const addSection: LayoutReducer<AddSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, section, usedStashes } = action.payload;

    addArrayElements(state.layout.sections, index, [section]);

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

//
//
//

type RemoveSectionActionPayload = { index: RelativeIndex; stashIdentifier?: StashedDashboardItemsId };

const removeSection: LayoutReducer<RemoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, stashIdentifier } = action.payload;

    if (stashIdentifier) {
        const items = state.layout.sections[index].items;

        state.stash[stashIdentifier] = items;
    }

    removeArrayElement(state.layout.sections, index);
};

//
//
//

type ChangeSectionActionPayload = { index: number; header: IDashboardLayoutSectionHeader };

const changeSectionHeader: LayoutReducer<ChangeSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, header } = action.payload;

    state.layout.sections[index].header = header;
};

//
//
//

type MoveSectionActionPayload = { sectionIndex: number; toIndex: RelativeIndex };

const moveSection: LayoutReducer<MoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, toIndex } = action.payload;

    moveArrayElement(state.layout.sections, sectionIndex, toIndex);
};

//
//
//

type AddSectionItemsActionPayload = {
    sectionIndex: number;
    itemIndex: number;
    items: ExtendedDashboardItem[];
    usedStashes: StashedDashboardItemsId[];
};

const addSectionItems: LayoutReducer<AddSectionItemsActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, itemIndex, items, usedStashes } = action.payload;
    const section = state.layout.sections[sectionIndex];

    invariant(section);

    addArrayElements(section.items, itemIndex, items);

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

//
//
//

type MoveSectionItemActionPayload = {
    sectionIndex: number;
    itemIndex: number;
    toSectionIndex: number;
    toItemIndex: RelativeIndex;
};

const moveSectionItem: LayoutReducer<MoveSectionItemActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, itemIndex, toSectionIndex, toItemIndex } = action.payload;
    const fromSection = state.layout.sections[sectionIndex];
    const toSection = state.layout.sections[toSectionIndex];

    invariant(fromSection);
    invariant(toSection);

    const item = removeArrayElement(fromSection.items, itemIndex);

    invariant(item);

    addArrayElements(toSection.items, toItemIndex, [item]);
};

//
//
//

type RemoveSectionItemActionPayload = {
    sectionIndex: number;
    itemIndex: number;
    stashIdentifier?: StashedDashboardItemsId;
};

const removeSectionItem: LayoutReducer<RemoveSectionItemActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, itemIndex, stashIdentifier } = action.payload;
    const section = state.layout.sections[sectionIndex];

    invariant(section);

    const item = removeArrayElement(section.items, itemIndex);

    invariant(item);

    if (stashIdentifier) {
        state.stash[stashIdentifier] = [item];
    }
};

//
//
//

type ReplaceSectionItemActionPayload = {
    sectionIndex: number;
    itemIndex: number;
    newItems: ExtendedDashboardItem[];
    stashIdentifier?: StashedDashboardItemsId;
    usedStashes: StashedDashboardItemsId[];
};

const replaceSectionItem: LayoutReducer<ReplaceSectionItemActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, itemIndex, newItems, stashIdentifier, usedStashes } = action.payload;
    const section = state.layout.sections[sectionIndex];

    invariant(section);

    const item = removeArrayElement(section.items, itemIndex);

    invariant(item);

    if (stashIdentifier) {
        state.stash[stashIdentifier] = [item];
    }

    addArrayElements(section.items, itemIndex, newItems);

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

const getWidgetByRef = (state: Draft<LayoutState>, widgetRef: ObjRef) => {
    const allWidgets = flatMap(state?.layout?.sections, (section) =>
        section.items.map((item) => item.widget),
    );

    const widget = allWidgets.find((w) => {
        // defer type checks until the actual widget is found
        const ref: ObjRef | undefined = w && (w as any).ref;

        return ref && areObjRefsEqual(ref, widgetRef);
    });
    return widget;
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

type ReplaceWidgetVisProperties = {
    ref: ObjRef;
    properties: VisualizationProperties | undefined;
};

const replaceInsightWidgetVisProperties: LayoutReducer<ReplaceWidgetVisProperties> = (state, action) => {
    invariant(state.layout);

    const { properties, ref } = action.payload;
    const widget = getWidgetByRef(state, ref);

    invariant(widget && isInsightWidget(widget));

    widget.properties = properties;
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

    invariant(widget && (isInsightWidget(widget) || isKpiWidget(widget)));

    widget.dateDataSet = dateDataSet;
    widget.ignoreDashboardFilters = ignoreDashboardFilters ?? [];
};

//
//
//

export const layoutReducers = {
    setLayout,
    addSection: withUndo(addSection),
    removeSection: withUndo(removeSection),
    moveSection: withUndo(moveSection),
    changeSectionHeader: withUndo(changeSectionHeader),
    addSectionItems: withUndo(addSectionItems),
    moveSectionItem: withUndo(moveSectionItem),
    removeSectionItem: withUndo(removeSectionItem),
    replaceSectionItem: withUndo(replaceSectionItem),
    replaceWidgetHeader: withUndo(replaceWidgetHeader),
    replaceWidgetDrills: withUndo(replaceWidgetDrill),
    replaceInsightWidgetVisProperties: withUndo(replaceInsightWidgetVisProperties),
    replaceWidgetFilterSettings: withUndo(replaceWidgetFilterSettings),
    undoLayout: undoReducer,
};
