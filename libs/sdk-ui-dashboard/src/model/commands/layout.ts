// (C) 2021 GoodData Corporation

import { IDashboardCommand } from "./base";
import { ExtendedDashboardItem } from "../types/layoutTypes";
import { IDashboardLayoutSectionHeader } from "@gooddata/sdk-backend-spi";

/**
 * Identifier of a stashed dashboard items. When removing one or more item, the caller may decide to 'stash' these items
 * under some identifier. This stashed items can then be used in subsequent command that places items on the layout by
 * providing the stash identifier.
 *
 * @internal
 */
export type StashedDashboardItemsId = string;

/**
 * Definition of items that may be placed into the dashboard sections.
 *
 * @internal
 */
export type DashboardItemDefinition = ExtendedDashboardItem | StashedDashboardItemsId;

/**
 * @internal
 */
export interface AddLayoutSection extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.ADD_SECTION";
    readonly payload: {
        /**
         * Index where to place the new section
         *
         * Index is zero-based and for convenience index -1 means place new section at the end
         */
        readonly index: number;

        /**
         * Optionally specify the section header.
         */
        readonly initialHeader?: IDashboardLayoutSectionHeader;

        /**
         * Optionally specify one or more items to include in the newly created section.
         *
         *
         */
        readonly initialItems?: ReadonlyArray<DashboardItemDefinition>;
    };
}

/**
 * Creates the AddLayoutSection command. Dispatching this command will result in the addition of a new layout section.
 * The new section will be placed at the desired index and will be empty by default.
 *
 * You may optionally specify the initial values of the section header and the items that will be in the new section.
 *
 * @param index - index to place the section at; -1 can be used as convenience to append a new section
 * @param initialHeader - optionally specify specify header for the newly created section
 * @param initialItems - optionally specify one or more items that the newly created section should include from the get-go
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function addLayoutSection(
    index: number,
    initialHeader?: IDashboardLayoutSectionHeader,
    initialItems?: DashboardItemDefinition[],
    correlationId?: string,
): AddLayoutSection {
    return {
        type: "GDC.DASHBOARD.CMD.FL.ADD_SECTION",
        correlationId,
        payload: {
            index,
            initialHeader,
            initialItems,
        },
    };
}

//
//
//

/**
 * @internal
 */
export interface MoveLayoutSection extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.MOVE_SECTION";
    readonly payload: {
        /**
         * Index of the section to move.
         *
         * Index is zero-based.
         */
        readonly sectionIndex: number;

        /**
         * Index where the section should be moved.
         *
         * Index is zero-based. For convenience index of -1 means moving the item to the end of the section list.
         */
        readonly toIndex: number;
    };
}

/**
 * Creates the MoveLayoutSection command. Dispatching this command will result in move of the section located at `sectionIndex`
 * to a new place indicated by `toIndex`.
 *
 * @param sectionIndex - index of section to move
 * @param toIndex - the new index for the section
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function moveLayoutSection(
    sectionIndex: number,
    toIndex: number,
    correlationId?: string,
): MoveLayoutSection {
    return {
        type: "GDC.DASHBOARD.CMD.FL.MOVE_SECTION",
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
 * @internal
 */
export interface RemoveLayoutSection extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.REMOVE_SECTION";
    readonly payload: {
        /**
         * Index of section to remove.
         *
         * Zero based. For convenience -1 can be used to remove the last section.
         */
        readonly index: number;

        /**
         * Optionally specify stash identifier. If provided, the items from the removed section will not be
         * permanently removed but will be stored in the stash under this identifier. You can then
         * use the stash identifier to 'resurrect' the items in different section.
         *
         * Default behavior with no stashIdentifier is to also remove all items in the section.
         */
        readonly stashIdentifier?: StashedDashboardItemsId;
    };
}

/**
 * Creates the RemoveLayoutSection command. Dispatching this command will result in removal of the entire dashboard
 * section. You can optionally specify that the items in the section should not be physically removed but instead be
 * stashed for later 'resurrection'.
 *
 * @param index - index of section to remove
 * @param stashIdentifier - optionally specify identifier to stash items under; if you do not specify this, then the dashboard items in the removed section will also be removed
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function removeLayoutSection(
    index: number,
    stashIdentifier: StashedDashboardItemsId,
    correlationId?: string,
): RemoveLayoutSection {
    return {
        type: "GDC.DASHBOARD.CMD.FL.REMOVE_SECTION",
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
 * @internal
 */
