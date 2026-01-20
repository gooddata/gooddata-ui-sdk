// (C) 2021-2026 GoodData Corporation

import {
    type IDashboardLayout,
    type IDashboardLayoutContainerDirection,
    type IDashboardLayoutSectionHeader,
    type ScreenSize,
} from "@gooddata/sdk-model";

import { type IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { type ILayoutItemPath, type ILayoutSectionPath } from "../../types.js";
import { type DashboardContext } from "../types/commonTypes.js";
import {
    type ExtendedDashboardItem,
    type ExtendedDashboardLayoutSection,
    type ExtendedDashboardWidget,
    type StashedDashboardItemsId,
} from "../types/layoutTypes.js";

/**
 * Payload of the {@link IDashboardLayoutSectionAdded} event.
 * @beta
 */
export interface IDashboardLayoutSectionAddedPayload {
    /**
     * The new section.
     */
    readonly section: ExtendedDashboardLayoutSection;

    /**
     * Index of the new section among other sections in the layout.
     *
     * Index is zero-based.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionAddedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly index: number;

    /**
     * Path to the new section among other sections in the layout.
     */
    readonly path: ILayoutSectionPath;
}

/**
 * This event is emitted when a new dashboard layout section is added.
 *
 * @beta
 */
export interface IDashboardLayoutSectionAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED";
    readonly payload: IDashboardLayoutSectionAddedPayload;
}

export function layoutSectionAdded(
    ctx: DashboardContext,
    section: ExtendedDashboardLayoutSection,
    index: number,
    path: ILayoutSectionPath,
    correlationId?: string,
): IDashboardLayoutSectionAdded {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        ctx,
        correlationId,
        payload: {
            section,
            index,
            path,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionAdded = eventGuard<IDashboardLayoutSectionAdded>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionMoved} event.
 * @beta
 */
export interface IDashboardLayoutSectionMovedPayload {
    /**
     * The section moved.
     */
    readonly section: ExtendedDashboardLayoutSection;
    /**
     * Index from which the section was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionMovedPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major SDK version.
     */
    readonly fromIndex: number;
    /**
     * Path from which the section was moved.
     */
    readonly fromPath: ILayoutSectionPath;
    /**
     * Zero-based index to which the section was moved.
     *
     * @deprecated The prop will be removed in the next SDK major version. Use {@link IDashboardLayoutSectionMovedPayload.toPath} instead.
     *
     * TODO LX-648: Remove property in the next major SDK version.
     */
    readonly toIndex: number;
    /**
     * Path to which the section was moved.
     */
    readonly toPath: ILayoutSectionPath;
}

/**
 * This event is emitted when a dashboard layout section is moved from one place to another.
 *
 * @beta
 */
export interface IDashboardLayoutSectionMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED";
    readonly payload: IDashboardLayoutSectionMovedPayload;
}

export function layoutSectionMoved(
    ctx: DashboardContext,
    section: ExtendedDashboardLayoutSection,
    fromIndex: number,
    toIndex: number,
    fromPath: ILayoutSectionPath,
    toPath: ILayoutSectionPath,
    correlationId?: string,
): IDashboardLayoutSectionMoved {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
        ctx,
        correlationId,
        payload: {
            section,
            fromIndex,
            toIndex,
            fromPath,
            toPath,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionMoved = eventGuard<IDashboardLayoutSectionMoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionRemoved} event.
 * @beta
 */
export interface IDashboardLayoutSectionRemovedPayload {
    /**
     * Section that was removed.
     *
     * Note: when the section is eagerly removed, it's items will be empty.
     */
    readonly section: ExtendedDashboardLayoutSection;

    /**
     * Index where the section originally resided.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionRemovedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major SDK version.
     */
    readonly index: number;

    /**
     * Path where the section originally resided.
     */
    readonly path: ILayoutSectionPath;

    /**
     * Indicates that the section was removed as part of eager removal of the section items.
     */
    readonly eagerRemoval?: boolean;

    /**
     * If the remove command indicated to stash the items for later reuse, then the stash identifier
     * provided on the command is mirrored here.
     */
    readonly stashIdentifier?: StashedDashboardItemsId;
}

/**
 * This event is emitted when a dashboard layout section is removed from the layout.
 *
 * Note: this event will be emitted also when the section is removed as part of eager removal of
 * its items. E.g. item is removed, it is last item in the section, and the whole section is removed
 * as well.
 *
 * @beta
 */
export interface IDashboardLayoutSectionRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED";
    readonly payload: IDashboardLayoutSectionRemovedPayload;
}

