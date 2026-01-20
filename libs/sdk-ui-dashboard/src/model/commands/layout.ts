// (C) 2021-2026 GoodData Corporation

import {
    type IDashboardLayoutContainerDirection,
    type IDashboardLayoutSectionHeader,
    type ObjRef,
    type ScreenSize,
} from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";
import { type ILayoutItemPath, type ILayoutSectionPath } from "../../types.js";
import {
    type DashboardItemDefinition,
    type RelativeIndex,
    type StashedDashboardItemsId,
} from "../types/layoutTypes.js";

/**
 * Payload of the {@link IAddLayoutSection} command.
 * @beta
 */
export interface IAddLayoutSectionPayload {
    /**
     * Index where to place the new section
     *
     * @remarks
     * Index is zero-based and for convenience index -1 means place new section at the end. 0 means place new
     * section at the beginning. Both 0 and -1 and can be used when inserting the first section into and empty layout.
     *
     * {@link RelativeIndex} support will be removed in the next major SDK version. Use {@link ILayoutSectionPath} instead.
     *
     * TODO LX-648: Remove RelativeIndex type in the next major version.
     */
    readonly index: RelativeIndex | ILayoutSectionPath;

    /**
     * Specify the section header.
     */
    readonly initialHeader?: IDashboardLayoutSectionHeader;

    /**
     * Specify one or more items to include in the newly created section.
     */
    readonly initialItems?: DashboardItemDefinition[];

    /**
     * Specify whether dashboard should auto-resolve date dataset to use for date filtering of KPI
     * and insight widgets.
     *
     * @remarks
     * This is by default disabled. Meaning date filtering will be enabled only for those KPI or Insight widgets
     * that already specify dateDataset. Those that have dateDataset `undefined` will not be filtered by dashboard's
     * date filter.
     *
     * When you turn on this option, then the dashboard will automatically resolve date dataset for those
     * KPI and Insight widgets that have it `undefined`.
     */
    readonly autoResolveDateFilterDataset?: boolean;
}

/**
 * @beta
 */
export interface IAddLayoutSection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION";
    readonly payload: IAddLayoutSectionPayload;
}

/**
 * Creates the AddLayoutSection command.
 *
 * @remarks
 * Dispatching this command will result in the addition of a new layout section.
 * The new section will be placed at the desired index and will be empty by default.
 *
 * You may optionally specify the initial values of the section header and the items that will be in the new section.
 *
 * This command operates only on the root layout. For nested layouts, use {@link addNestedLayoutSection}.
 *
 * @param index - index to place the section at; -1 can be used as convenience to append a new section
 * @param initialHeader - specify header for the newly created section
 * @param initialItems - specify one or more items that the newly created section should include from the get-go
 * @param autoResolveDateFilterDataset - specify whether dashboard should auto-resolve date dataset to use for date filtering of KPI
 *  and insight widgets; default is disabled meaning date filtering will be enabled only for those KPI or Insight widgets
 *  that already specify dateDataset.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function addLayoutSection(
    index: number,
    initialHeader?: IDashboardLayoutSectionHeader,
    initialItems?: DashboardItemDefinition[],
    autoResolveDateFilterDataset?: boolean,
    correlationId?: string,
): IAddLayoutSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION",
        correlationId,
        payload: {
            index,
            initialHeader,
            initialItems,
            autoResolveDateFilterDataset,
        },
    };
}

/**
 * Creates the AddLayoutSection command.
 *
 * @remarks
 * Dispatching this command will result in the addition of a new layout section.
 * The new section will be placed at the desired index and will be empty by default.
 *
 * You may optionally specify the initial values of the section header and the items that will be in the new section.
 *
 * @param index - index to place the section at; -1 can be used as convenience to append a new section
 * @param initialHeader - specify header for the newly created section
 * @param initialItems - specify one or more items that the newly created section should include from the get-go
 * @param autoResolveDateFilterDataset - specify whether dashboard should auto-resolve date dataset to use for date filtering of KPI
 *  and insight widgets; default is disabled meaning date filtering will be enabled only for those KPI or Insight widgets
 *  that already specify dateDataset.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
// eslint-disable-next-line sonarjs/no-identical-functions
export function addNestedLayoutSection(
    index: ILayoutSectionPath,
    initialHeader?: IDashboardLayoutSectionHeader,
    initialItems?: DashboardItemDefinition[],
    autoResolveDateFilterDataset?: boolean,
    correlationId?: string,
): IAddLayoutSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION",
        correlationId,
        payload: {
            index,
            initialHeader,
            initialItems,
            autoResolveDateFilterDataset,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IMoveLayoutSection} command.
 * @beta
 */
export interface IMoveLayoutSectionPayload {
    /**
     * Index of the section to move.
     *
     * Index is zero-based.
     *
     * @remarks
     * "number" support will be removed in the next major SDK version. Use {@link ILayoutSectionPath} instead.
     *
     * TODO LX-648: Remove number type in the next major version.
     */
    readonly sectionIndex: number | ILayoutSectionPath;

    /**
     * Index where the section should be moved.
     *
     * Index is zero-based. For convenience index of -1 means moving the item to the end of the section list.
     *
     * @remarks
     * "number" support will be removed in the next major SDK version. Use {@link ILayoutSectionPath} instead.
     *
     * TODO LX-648: Remove number type in the next major version.
     */
    readonly toIndex: number | ILayoutSectionPath;
}

/**
 * @beta
 */
export interface IMoveLayoutSection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION";
    readonly payload: IMoveLayoutSectionPayload;
}