export interface ChangeLayoutSectionHeader extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.CHANGE_SECTION_HEADER";
    readonly payload: {
        /**
         * Index of section whose header to set.
         *
         * Index is zero based. Exact index must be provided.
         */
        readonly index: number;

        /**
         * New value of the header.
         */
        readonly header: IDashboardLayoutSectionHeader;

        /**
         * Optionally indicate that the old header and the new header should be merged.
         *
         * The default behavior is to overwrite the old header with the new header provided in this command.
         */
        readonly merge?: boolean;
    };
}

/**
 * Creates the ChangeLayoutSectionHeader command. Dispatching this command will result in change of the section's title and/or
 * description.
 *
 * @param index - index of section to change
 * @param header - new header
 * @param merge - indicates whether the old header and the new header should be merged; default is no merging
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function changeLayoutSectionHeader(
    index: number,
    header: IDashboardLayoutSectionHeader,
    merge?: boolean,
    correlationId?: string,
): ChangeLayoutSectionHeader {
    return {
        type: "GDC.DASHBOARD.CMD.FL.CHANGE_SECTION_HEADER",
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
 * @internal
 */
export interface AddSectionItems extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.ADD_ITEMS";
    readonly payload: {
        /**
         * Section to which the item should be added.
         *
         * Index is zero-based.
         */
        readonly sectionIndex: number;

        /**
         * Index within section items where the item should be inserted.
         *
         * Index is zero-based. For convenience, you may specify -1 to append the new item.
         */
        readonly itemIndex: number;

        /**
         * Items to add. This item may be a placeholder for KPI or insight, an actual dashboard widget or a previously
         * stashed dashboard item.
         *
         * Note: if you use the stashed items identifier, the items will be moved from the stash - you cannot use
         * the stash identifier again.
         */
        readonly items: ReadonlyArray<DashboardItemDefinition>;
    };
}

/**
 * Creates the AddSectionItems command. Dispatching this command will result in addition of a new item into the existing
 * section. This item may be a placeholder for KPI or insight, an actual dashboard widget or a previously stashed
 * dashboard item.
 *
 *
 * @param sectionIndex - index of section to which the new item should be added
 * @param itemIndex - index at which to insert the new item
 * @param item - definition of the new item.
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function addSectionItem(
    sectionIndex: number,
    itemIndex: number,
    item: DashboardItemDefinition,
    correlationId?: string,
): AddSectionItems {
    return {
        type: "GDC.DASHBOARD.CMD.FL.ADD_ITEMS",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            items: [item],
        },
    };
}

//
//
//

/**
 * @internal
 */
export interface MoveSectionItem extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.MOVE_ITEM";
    readonly payload: {
        /**
         * Index of the section where the item to move is located.
         *
         * Index is zero-based.
         */
        readonly sectionIndex: number;

        /**
         * Index of section item that should be moved.
         *
         * Index is zero-based.
         */
        readonly itemIndex: number;

        /**
         * Index of section to which the item should be moved.
         *
         * Index is zero-based. For convenience you may specify -1 to move to last section.
         */
        readonly toSectionIndex: number;

        /**
         * Index within the target section.
         *
         * Index is zero-based. For convenience you may specify -1 to append the item at the end of the target section's
         * items.
         */
        readonly toItemIndex: number;
    };
}

/**
 * Creates the MoveSectionItem command. Dispatching this command will result in move of single item within
 * section or from one section to another.
 *
 * @param sectionIndex - source section index
 * @param itemIndex - index of item to move
 * @param toSectionIndex - target section index; you may specify -1 to move to last section
 * @param toItemIndex - index wihtin target section where the item should be inserted; you may specify -1 to append
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function moveSectionItem(
    sectionIndex: number,
    itemIndex: number,
    toSectionIndex: number,
    toItemIndex: number,
    correlationId?: string,
): MoveSectionItem {
    return {
        type: "GDC.DASHBOARD.CMD.FL.MOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            toSectionIndex,
            toItemIndex,
        },
    };
}

//
//
//

/**
 * @internal
 */