export function layoutSectionRemoved(
    ctx: DashboardContext,
    section: ExtendedDashboardLayoutSection,
    index: number,
    path: ILayoutSectionPath,
    eagerRemoval?: boolean,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IDashboardLayoutSectionRemoved {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
        ctx,
        correlationId,
        payload: {
            section,
            index,
            path,
            eagerRemoval,
            stashIdentifier,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionRemoved = eventGuard<IDashboardLayoutSectionRemoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionHeaderChanged} event.
 * @beta
 */
export interface IDashboardLayoutSectionHeaderChangedPayload {
    /**
     * The new header of the section.
     */
    readonly newHeader: IDashboardLayoutSectionHeader;

    /**
     * Index of the section which had the header updated.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionHeaderChangedPayload.sectionPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly sectionIndex: number;
    /**
     * Path of the section which had the header updated.
     */
    readonly sectionPath: ILayoutSectionPath;
}

/**
 * This event is emitted when dashboard layout section changes.
 *
 * @beta
 */
export interface IDashboardLayoutSectionHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED";
    readonly payload: IDashboardLayoutSectionHeaderChangedPayload;
}

export function layoutSectionHeaderChanged(
    ctx: DashboardContext,
    newHeader: IDashboardLayoutSectionHeader,
    sectionIndex: number,
    sectionPath: ILayoutSectionPath,
    correlationId?: string,
): IDashboardLayoutSectionHeaderChanged {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
        ctx,
        correlationId,
        payload: {
            newHeader,
            sectionIndex,
            sectionPath,
        },
    };
}

/**
 * Payload of the {@link IDashboardLayoutSectionItemsHeightResized} event.
 * @beta
 */
export interface IDashboardLayoutSectionItemsHeightResizedPayload {
    /**
     * Index of the section which items height was changed.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link sectionPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly sectionIndex: number;
    /**
     * Index of the section which items height was changed.
     */
    readonly sectionPath: ILayoutSectionPath;

    /**
     * Index of the items in section which height was changed.
     */
    readonly itemIndexes: number[];

    /**
     * New height of items.
     */
    readonly newHeight: number;
}

/**
 * This event is emitted when dashboard layout items height changes.
 *
 * @beta
 */
export interface IDashboardLayoutSectionItemsHeightResized extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEMS_HEIGHT_RESIZED";
    readonly payload: IDashboardLayoutSectionItemsHeightResizedPayload;
}

export function layoutSectionItemsHeightResized(
    ctx: DashboardContext,
    sectionIndex: number,
    sectionPath: ILayoutSectionPath,
    itemIndexes: number[],
    newHeight: number,
    correlationId?: string,
): IDashboardLayoutSectionItemsHeightResized {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEMS_HEIGHT_RESIZED",
        ctx,
        correlationId,
        payload: {
            sectionIndex,
            sectionPath,
            itemIndexes,
            newHeight,
        },
    };
}

/**
 * Payload of the {@link IDashboardLayoutSectionItemWidthResized} event.
 * @beta
 */
export interface IDashboardLayoutSectionItemWidthResizedPayload {
    /**
     * Index of the section which items height was changed.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index of the items in section which height was changed.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly itemIndex: number;
    /**
     * Index of the items in section which height was changed.
     */
    readonly path: ILayoutItemPath;

    /**
     * New width of items.
     */
    readonly newWidth: number;
}

/**
 * This event is emitted when dashboard layout items height changes.
 *
 * @beta
 */
export interface IDashboardLayoutSectionItemWidthResized extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEM_WIDTH_RESIZED";
    readonly payload: IDashboardLayoutSectionItemWidthResizedPayload;
}

export function layoutSectionItemWidthResized(
    ctx: DashboardContext,
    sectionIndex: number,
    itemIndex: number,
    path: ILayoutItemPath,
    newWidth: number,
    correlationId?: string,
): IDashboardLayoutSectionItemWidthResized {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEM_WIDTH_RESIZED",
        ctx,
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            path,
            newWidth,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionHeaderChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionHeaderChanged = eventGuard<IDashboardLayoutSectionHeaderChanged>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionItemsAdded} event.
 * @beta
 */