/**
 * Creates the MoveLayoutSection command. Dispatching this command will result in move of the section located at `sectionIndex`
 * to a new place indicated by `toIndex`.
 *
 * @remarks
 * This command operates only on the root layout. For nested layouts, use {@link moveNestedLayoutSection}.
 *
 * @param sectionIndex - index of section to move
 * @param toIndex - the new index for the section
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function moveLayoutSection(
    sectionIndex: number,
    toIndex: number,
    correlationId?: string,
): IMoveLayoutSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION",
        correlationId,
        payload: {
            sectionIndex,
            toIndex,
        },
    };
}

/**
 * Creates the MoveLayoutSection command. Dispatching this command will result in move of the section located at `sectionIndex`
 * to a new place indicated by `toIndex`.
 *
 * @param sectionIndex - index of section to move
 * @param toIndex - the new index for the section
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
// eslint-disable-next-line sonarjs/no-identical-functions
export function moveNestedLayoutSection(
    sectionIndex: ILayoutSectionPath,
    toIndex: ILayoutSectionPath,
    correlationId?: string,
): IMoveLayoutSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION",
        correlationId,
        payload: {
            sectionIndex,
            toIndex,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IRemoveLayoutSection} command.
 * @beta
 */
export interface IRemoveLayoutSectionPayload {
    /**
     * Index of section to remove.
     *
     * Zero based. For convenience -1 can be used to remove the last section.
     *
     * @remarks
     * {@link RelativeIndex} support will be removed in the next major SDK version. Use {@link ILayoutSectionPath} instead.
     *
     * TODO LX-648: Remove RelativeIndex type in the next major version.
     */
    readonly index: RelativeIndex | ILayoutSectionPath;

    /**
     * Specify stash identifier.
     *
     * @remarks
     * If provided, the items from the removed section will not be
     * permanently removed but will be stored in the stash under this identifier. You can then
     * use the stash identifier to 'resurrect' the items in different section.
     *
     * Default behavior with no stashIdentifier is to also remove all items in the section.
     */
    readonly stashIdentifier?: StashedDashboardItemsId;
}

/**
 * @beta
 */
export interface IRemoveLayoutSection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION";
    readonly payload: IRemoveLayoutSectionPayload;
}

/**
 * Creates the RemoveLayoutSection command.
 *
 * @remarks
 * Dispatching this command will result in removal of the entire dashboard
 * section. You can optionally specify that the items in the section should not be physically removed but instead be
 * stashed for later 'resurrection'.
 *
 * This command operates only on the root layout. For nested layouts, use {@link removeNestedLayoutSection}.
 *
 * @param index - index of section to remove
 * @param stashIdentifier - specify identifier to stash items under; if you do not specify this, then the dashboard items in the removed section will also be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function removeLayoutSection(
    index: number,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveLayoutSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION",
        correlationId,
        payload: {
            index,
            stashIdentifier,
        },
    };
}

/**
 * Creates the RemoveLayoutSection command.
 *
 * @remarks
 * Dispatching this command will result in removal of the entire dashboard
 * section. You can optionally specify that the items in the section should not be physically removed but instead be
 * stashed for later 'resurrection'.
 *
 * @param index - index of section to remove
 * @param stashIdentifier - specify identifier to stash items under; if you do not specify this, then the dashboard items in the removed section will also be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
// eslint-disable-next-line sonarjs/no-identical-functions
export function removeNestedLayoutSection(
    index: ILayoutSectionPath,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveLayoutSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION",
        correlationId,
        payload: {
            index,
            stashIdentifier,
        },
    };
}

//
//
//

/**
 * Payload of the {@link ChangeLayoutSectionHeader} command.
 * @public
 */
export type ChangeLayoutSectionHeaderPayload = {
    /**
     * Index of section whose header to set.
     *
     * @remarks
     * Index is zero based. Exact index must be provided.
     *
     * "number" support will be removed in the next major SDK version. Use {@link ILayoutSectionPath} instead.
     *
     * TODO LX-648: Remove number type in the next major version.
     */
    readonly index: number | ILayoutSectionPath;

    /**
     * New value of the header.
     */
    readonly header: IDashboardLayoutSectionHeader;

    /**
     * Indicate that the old header and the new header should be merged.
     *
     * @remarks
     * The default behavior is to overwrite the old header with the new header provided in this command.
     */
    readonly merge?: boolean;
};

/**
 * @public
 */
export type ChangeLayoutSectionHeader = IDashboardCommand & {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER";
    readonly payload: ChangeLayoutSectionHeaderPayload;
};

/**
 * Creates the ChangeLayoutSectionHeader command.
 *
 * @remarks
 * Dispatching this command will result in change of the section's title and/or description.
 *
 * This command operates only on the root layout. For nested layouts, use {@link changeNestedLayoutSectionHeader}.
 *
 * @param index - index of section to change
 * @param header - new header
 * @param merge - indicates whether the old header and the new header should be merged; default is no merging
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @public
 */
export function changeLayoutSectionHeader(
    index: number,
    header: IDashboardLayoutSectionHeader,
    merge?: boolean,
    correlationId?: string,
): ChangeLayoutSectionHeader {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER",
        correlationId,
        payload: {
            index,
            header,
            merge,
        },
    };
}

/**
 * Creates the ChangeLayoutSectionHeader command.
 *
 * @remarks
 * Dispatching this command will result in change of the section's title and/or description.
 *
 * @param index - index of section to change
 * @param header - new header
 * @param merge - indicates whether the old header and the new header should be merged; default is no merging
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
// eslint-disable-next-line sonarjs/no-identical-functions
export function changeNestedLayoutSectionHeader(
    index: ILayoutSectionPath,
    header: IDashboardLayoutSectionHeader,
    merge?: boolean,
    correlationId?: string,
): ChangeLayoutSectionHeader {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER",
        correlationId,
        payload: {
            index,
            header,
            merge,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IAddSectionItems} command.
 * @beta
 */
export interface IAddSectionItemsPayload {
    /**
     * Section to which the item should be added.
     *
     * @remarks
     * Index is zero-based.
     *
     * {@link IAddSectionItemsPayload.sectionIndex} support will be removed in the next major SDK version. Use {@link IAddSectionItemsPayload.itemPath} instead.
     *
     * TODO LX-648: Remove sectionIndex in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index within section items where the item should be inserted.
     *
     * @remarks
     * Index is zero-based. For convenience, you may specify -1 to append the new item.
     *
     * {@link IAddSectionItemsPayload.itemIndex} support will be removed in the next major SDK version. Use {@link IAddSectionItemsPayload.itemPath} instead.
     *
     * TODO LX-648: Remove itemIndex in the next major version.
     */
    readonly itemIndex: RelativeIndex;
    /**
     * Path to which the item should be added.
     *
     * @remarks
     * Index is zero-based.
     *
     * TODO LX-648: make the prop required
     */
    readonly itemPath?: ILayoutItemPath;