export interface RemoveSectionItem extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.REMOVE_ITEM";
    readonly payload: {
        /**
         * Index of the section where the item to move is located.
         *
         * Index is zero-based.
         */
        readonly sectionIndex: number;

        /**
         * Index of section item that should be moved.
         *
         * Index is zero-based.
         */
        readonly itemIndex: number;

        /**
         * Optionally specify stash identifier. If provided, the item will not be permanently removed but will be
         * stored in the stash under this identifier. You can then use the stash identifier to 'resurrect' the item
         * in different section.
         *
         * Default behavior with no stashIdentifier is to permanently remove the item as well.
         */
        readonly stashIdentifier?: StashedDashboardItemsId;

        /**
         * Optionally specify whether to eagerly remove the entire section if the item being removed was the only
         * item in the section.
         *
         * Default is false. Meaning an empty section will be left.
         */
        readonly eager?: boolean;
    };
}

/**
 * Creates the RemoveSectionItem configured to do eager remove of item. Dispatching this command will result in removal
 * of the item from a section and if the section only contains that item then the whole section will be removed as well.
 *
 * You may optionally specify the stashIdentifier in order to stash the removed item for later resurrection.
 *
 * @param sectionIndex - index of section from which to remove the item
 * @param itemIndex - index of item to remove
 * @param stashIdentifier - stash identifier to store the removed item under; if not specified the item will be removed
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function eagerRemoveSectionItem(
    sectionIndex: number,
    itemIndex: number,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): RemoveSectionItem {
    return {
        type: "GDC.DASHBOARD.CMD.FL.REMOVE_ITEM",
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            stashIdentifier,
            eager: true,
        },
    };
}

//
//
//

/**
 * @internal
 */
export type DashboardLayoutCommands =
    | AddLayoutSection
    | MoveLayoutSection
    | RemoveLayoutSection
    | ChangeLayoutSectionHeader
    | AddSectionItems
    | MoveSectionItem
    | RemoveSectionItem;

//
//
//

/**
 * The undo point selector function will be called during layout undo processing to determine at which
 * command should the undo stop.
 *
 * The function receives list of commands in the order they were submitted and processed. The
 *
 * @internal
 */
export type UndoPointSelector = (undoableCommands: ReadonlyArray<DashboardLayoutCommands>) => number;

/**
 * @internal
 */
export interface UndoLayoutChanges extends IDashboardCommand {
    readonly type: "GDC.DASHBOARD.CMD.FL.UNDO";
    readonly payload: {
        /**
         * Optionally specify a function that will be used to select a command up to which the undo should be done.
         *
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

        /**
         * Indicates whether the undone commands can be re-done or not.
         *
         * If not provided, the default is false = redo is not possible.
         */
        readonly redoable?: boolean;
    };
}

/**
 * Creates the UndoLayoutChanges command. Dispatching this command will result in reverting the state of the layout
 * to a point before a particular layout command processing.
 *
 * By default, the very last command will be undone, however you can provide a function of your own to determine
 * up to which command should the undo go.
 *
 * @param undoPointSelector - optionally specify function to determine up to which command to undo; if not provided the very last command will be undone
 * @param redoable - optionally indicate whether the undone command(s) can be redone - whether they should be kept in history or not; default is false
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function undoLayoutChanges(
    undoPointSelector?: UndoPointSelector,
    redoable?: boolean,
    correlationId?: string,
): UndoLayoutChanges {
    return {
        type: "GDC.DASHBOARD.CMD.FL.UNDO",
        correlationId,
        payload: {
            undoPointSelector,
            redoable,
        },
    };
}

/**
 * A convenience function to create UndoLayoutChanges command that will revert the very last command and toss it out
 * of history.
 *
 * This is useful if you are implementing complex and cancellable interactions. For instance if you are building
 * drag-and-drop interaction which upon drag start removes item from a section using the RemoveSectionItem command and
 * upon drop places item in a new location using AddSectionItems command.
 *
 * When the user starts drag, you submit the RemoveSectionItem command (keeping the item in stash). Then user does
 * something to cancel the interaction: you need to restore the layout to the original state: that means to revert
 * the last layout change that was done by your interaction.
 *
 * @param correlationId - optionally specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @internal
 */
export function revertLastLayoutChange(correlationId?: string): UndoLayoutChanges {
    return {
        type: "GDC.DASHBOARD.CMD.FL.UNDO",
        correlationId,
        payload: {
            redoable: false,
        },
    };
}