export interface IDashboardLayoutSectionItemsAddedPayload {
    /**
     * Index of the section to which the items were added.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemsAddedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index within the section at which the items were inserted.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemsAddedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly startIndex: number;
    /**
     * Path of the inserted item.
     */
    readonly path: ILayoutItemPath;

    /**
     * Items that were inserted.
     */
    readonly itemsAdded: ReadonlyArray<ExtendedDashboardItem>;

    /**
     * If the items from one or more stashes were added and the stashes were cleared, the list of
     * stash identifiers will be included here.
     */
    readonly stashesUsed?: ReadonlyArray<StashedDashboardItemsId>;
}

/**
 * This event is emitted when items are added to a dashboard section.
 *
 * @beta
 */
export interface IDashboardLayoutSectionItemsAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED";
    readonly payload: IDashboardLayoutSectionItemsAddedPayload;
}

export function layoutSectionItemsAdded(
    ctx: DashboardContext,
    sectionIndex: number,
    startIndex: number,
    path: ILayoutItemPath,
    itemsAdded: ExtendedDashboardItem[],
    stashesUsed?: StashedDashboardItemsId[],
    correlationId?: string,
): IDashboardLayoutSectionItemsAdded {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        ctx,
        correlationId,
        payload: {
            sectionIndex,
            startIndex,
            path,
            itemsAdded,
            stashesUsed,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionItemsAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemsAdded = eventGuard<IDashboardLayoutSectionItemsAdded>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionItemReplaced} event.
 * @beta
 */
export interface IDashboardLayoutSectionItemReplacedPayload {
    /**
     * Index of section where the replacement happened.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemReplacedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index of item within the section that was replaced.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemReplacedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly itemIndex: number;

    /**
     * Path of item that was replaced.
     */
    readonly path: ILayoutItemPath;

    /**
     * New item definition.
     */
    readonly items: ReadonlyArray<ExtendedDashboardItem>;

    /**
     * Item that was replaced
     */
    readonly previousItem: ExtendedDashboardItem;

    /**
     * If the replacement specified to stash the old item, then the identifier of the
     * stash is included here.
     */
    readonly stashIdentifier?: StashedDashboardItemsId;
}

/**
 * This event is emitted when an item in a dashboard section is replaced.
 * @beta
 */
export interface IDashboardLayoutSectionItemReplaced extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED";
    readonly payload: IDashboardLayoutSectionItemReplacedPayload;
}

export function layoutSectionItemReplaced(
    ctx: DashboardContext,
    sectionIndex: number,
    itemIndex: number,
    path: ILayoutItemPath,
    items: ExtendedDashboardItem[],
    previousItem: ExtendedDashboardItem,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IDashboardLayoutSectionItemReplaced {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        ctx,
        correlationId,
        payload: {
            sectionIndex,
            itemIndex,
            path,
            items,
            previousItem,
            stashIdentifier,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionItemReplaced}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemReplaced = eventGuard<IDashboardLayoutSectionItemReplaced>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionItemMoved} event.
 * @beta
 */
export interface IDashboardLayoutSectionItemMovedPayload {
    /**
     * Item that was moved.
     */
    readonly item: ExtendedDashboardItem;

    /**
     * Index of section from which the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromSectionIndex: number;

    /**
     * Index of section to which the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedPayload.toPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     *
     * This may be the same as `fromSectionIndex` - which means the move happened within the same section.
     */
    readonly toSectionIndex: number;

    /**
     * Index within the `fromSection` from where the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromIndex: number;

    /**
     * Index in `toSection` at which the item was inserted.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedPayload.toPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly toIndex: number;

    /**
     * Path from where the item was moved.
     */
    readonly fromPath: ILayoutItemPath;

    /**
     * Path at which the item was inserted.
     */
    readonly toPath: ILayoutItemPath;

    /**
     * Indicate, that original section has been removed.
     */
    readonly originalSectionRemoved: boolean;
}

/**
 * This event is emitted when a dashboard item is moved between sections or within a section.
 *
 * @beta
 */
export interface IDashboardLayoutSectionItemMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED";
    readonly payload: IDashboardLayoutSectionItemMovedPayload;
}