    /**
     * Items to add. This item may be a placeholder for KPI or insight, an actual dashboard widget or a previously
     * stashed dashboard item.
     *
     * @remarks
     * Note: if you use the stashed items identifier, the items will be moved from the stash - you cannot use
     * the stash identifier again.
     */
    readonly items: DashboardItemDefinition[];

    /**
     * Specify whether dashboard should auto-resolve date dataset to use for date filtering of KPI
     * and insight widgets.
     *
     * @remarks
     * This is by default disabled. Meaning date filtering will be enabled only for those KPI or Insight widgets
     * that already specify dateDataset. Those that have dateDataset `undefined` will not be filtered by dashboard's
     * date filter.
     *
     * When you turn on this option, then the dashboard will automatically resolve date dataset for those
     * KPI and Insight widgets that have it `undefined`.
     */
    readonly autoResolveDateFilterDataset?: boolean;
}

/**
 * @beta
 */
export interface IAddSectionItems extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS";
    readonly payload: IAddSectionItemsPayload;
}

/**
 * Creates the AddSectionItems command.
 *
 * @remarks
 * Dispatching this command will result in addition of a new item into the existing
 * section. This item may be a placeholder for KPI or insight, an actual dashboard widget or a previously stashed
 * dashboard item.
 *
 * This command operates only on the root layout. For nested layouts, use {@link addNestedLayoutSectionItem}.
 *
 * @param sectionIndex - index of section to which the new item should be added
 * @param itemIndex - index at which to insert the new item
 * @param item - definition of the new item.
 * @param autoResolveDateFilterDataset - specify whether dashboard should auto-resolve date dataset to use for date filtering of KPI
 *  and insight widgets; default is disabled meaning date filtering will be enabled only for those KPI or Insight widgets
 *  that already specify dateDataset.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function addSectionItem(
    sectionIndex: number,
    itemIndex: number,
    item: DashboardItemDefinition,
    autoResolveDateFilterDataset?: boolean,
    correlationId?: string,
): IAddSectionItems {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            itemPath: undefined as unknown as ILayoutItemPath,
            items: [item],
            autoResolveDateFilterDataset,
        },
    };
}

/**
 * Creates the AddSectionItems command.
 *
 * @remarks
 * Dispatching this command will result in addition of a new item into the existing
 * section. This item may be a placeholder for KPI or insight, an actual dashboard widget or a previously stashed
 * dashboard item.
 *
 * @param itemPath - path to which the new item should be added
 * @param item - definition of the new item.
 * @param autoResolveDateFilterDataset - specify whether dashboard should auto-resolve date dataset to use for date filtering of KPI
 *  and insight widgets; default is disabled meaning date filtering will be enabled only for those KPI or Insight widgets
 *  that already specify dateDataset.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function addNestedLayoutSectionItem(
    itemPath: ILayoutItemPath,
    item: DashboardItemDefinition,
    autoResolveDateFilterDataset?: boolean,
    correlationId?: string,
): IAddSectionItems {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS",
        correlationId: correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            itemPath: itemPath,
            items: [item],
            autoResolveDateFilterDataset,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IReplaceSectionItem} command.
 * @beta
 */
export interface IReplaceSectionItemPayload {
    /**
     * Index of section where the item to modify resides.
     *
     * @remarks
     * {@link IReplaceSectionItemPayload.sectionIndex} support will be removed in the next major SDK version. Use {@link IReplaceSectionItemPayload.itemPath} instead.
     *
     * TODO LX-648: Remove sectionIndex in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index of item within section that should be modified.
     *
     * @remarks
     * {@link IReplaceSectionItemPayload.itemIndex} support will be removed in the next major SDK version. Use {@link IReplaceSectionItemPayload.itemPath} instead.
     *
     * TODO LX-648: Remove itemIndex in the next major version.
     */
    readonly itemIndex: number;

    /**
     * Index where the item to modify resides.
     *
     * TODO LX-648: make the prop required
     */
    readonly itemPath?: ILayoutItemPath;

    /**
     * New item definition.
     */
    readonly item: DashboardItemDefinition;

    /**
     * Specify identifier for stash where the old item should be stored.
     *
     * @remarks
     * If no stashIdentifier provided, then the old item will be thrown away.
     */
    readonly stashIdentifier?: StashedDashboardItemsId;

    /**
     * Specify whether dashboard should auto-resolve date dataset to use for date filtering of the KPI
     * or insight widget that will be used to replace item on a dashboard.
     *
     * @remarks
     * This is by default disabled. Meaning date filtering will be enabled only if the KPI or Insight widget
     * already specifies dateDataset. If the dateDataset is `undefined` the widget will not be filtered
     * by dashboard's date filter.
     *
     * When you turn on this option, then the dashboard will automatically resolve date dataset for those
     * KPI and Insight widgets that have it `undefined`.
     */
    readonly autoResolveDateFilterDataset?: boolean;
}

/**
 * @beta
 */
export interface IReplaceSectionItem extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.REPLACE_ITEM";
    readonly payload: IReplaceSectionItemPayload;
}

/**
 * Creates the ReplaceSectionItem command. Dispatching this command will result in replacement of particular dashboard
 * item with a new item. By default, the old item will be discarded, however you may specify to stash it for later use.
 *
 * @remarks
 * This command operates only on the root layout. For nested layouts, use {@link replaceNestedLayoutSectionItem}.
 *
 * @param sectionIndex - index of section where the item to replace resides
 * @param itemIndex - index of item within the section
 * @param item - new item definition
 * @param stashIdentifier - specify identifier of stash where the old item should be stored
 * @param autoResolveDateFilterDataset - specify whether dashboard should auto-resolve date dataset
 *  to use for date filtering of KPI or insight widget that is replacing the existing item; default is disabled
 *  meaning date filtering will be enabled only for those KPI or Insight widgets that already specify dateDataset.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function replaceSectionItem(
    sectionIndex: number,
    itemIndex: number,
    item: DashboardItemDefinition,
    stashIdentifier?: StashedDashboardItemsId,
    autoResolveDateFilterDataset?: boolean,
    correlationId?: string,
): IReplaceSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REPLACE_ITEM",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            itemPath: undefined as unknown as ILayoutItemPath,
            item,
            stashIdentifier,
            autoResolveDateFilterDataset,
        },
    };
}

/**
 * Creates the ReplaceSectionItem command. Dispatching this command will result in replacement of particular dashboard
 * item with a new item. By default, the old item will be discarded, however you may specify to stash it for later use.
 *
 * @param itemPath - path where the item to replace resides
 * @param item - new item definition
 * @param stashIdentifier - specify identifier of stash where the old item should be stored
 * @param autoResolveDateFilterDataset - specify whether dashboard should auto-resolve date dataset
 *  to use for date filtering of KPI or insight widget that is replacing the existing item; default is disabled
 *  meaning date filtering will be enabled only for those KPI or Insight widgets that already specify dateDataset.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function replaceNestedLayoutSectionItem(
    itemPath: ILayoutItemPath,
    item: DashboardItemDefinition,
    stashIdentifier?: StashedDashboardItemsId,
    autoResolveDateFilterDataset?: boolean,
    correlationId?: string,
): IReplaceSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REPLACE_ITEM",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            itemPath,
            item,
            stashIdentifier,
            autoResolveDateFilterDataset,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IMoveSectionItem} command.
 * @beta
 */
export interface IMoveSectionItemPayload {
    /**
     * Index of the section where the item to move is located.
     *
     * Index is zero-based.
     *
     * @remarks
     * {@link IMoveSectionItemPayload.sectionIndex} support will be removed in the next major SDK version. Use {@link IMoveSectionItemPayload.fromPath} instead.
     *
     * TODO LX-648: Remove sectionIndex in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index of section item that should be moved.
     *
     * Index is zero-based.
     *
     * @remarks
     * {@link IMoveSectionItemPayload.itemIndex} support will be removed in the next major SDK version. Use {@link IMoveSectionItemPayload.fromPath} instead.
     *
     * TODO LX-648: Remove itemIndex in the next major version.
     */
    readonly itemIndex: number;

    /**
     * Index of section to which the item should be moved.
     *
     * Index is zero-based. For convenience you may specify -1 to move to last section.
     *
     * @remarks
     * {@link IMoveSectionItemPayload.toSectionIndex} support will be removed in the next major SDK version. Use {@link IMoveSectionItemPayload.toPath} instead.
     *
     * TODO LX-648: Remove toSectionIndex in the next major version.
     */
    readonly toSectionIndex: RelativeIndex;

    /**
     * Index within the target section.
     *
     * Index is zero-based. For convenience you may specify -1 to append the item at the end of the target section's
     * items.
     *
     * @remarks
     * {@link IMoveSectionItemPayload.toItemIndex} support will be removed in the next major SDK version. Use {@link IMoveSectionItemPayload.toPath} instead.
     *
     * TODO LX-648: Remove toItemIndex in the next major version.
     */
    readonly toItemIndex: RelativeIndex;

    /**
     * Path where the item to move is located.
     *
     * Index is zero-based.
     *
     * TODO LX-648: make the prop required
     */
    readonly fromPath?: ILayoutItemPath;

    /**
     * Path to which the item should be moved.
     *
     * Index is zero-based. For convenience, you may specify -1 to move to last section.
     *
     * TODO LX-648: make the prop required
     */
    readonly toPath?: ILayoutItemPath;

    /**
     * If true and original section stays empty after move, then it will be removed.
     */
    readonly removeOriginalSectionIfEmpty: boolean;
}

/**
 * @beta
 */
export interface IMoveSectionItem extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM";
    readonly payload: IMoveSectionItemPayload;
}

/**
 * Creates the MoveSectionItem command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another.
 *
 * This command operates only on the root layout. For nested layouts, use {@link moveNestedLayoutSectionItem}.
 *
 * @param sectionIndex - source section index
 * @param itemIndex - index of item to move
 * @param toSectionIndex - target section index; you may specify -1 to move to last section
 * @param toItemIndex - index within target section where the item should be inserted; you may specify -1 to append
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function moveSectionItem(
    sectionIndex: number,
    itemIndex: number,
    toSectionIndex: number,
    toItemIndex: number,
    correlationId?: string,
): IMoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            toSectionIndex,
            toItemIndex: toItemIndex,
            fromPath: undefined as unknown as ILayoutItemPath,
            toPath: undefined as unknown as ILayoutItemPath,
            removeOriginalSectionIfEmpty: false,
        },
    };
}

/**
 * Creates the MoveSectionItem command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another.
 *
 * @param fromPath - source item path
 * @param toPath - target path; you may specify -1 to move to last section/to be last item
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function moveNestedLayoutSectionItem(
    fromPath: ILayoutItemPath,
    toPath: ILayoutItemPath,
    correlationId?: string,
): IMoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            toSectionIndex: -1,
            toItemIndex: -1,
            fromPath,
            toPath,
            removeOriginalSectionIfEmpty: false,
        },
    };
}

/**
 * Creates the MoveSectionItem command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another. If original section stays empty after move, then it will be removed.
 *
 * This command operates only on the root layout. For nested layouts, use {@link moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty}.
 *
 * @param sectionIndex - source section index
 * @param itemIndex - index of item to move
 * @param toSectionIndex - target section index; you may specify -1 to move to last section
 * @param toItemIndex - index within target section where the item should be inserted; you may specify -1 to append
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function moveSectionItemAndRemoveOriginalSectionIfEmpty(
    sectionIndex: number,
    itemIndex: number,
    toSectionIndex: number,
    toItemIndex: number,
    correlationId?: string,
): IMoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            toSectionIndex,
            toItemIndex: toItemIndex,
            fromPath: undefined as unknown as ILayoutItemPath,
            toPath: undefined as unknown as ILayoutItemPath,
            removeOriginalSectionIfEmpty: true,
        },
    };
}

/**
 * Creates the MoveSectionItem command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another. If original section stays empty after move, then it will be removed.
 *
 * @param fromPath - source item path
 * @param toPath - target path; you may specify -1 to move to last section/to be last item
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function moveNestedLayoutSectionItemAndRemoveOriginalSectionIfEmpty(
    fromPath: ILayoutItemPath,
    toPath: ILayoutItemPath,
    correlationId?: string,
): IMoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            toSectionIndex: -1,
            toItemIndex: -1,
            fromPath,
            toPath,
            removeOriginalSectionIfEmpty: true,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IMoveSectionItemToNewSection} command.
 * @beta
 */