export function layoutSectionItemMoved(
    ctx: DashboardContext,
    item: ExtendedDashboardItem,
    fromSectionIndex: number,
    toSectionIndex: number,
    fromIndex: number,
    toIndex: number,
    fromPath: ILayoutItemPath,
    toPath: ILayoutItemPath,
    originalSectionRemoved: boolean,
    correlationId?: string,
): IDashboardLayoutSectionItemMoved {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
        ctx,
        correlationId,
        payload: {
            item,
            fromSectionIndex,
            toSectionIndex,
            fromIndex,
            toIndex,
            fromPath,
            toPath,
            originalSectionRemoved,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionItemMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemMoved = eventGuard<IDashboardLayoutSectionItemMoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionItemMovedToNewSection} event.
 * @beta
 */
export interface IDashboardLayoutSectionItemMovedToNewSectionPayload {
    /**
     * Item that was moved.
     */
    readonly item: ExtendedDashboardItem;

    /**
     * Index of section from which the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedToNewSectionPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromSectionIndex: number;

    /**
     * Index of section to which the item was moved.
     *
     * This may be the same as `fromSectionIndex` - which means the move happened within the same section.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedToNewSectionPayload.toPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly toSectionIndex: number;

    /**
     * Index within the `fromSection` from where the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedToNewSectionPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromIndex: number;

    /**
     * Index in `toSection` at which the item was inserted.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemMovedToNewSectionPayload.toPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly toIndex: number;

    /**
     * Index from where the item was moved.
     */
    readonly fromPath: ILayoutItemPath;

    /**
     * Index at which the item was inserted.
     */
    readonly toPath: ILayoutItemPath;

    /**
     * Indicate, that original section has been removed.
     */
    readonly originalSectionRemoved: boolean;
}

/**
 * This event is emitted when a dashboard item is moved to new section.
 *
 * @beta
 */
export interface IDashboardLayoutSectionItemMovedToNewSection extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION";
    readonly payload: IDashboardLayoutSectionItemMovedToNewSectionPayload;
}

export function layoutSectionItemMovedToNewSection(
    ctx: DashboardContext,
    item: ExtendedDashboardItem,
    fromSectionIndex: number,
    toSectionIndex: number,
    fromIndex: number,
    toIndex: number,
    fromPath: ILayoutItemPath,
    toPath: ILayoutItemPath,
    originalSectionRemoved: boolean,
    correlationId?: string,
): IDashboardLayoutSectionItemMovedToNewSection {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
        ctx,
        correlationId,
        payload: {
            item,
            fromSectionIndex,
            toSectionIndex,
            fromIndex,
            toIndex,
            fromPath,
            toPath,
            originalSectionRemoved,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionItemMovedToNewSection}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemMovedToNewSection =
    eventGuard<IDashboardLayoutSectionItemMovedToNewSection>(
        "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
    );

//
//
//

/**
 * Payload of the {@link IDashboardLayoutSectionItemRemoved} event.
 * @beta
 */
export interface IDashboardLayoutSectionItemRemovedPayload {
    /**
     * Item that was removed.
     */
    readonly item: ExtendedDashboardItem;

    /**
     * Index where the item resided.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link IDashboardLayoutSectionItemRemovedPayload.itemPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly itemIndex: number;

    /**
     * Path where the item resided.
     */
    readonly itemPath: ILayoutItemPath;

    /**
     * If the removal was eager and removed the entire section, then that section is included here.
     *
     * NOTE: the {@link IDashboardLayoutSectionRemoved} will be fired at the occasion as well.
     */
    readonly section?: ExtendedDashboardLayoutSection;

    /**
     * If the removal indicated to stash the item, then the stash identifier is mirrored here.
     */
    readonly stashIdentifier?: StashedDashboardItemsId;
}

/**
 * This event is emitted when an item is removed from dashboard layout section.
 *
 * @beta
 */
export interface IDashboardLayoutSectionItemRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED";
    readonly payload: IDashboardLayoutSectionItemRemovedPayload;
}