export interface IMoveSectionItemToNewSectionPayload {
    /**
     * Index of the section where the item to move is located.
     *
     * Index is zero-based.
     *
     * @remarks
     * {@link IMoveSectionItemToNewSectionPayload.sectionIndex} support will be removed in the next major SDK version. Use {@link IMoveSectionItemToNewSectionPayload.itemPath} instead.
     *
     * TODO LX-648: Remove sectionIndex in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index of section item that should be moved.
     *
     * Index is zero-based.
     *
     * @remarks
     * {@link IMoveSectionItemToNewSectionPayload.itemIndex} support will be removed in the next major SDK version. Use {@link IMoveSectionItemToNewSectionPayload.itemPath} instead.
     *
     * TODO LX-648: Remove itemIndex in the next major version.
     */
    readonly itemIndex: number;

    /**
     * Index of section to which should be created and the item should be moved into.
     *
     * Index is zero-based. For convenience you may specify -1 to move to last section.
     *
     * @remarks
     * {@link IMoveSectionItemToNewSectionPayload.toSectionIndex} support will be removed in the next major SDK version. Use {@link IMoveSectionItemToNewSectionPayload.itemPath} instead.
     *
     * TODO LX-648: Remove toSectionIndex in the next major version.
     */
    readonly toSectionIndex: RelativeIndex;

    /**
     * Index where the item to move is located.
     *
     * TODO LX-648: make the prop required
     */
    readonly itemPath?: ILayoutItemPath;

    /**
     * Path of section that should be created and the item should be moved into.
     *
     * Index is zero-based. For convenience, you may specify -1 to move to last section.
     *
     * TODO LX-648: make the prop required
     */
    readonly toSection?: ILayoutSectionPath;

    /**
     * If true and original section stays empty after move, then it will be removed.
     */
    readonly removeOriginalSectionIfEmpty: boolean;
}

/**
 * @beta
 */
export interface IMoveSectionItemToNewSection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM_TO_NEW_SECTION";
    readonly payload: IMoveSectionItemToNewSectionPayload;
}

/**
 * Creates the MoveSectionItemToNewSection command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another.
 *
 * This command operates only on the root layout. For nested layouts, use {@link moveNestedLayoutSectionItemToNewSection}.
 *
 * @param sectionIndex - source section index
 * @param itemIndex - index of item to move
 * @param toSectionIndex - target section index; you may specify -1 to move to last section
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function moveSectionItemToNewSection(
    sectionIndex: number,
    itemIndex: number,
    toSectionIndex: number,
    correlationId?: string,
): IMoveSectionItemToNewSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM_TO_NEW_SECTION",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            toSectionIndex,
            itemPath: undefined as unknown as ILayoutItemPath,
            toSection: undefined as unknown as ILayoutSectionPath,
            removeOriginalSectionIfEmpty: false,
        },
    };
}

/**
 * Creates the MoveSectionItemToNewSection command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another.
 *
 * @param itemPath - source item path
 * @param toSection - target section path; you may specify -1 to move to last section
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function moveNestedLayoutSectionItemToNewSection(
    itemPath: ILayoutItemPath,
    toSection: ILayoutSectionPath,
    correlationId?: string,
): IMoveSectionItemToNewSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM_TO_NEW_SECTION",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            toSectionIndex: -1,
            itemPath,
            toSection,
            removeOriginalSectionIfEmpty: false,
        },
    };
}

/**
 * Creates the MoveSectionItemToNewSection command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another. If original section stays empty after move, then it will be removed.
 *
 * This command operates only on the root layout. For nested layouts, use {@link moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty}.
 *
 * @param sectionIndex - source section index
 * @param itemIndex - index of item to move
 * @param toSectionIndex - target section index; you may specify -1 to move to last section
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty(
    sectionIndex: number,
    itemIndex: number,
    toSectionIndex: number,
    correlationId?: string,
): IMoveSectionItemToNewSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM_TO_NEW_SECTION",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            toSectionIndex,
            itemPath: undefined as unknown as ILayoutItemPath,
            toSection: undefined as unknown as ILayoutSectionPath,
            removeOriginalSectionIfEmpty: true,
        },
    };
}

/**
 * Creates the MoveSectionItemToNewSection command.
 *
 * @remarks
 * Dispatching this command will result in move of single item within
 * section or from one section to another. If original section stays empty after move, then it will be removed.
 *
 * @param itemPath - source item index
 * @param toSection - target section index; you may specify -1 to move to last section
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function moveNestedLayoutSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty(
    itemPath: ILayoutItemPath,
    toSection: ILayoutSectionPath,
    correlationId?: string,
): IMoveSectionItemToNewSection {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM_TO_NEW_SECTION",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            toSectionIndex: -1,
            itemPath,
            toSection,
            removeOriginalSectionIfEmpty: true,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IRemoveSectionItem} command.
 * @beta
 */
export interface IRemoveSectionItemPayload {
    /**
     * Index of the section where the item to move is located.
     *
     * @remarks
     * Index is zero-based.
     *
     * {@link IRemoveSectionItemPayload.sectionIndex} support will be removed in the next major SDK version. Use {@link IRemoveSectionItemPayload.itemPath} instead.
     *
     * TODO LX-648: Remove sectionIndex in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index of section item that should be moved.
     *
     * @remarks
     * Index is zero-based. For convenience you may use index of -1 to remove last item from section.
     *
     * {@link IRemoveSectionItemPayload.itemIndex} support will be removed in the next major SDK version. Use {@link IRemoveSectionItemPayload.itemPath} instead.
     *
     * TODO LX-648: Remove itemIndex in the next major version.
     */
    readonly itemIndex: RelativeIndex;

    /**
     * Index where the item to remove is located.
     *
     * @remarks
     * Index is zero-based.
     *
     * TODO LX-648: make the prop required
     */
    readonly itemPath?: ILayoutItemPath;

    /**
     * Specify stash identifier.
     *
     * @remarks
     * If provided, the item will not be permanently removed but will be
     * stored in the stash under this identifier. You can then use the stash identifier to 'resurrect' the item
     * in different section.
     *
     * Default behavior with no stashIdentifier is to permanently remove the item as well.
     */
    readonly stashIdentifier?: StashedDashboardItemsId;

    /**
     * Specify whether to eagerly remove the entire section if the item being removed was the only
     * item in the section.
     *
     * @remarks
     * Default is false. Meaning an empty section will be left.
     */
    readonly eager?: boolean;
}

/**
 * @beta
 */
export interface IRemoveSectionItem extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM";
    readonly payload: IRemoveSectionItemPayload;
}

/**
 * Creates the RemoveSectionItem command.
 *
 * @remarks
 * Dispatching this command will result in removal
 * of the item from a section. If the removed item was last in the section, the section will be left on the layout
 * and will contain no items.
 *
 * You may optionally specify the stashIdentifier in order to stash the removed item for later resurrection.
 *
 * This command operates only on the root layout. For nested layouts, use {@link removeNestedLayoutSectionItem}.
 *
 * @param sectionIndex - index of section from which to remove the item
 * @param itemIndex - index of item to remove
 * @param stashIdentifier - stash identifier to store the removed item under; if not specified the item will be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function removeSectionItem(
    sectionIndex: number,
    itemIndex: number,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            itemPath: undefined as unknown as ILayoutItemPath,
            stashIdentifier,
            eager: false,
        },
    };
}

/**
 * Creates the RemoveSectionItem command.
 *
 * @remarks
 * Dispatching this command will result in removal
 * of the item from a section. If the removed item was last in the section, the section will be left on the layout
 * and will contain no items.
 *
 * You may optionally specify the stashIdentifier in order to stash the removed item for later resurrection.
 *
 * @param itemPath - index from which to remove the item
 * @param stashIdentifier - stash identifier to store the removed item under; if not specified the item will be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function removeNestedLayoutSectionItem(
    itemPath: ILayoutItemPath,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            itemPath,
            stashIdentifier,
            eager: false,
        },
    };
}

/**
 * Creates the RemoveSectionItem configured to do eager remove of item.
 *
 * @remarks
 * Dispatching this command will result in removal
 * of the item from a section and if the section only contains that item then the whole section will be removed as well.
 *
 * You may optionally specify the stashIdentifier in order to stash the removed item for later resurrection.
 *
 * This command operates only on the root layout. For nested layouts, use {@link eagerRemoveNestedLayoutSectionItem}.
 *
 * @param sectionIndex - index of section from which to remove the item
 * @param itemIndex - index of item to remove
 * @param stashIdentifier - stash identifier to store the removed item under; if not specified the item will be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function eagerRemoveSectionItem(
    sectionIndex: number,
    itemIndex: number,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            itemPath: undefined as unknown as ILayoutItemPath,
            stashIdentifier,
            eager: true,
        },
    };
}

/**
 * Creates the RemoveSectionItem configured to do eager remove of item.
 *
 * @remarks
 * Dispatching this command will result in removal
 * of the item from a section and if the section only contains that item then the whole section will be removed as well.
 *
 * You may optionally specify the stashIdentifier in order to stash the removed item for later resurrection.
 *
 * @param itemPath - path of section from which to remove the item
 * @param stashIdentifier - stash identifier to store the removed item under; if not specified the item will be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function eagerRemoveNestedLayoutSectionItem(
    itemPath: ILayoutItemPath,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveSectionItem {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            itemPath,
            stashIdentifier,
            eager: true,
        },
    };
}

//
//
//

/**
 * Payload of the {@link IRemoveSectionItemByWidgetRef} command.
 * @beta
 */
export interface IRemoveSectionItemByWidgetRefPayload {
    /**
     * Widget reference of the item to remove.
     */
    readonly widgetRef: ObjRef;

    /**
     * Specify stash identifier.
     *
     * @remarks
     * If provided, the item will not be permanently removed but will be
     * stored in the stash under this identifier. You can then use the stash identifier to 'resurrect' the item
     * in different section.
     *
     * Default behavior with no stashIdentifier is to permanently remove the item as well.
     */
    readonly stashIdentifier?: StashedDashboardItemsId;

    /**
     * Specify whether to eagerly remove the entire section if the item being removed was the only
     * item in the section.
     *
     * @remarks
     * Default is false. Meaning an empty section will be left.
     */
    readonly eager?: boolean;
}

/**
 * @beta
 */
export interface IRemoveSectionItemByWidgetRef extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM_BY_WIDGET_REF";
    readonly payload: IRemoveSectionItemByWidgetRefPayload;
}

/**
 * Creates the RemoveSectionItemByWidgetRef command.
 *
 * @remarks
 * Dispatching this command will result in removal
 * of the item from a section. If the removed item was last in the section, the section will be left on the layout
 * and will contain no items.
 *
 * @param widgetRef - widget reference of the item to remove;
 * @param stashIdentifier - stash identifier to store the removed item under; if not specified the item will be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function removeSectionItemByWidgetRef(
    widgetRef: ObjRef,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveSectionItemByWidgetRef {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM_BY_WIDGET_REF",
        correlationId,
        payload: {
            widgetRef,
            stashIdentifier,
            eager: false,
        },
    };
}

/**
 * Creates the RemoveSectionItemByWidgetRef configured to do eager remove of item.
 *
 * @remarks
 * Dispatching this command will result in removal
 * of the item from a section and if the section only contains that item then the whole section will be removed as well.
 *
 * You may optionally specify the stashIdentifier in order to stash the removed item for later resurrection.
 *
 * @param widgetRef - widget reference of the item to remove;
 * @param stashIdentifier - stash identifier to store the removed item under; if not specified the item will be removed
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function eagerRemoveSectionItemByWidgetRef(
    widgetRef: ObjRef,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IRemoveSectionItemByWidgetRef {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM_BY_WIDGET_REF",
        correlationId,
        payload: {
            widgetRef,
            stashIdentifier,
            eager: true,
        },
    };
}

/**
 * @beta
 */