export function layoutSectionItemRemoved(
    ctx: DashboardContext,
    item: ExtendedDashboardItem,
    itemIndex: number,
    itemPath: ILayoutItemPath,
    section?: ExtendedDashboardLayoutSection,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): IDashboardLayoutSectionItemRemoved {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
        ctx,
        correlationId,
        payload: {
            item,
            itemIndex,
            itemPath,
            section,
            stashIdentifier,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutSectionItemRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemRemoved = eventGuard<IDashboardLayoutSectionItemRemoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
);

//
//
//

/**
 * Payload of the {@link IDashboardLayoutChanged} event.
 * @beta
 */
export interface IDashboardLayoutChangedPayload {
    /**
     * Layout after the change.
     */
    readonly layout: IDashboardLayout<ExtendedDashboardWidget>;
}

/**
 * This event is emitted after any change to the dashboard layout and will include the entire new layout.
 *
 * @beta
 */
export interface IDashboardLayoutChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED";
    readonly payload: IDashboardLayoutChangedPayload;
}

export function layoutChanged(
    ctx: DashboardContext,
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    correlationId?: string,
): IDashboardLayoutChanged {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
        ctx,
        correlationId,
        payload: {
            layout,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IDashboardLayoutChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutChanged = eventGuard<IDashboardLayoutChanged>(
    "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
);

//
//
//

/**
 * Payload of the {@link IScreenSizeChanged} event.
 * @beta
 */
export interface IScreenSizeChangedPayload {
    /**
     * New screen size.
     */
    readonly screenSize: ScreenSize;
}

/**
 * This event is emitted after change of the dashboard layout screen size.
 *
 * @beta
 */
export interface IScreenSizeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SCREEN_SIZE_CHANGED";
    readonly payload: IScreenSizeChangedPayload;
}

export function screenSizeChanged(
    ctx: DashboardContext,
    screenSize: ScreenSize,
    correlationId?: string,
): IScreenSizeChanged {
    return {
        type: "GDC.DASH/EVT.FLUID_LAYOUT.SCREEN_SIZE_CHANGED",
        ctx,
        correlationId,
        payload: {
            screenSize,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link IScreenSizeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isScreenSizeChanged = eventGuard<IScreenSizeChanged>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SCREEN_SIZE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link ILayoutSectionHeadersToggled} event.
 * @beta
 */
export interface ILayoutSectionHeadersToggledPayload {
    /**
     * Layout that got the section headers state toggled.
     */
    layoutPath: ILayoutItemPath | undefined;
    /**
     * The new state of the layout section headers
     */
    areSectionHeadersEnabled: boolean;
}

/**
 * This event is emitted after layout section headers were toggled.
 *
 * @alpha
 */
export interface ILayoutSectionHeadersToggled extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_SECTION_HEADERS_TOGGLED";
    readonly payload: ILayoutSectionHeadersToggledPayload;
}

export function layoutSectionHeadersToggled(
    ctx: DashboardContext,
    layoutPath: ILayoutItemPath | undefined,
    areSectionHeadersEnabled: boolean,
    correlationId?: string,
): ILayoutSectionHeadersToggled {
    return {
        type: "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_SECTION_HEADERS_TOGGLED",
        ctx,
        correlationId,
        payload: {
            layoutPath,
            areSectionHeadersEnabled,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link ILayoutSectionHeadersToggled}.
 *
 * @param obj - object to test
 * @beta
 */
export const isLayoutSectionHeadersToggled = eventGuard<ILayoutSectionHeadersToggled>(
    "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_SECTION_HEADERS_TOGGLED",
);

//
//
//

/**
 * Payload of the {@link ILayoutDirectionChanged} event.
 * @beta
 */
export interface ILayoutDirectionChangedPayload {
    /**
     * Layout section path whose direction was changed.
     */
    layoutPath: ILayoutItemPath | undefined;
    /**
     * The new direction of the layout.
     */
    direction: IDashboardLayoutContainerDirection;
}

/**
 * This event is emitted after a layout's direction was changed.
 *
 * @alpha
 */
export interface ILayoutDirectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_DIRECTION_CHANGED";
    readonly payload: ILayoutDirectionChangedPayload;
}

export function layoutDirectionChanged(
    ctx: DashboardContext,
    layoutPath: ILayoutItemPath | undefined,
    direction: IDashboardLayoutContainerDirection,
    correlationId?: string,
): ILayoutDirectionChanged {
    return {
        type: "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_DIRECTION_CHANGED",
        ctx,
        correlationId,
        payload: {
            layoutPath,
            direction,
        },
    };
}

/**
 * Tests whether the provided object is an instance of {@link ILayoutDirectionChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isLayoutDirectionChanged = eventGuard<ILayoutDirectionChanged>(
    "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_DIRECTION_CHANGED",
);