export type DashboardLayoutCommands =
    | IAddLayoutSection
    | IMoveLayoutSection
    | IRemoveLayoutSection
    | ChangeLayoutSectionHeader
    | IAddSectionItems
    | IMoveSectionItem
    | IRemoveSectionItem
    | IRemoveSectionItemByWidgetRef
    | IResizeHeight;

//
//
//

/**
 * The undo point selector function will be called during layout undo processing to determine up to (and including)
 * which command should the undo be done. Commands are sorted in the list in reversed chronological order -
 * last command processed command is at index 0, command before that at index 1 etc.
 *
 * The function must return index of command up to (and including) which the undo should be done. It is not possible
 * to undo just some command randomly.
 *
 * @beta
 */
export type UndoPointSelector = (undoableCommands: ReadonlyArray<DashboardLayoutCommands>) => number;

/**
 * Payload of the {@link IUndoLayoutChanges} command.
 * @beta
 */
export interface IUndoLayoutChangesPayload {
    /**
     * Specify a function that will be used to select a command up to which the undo should be done.
     *
     * @remarks
     * If not provided then the default selector will be used and will undo the very last command.
     *
     * The undo point selector is essential if you are implementing complex user-facing features that are achieved
     * using multiple commands. For instance drag-and-drop. On drag start, an item is removed - that is one command, and
     * then user drops the item at the new location - that is another command. The commands are dispatched by your
     * code separately, yet if user is able to do undo drag-and-drop operation, you need to get layout to a point
     * before
     *
     * If you want to trigger a proper undo in this case, then you need to undo both commands. Building on the
     * example above, you can proceed as follows:
     *
     * -  Your drag-and-drop feature should use correlationId convention to tie commands to user-facing feature.
     * -  Upon interaction start, your feature computes a correlationId `prefix` = "dnd-<UUID>"
     * -  The first command to remove the dragged item from layout will have correlationId = `${prefix}-drag`
     * -  The second command to add the dropped item to a new place on layout will have correlationId = `${prefix}-drop`
     * -  When the user clicks 'Undo', you dispatch the UndoLayoutChanges with a greedy selector. This will check whether
     *    the last command is a 'drop' in the dnd interaction. If so, look at previous command, check if it matches
     *    the correlationId and if so undo up to and including that command.
     */
    readonly undoPointSelector?: UndoPointSelector;
}

/**
 * @beta
 */
export interface IUndoLayoutChanges extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.UNDO";
    readonly payload: IUndoLayoutChangesPayload;
}

/**
 * Creates the UndoLayoutChanges command.
 *
 * @remarks
 * Dispatching this command will result in reverting the state of the layout
 * to a point before a particular layout command processing.
 *
 * By default, the very last command will be undone, however you can provide a function of your own to determine
 * up to which command should the undo go.
 *
 * @param undoPointSelector - specify function to determine up to which command to undo; if not provided the very last command will be undone
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function undoLayoutChanges(
    undoPointSelector?: UndoPointSelector,
    correlationId?: string,
): IUndoLayoutChanges {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.UNDO",
        correlationId,
        payload: {
            undoPointSelector,
        },
    };
}

/**
 * A convenience function to create UndoLayoutChanges command that will revert the very last command and toss it out
 * of history.
 *
 * @remarks
 * This is useful if you are implementing complex and cancellable interactions. For instance if you are building
 * drag-and-drop interaction which upon drag start removes item from a section using the RemoveSectionItem command and
 * upon drop places item in a new location using AddSectionItems command.
 *
 * When the user starts drag, you submit the RemoveSectionItem command (keeping the item in stash). Then user does
 * something to cancel the interaction: you need to restore the layout to the original state: that means to revert
 * the last layout change that was done by your interaction.
 *
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function revertLastLayoutChange(correlationId?: string): IUndoLayoutChanges {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.UNDO",
        correlationId,
        payload: {},
    };
}

/**
 * Payload of the {@link IResizeHeight} command.
 * @beta
 */
export interface IResizeHeightPayload {
    /**
     * Index of the section to resize.
     *
     * Index is zero-based.
     *
     * @remarks
     * "number" support will be removed in the next major SDK version. Use {@link ILayoutSectionPath} instead.
     *
     * TODO LX-648: Remove number type in the next major version.
     */
    readonly sectionIndex: number | ILayoutSectionPath;

    /**
     * Indexes of the items to resize.
     *
     * Index is zero-based.
     */
    readonly itemIndexes: number[];

    /**
     * Height to resize.
     */
    readonly height: number;
}

/**
 * @beta
 */
export interface IResizeHeight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_HEIGHT";
    readonly payload: IResizeHeightPayload;
}

/**
 * Creates the ResizeHeight command.
 *
 * @remarks
 * This command operates only on the root layout. For nested layouts, use {@link resizeNestedLayoutItemsHeight}.
 *
 * @param sectionIndex - index of the section
 * @param itemIndexes - indexes of the items
 * @param height - height in Grid Rows (by default 1 Grid Row is 20px)
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 */
export function resizeHeight(
    sectionIndex: number,
    itemIndexes: number[],
    height: number,
    correlationId?: string,
): IResizeHeight {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_HEIGHT",
        correlationId,
        payload: {
            sectionIndex,
            itemIndexes,
            height,
        },
    };
}

/**
 * Creates the ResizeHeight command.
 *
 * @param sectionIndex - index of the section
 * @param itemIndexes - indexes of the items
 * @param height - height in Grid Rows (by default 1 Grid Row is 20px)
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
// eslint-disable-next-line sonarjs/no-identical-functions
export function resizeNestedLayoutItemsHeight(
    sectionIndex: ILayoutSectionPath,
    itemIndexes: number[],
    height: number,
    correlationId?: string,
): IResizeHeight {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_HEIGHT",
        correlationId,
        payload: {
            sectionIndex,
            itemIndexes,
            height,
        },
    };
}

/**
 * Payload of the {@link IResizeWidth} command.
 * @beta
 */
export interface IResizeWidthPayload {
    /**
     * Index of the section to resize.
     *
     * Index is zero-based.
     *
     * @remarks
     * {@link IResizeWidthPayload.sectionIndex} support will be removed in the next major SDK version. Use {@link IResizeWidthPayload.itemPath} instead.
     *
     * TODO LX-648: Remove sectionIndex in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Indexes of the item to resize.
     *
     * Index is zero-based.
     *
     * @remarks
     * {@link IResizeWidthPayload.itemIndex} support will be removed in the next major SDK version. Use {@link IResizeWidthPayload.itemPath} instead.
     *
     * TODO LX-648: Remove itemIndex in the next major version.
     */
    readonly itemIndex: number;
    /**
     * Index of the item to resize.
     *
     * Index is zero-based.
     *
     * TODO LX-648: make the prop required
     */
    readonly itemPath?: ILayoutItemPath;

    /**
     * width to resize.
     */
    readonly width: number;
}

/**
 * @beta
 */
export interface IResizeWidth extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_WIDTH";
    readonly payload: IResizeWidthPayload;
}

/**
 * Creates the ResizeWidth command.
 *
 * @remarks
 * This command operates only on the root layout. For nested layouts, use {@link resizeNestedLayoutItemWidth}.
 *
 * @param sectionIndex - index of the section
 * @param itemIndex - index of the item
 * @param width - width in Grid Rows (by default 1 Grid Row is 20px)
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @beta
 *
 * TODO LX-648: Consider removing this command variant and leave only a nested variant
 */
export function resizeWidth(
    sectionIndex: number,
    itemIndex: number,
    width: number,
    correlationId?: string,
): IResizeWidth {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_WIDTH",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            itemPath: undefined as unknown as ILayoutItemPath,
            width,
        },
    };
}

/**
 * Creates the ResizeWidth command.
 *
 * @param itemPath - index of the section
 * @param width - width in Grid Rows (by default 1 Grid Row is 20px)
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function resizeNestedLayoutItemWidth(
    itemPath: ILayoutItemPath,
    width: number,
    correlationId?: string,
): IResizeWidth {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.RESIZE_WIDTH",
        correlationId,
        payload: {
            sectionIndex: -1,
            itemIndex: -1,
            itemPath,
            width,
        },
    };
}

/////

/**
 * Payload of the {@link ISetScreenSize} command.
 * @internal
 */
export interface ISetScreenSizePayload {
    screenSize: ScreenSize;
}

/**
 * @internal
 */
export interface ISetScreenSize extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLUID_LAYOUT.SET_SCREEN_SIZE";
    readonly payload: ISetScreenSizePayload;
}

/**
 * Creates the SetScreenSize command.
 *
 * @remarks
 * This command sets new screen size for the dashboard layout.
 * Do not use this command directly, it is used internally by the dashboard layout engine.
 *
 * @param screenSize - new screen size to set
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 *
 */
export function setScreenSize(screenSize: ScreenSize, correlationId?: string): ISetScreenSize {
    return {
        type: "GDC.DASH/CMD.FLUID_LAYOUT.SET_SCREEN_SIZE",
        correlationId,
        payload: {
            screenSize,
        },
    };
}

/////

/**
 * Payload of the {@link IToggleLayoutSectionHeaders} command.
 * @internal
 */
export interface IToggleLayoutSectionHeadersPayload {
    layoutPath: ILayoutItemPath | undefined;
    enableSectionHeaders: boolean;
}

/**
 * @internal
 */
export interface IToggleLayoutSectionHeaders extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLEXIBLE_LAYOUT.TOGGLE_LAYOUT_SECTION_HEADERS";
    readonly payload: IToggleLayoutSectionHeadersPayload;
}

/**
 * Creates the ToggleLayoutSectionHeaders command.
 *
 * @remarks
 * This command toggles headers of the sections for the dashboard layout.
 *
 * @param layoutPath - layout for which the sections will have the headers toggled.
 * @param enableSectionHeaders - value of that determines state of the headers of the layout sections. True to enable headers, false to disable them.
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 *
 */
export function toggleLayoutSectionHeaders(
    layoutPath: ILayoutItemPath | undefined,
    enableSectionHeaders: boolean,
    correlationId?: string,
): IToggleLayoutSectionHeaders {
    return {
        type: "GDC.DASH/CMD.FLEXIBLE_LAYOUT.TOGGLE_LAYOUT_SECTION_HEADERS",
        correlationId,
        payload: {
            layoutPath,
            enableSectionHeaders,
        },
    };
}

/////

/**
 * Payload of the {@link IToggleLayoutDirection} command.
 * @internal
 */
export interface IToggleLayoutDirectionPayload {
    layoutPath: ILayoutItemPath | undefined;
    direction: IDashboardLayoutContainerDirection;
}

/**
 * @internal
 */
export interface IToggleLayoutDirection extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.FLEXIBLE_LAYOUT.TOGGLE_LAYOUT_DIRECTION";
    readonly payload: IToggleLayoutDirectionPayload;
}

/**
 * Creates the ToggleLayoutDirection command.
 *
 * @remarks
 * This command changes the direction of the dashboard layout.
 *
 * @param layoutPath - layout for which the direction will be changed.
 * @param direction - the new direction for the layout ('row' or 'column').
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function toggleLayoutDirection(
    layoutPath: ILayoutItemPath | undefined,
    direction: IDashboardLayoutContainerDirection,
    correlationId?: string,
): IToggleLayoutDirection {
    return {
        type: "GDC.DASH/CMD.FLEXIBLE_LAYOUT.TOGGLE_LAYOUT_DIRECTION",
        correlationId,
        payload: {
            layoutPath,
            direction,
        },
    };
}
