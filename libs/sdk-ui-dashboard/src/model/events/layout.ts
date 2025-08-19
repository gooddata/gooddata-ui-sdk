// (C) 2021-2025 GoodData Corporation
import {
    IDashboardLayout,
    IDashboardLayoutContainerDirection,
    IDashboardLayoutSectionHeader,
    ScreenSize,
} from "@gooddata/sdk-model";

import { IDashboardEvent } from "./base.js";
import { eventGuard } from "./util.js";
import { ILayoutItemPath, ILayoutSectionPath } from "../../types.js";
import { DashboardContext } from "../types/commonTypes.js";
import {
    ExtendedDashboardItem,
    ExtendedDashboardLayoutSection,
    ExtendedDashboardWidget,
    StashedDashboardItemsId,
} from "../types/layoutTypes.js";

/**
 * Payload of the {@link DashboardLayoutSectionAdded} event.
 * @beta
 */
export interface DashboardLayoutSectionAddedPayload {
    /**
     * The new section.
     */
    readonly section: ExtendedDashboardLayoutSection;

    /**
     * Index of the new section among other sections in the layout.
     *
     * Index is zero-based.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionAddedPayload.path} instead.
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
export interface DashboardLayoutSectionAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED";
    readonly payload: DashboardLayoutSectionAddedPayload;
}

export function layoutSectionAdded(
    ctx: DashboardContext,
    section: ExtendedDashboardLayoutSection,
    index: number,
    path: ILayoutSectionPath,
    correlationId?: string,
): DashboardLayoutSectionAdded {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionAdded = eventGuard<DashboardLayoutSectionAdded>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionMoved} event.
 * @beta
 */
export interface DashboardLayoutSectionMovedPayload {
    /**
     * The section moved.
     */
    readonly section: ExtendedDashboardLayoutSection;
    /**
     * Index from which the section was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionMovedPayload.fromPath} instead.
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
     * @deprecated The prop will be removed in the next SDK major version. Use {@link DashboardLayoutSectionMovedPayload.toPath} instead.
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
export interface DashboardLayoutSectionMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED";
    readonly payload: DashboardLayoutSectionMovedPayload;
}

export function layoutSectionMoved(
    ctx: DashboardContext,
    section: ExtendedDashboardLayoutSection,
    fromIndex: number,
    toIndex: number,
    fromPath: ILayoutSectionPath,
    toPath: ILayoutSectionPath,
    correlationId?: string,
): DashboardLayoutSectionMoved {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionMoved = eventGuard<DashboardLayoutSectionMoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionRemoved} event.
 * @beta
 */
export interface DashboardLayoutSectionRemovedPayload {
    /**
     * Section that was removed.
     *
     * Note: when the section is eagerly removed, it's items will be empty.
     */
    readonly section: ExtendedDashboardLayoutSection;

    /**
     * Index where the section originally resided.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionRemovedPayload.path} instead.
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
export interface DashboardLayoutSectionRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED";
    readonly payload: DashboardLayoutSectionRemovedPayload;
}

export function layoutSectionRemoved(
    ctx: DashboardContext,
    section: ExtendedDashboardLayoutSection,
    index: number,
    path: ILayoutSectionPath,
    eagerRemoval?: boolean,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): DashboardLayoutSectionRemoved {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionRemoved = eventGuard<DashboardLayoutSectionRemoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionHeaderChanged} event.
 * @beta
 */
export interface DashboardLayoutSectionHeaderChangedPayload {
    /**
     * The new header of the section.
     */
    readonly newHeader: IDashboardLayoutSectionHeader;

    /**
     * Index of the section which had the header updated.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionHeaderChangedPayload.sectionPath} instead.
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
export interface DashboardLayoutSectionHeaderChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED";
    readonly payload: DashboardLayoutSectionHeaderChangedPayload;
}

export function layoutSectionHeaderChanged(
    ctx: DashboardContext,
    newHeader: IDashboardLayoutSectionHeader,
    sectionIndex: number,
    sectionPath: ILayoutSectionPath,
    correlationId?: string,
): DashboardLayoutSectionHeaderChanged {
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
 * Payload of the {@link DashboardLayoutSectionItemsHeightResized} event.
 * @beta
 */
export interface DashboardLayoutSectionItemsHeightResizedPayload {
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
export interface DashboardLayoutSectionItemsHeightResized extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEMS_HEIGHT_RESIZED";
    readonly payload: DashboardLayoutSectionItemsHeightResizedPayload;
}

export function layoutSectionItemsHeightResized(
    ctx: DashboardContext,
    sectionIndex: number,
    sectionPath: ILayoutSectionPath,
    itemIndexes: number[],
    newHeight: number,
    correlationId?: string,
): DashboardLayoutSectionItemsHeightResized {
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
 * Payload of the {@link DashboardLayoutSectionItemWidthResized} event.
 * @beta
 */
export interface DashboardLayoutSectionItemWidthResizedPayload {
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
export interface DashboardLayoutSectionItemWidthResized extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ITEM_WIDTH_RESIZED";
    readonly payload: DashboardLayoutSectionItemWidthResizedPayload;
}

export function layoutSectionItemWidthResized(
    ctx: DashboardContext,
    sectionIndex: number,
    itemIndex: number,
    path: ILayoutItemPath,
    newWidth: number,
    correlationId?: string,
): DashboardLayoutSectionItemWidthResized {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionHeaderChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionHeaderChanged = eventGuard<DashboardLayoutSectionHeaderChanged>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_HEADER_CHANGED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionItemsAdded} event.
 * @beta
 */
export interface DashboardLayoutSectionItemsAddedPayload {
    /**
     * Index of the section to which the items were added.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemsAddedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index within the section at which the items were inserted.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemsAddedPayload.path} instead.
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
     * If the items from one or more stashes were added and the stashes were cleared, the the list of
     * stash identifiers will be included here.
     */
    readonly stashesUsed?: ReadonlyArray<StashedDashboardItemsId>;
}

/**
 * This event is emitted when items are added to a dashboard section.
 *
 * @beta
 */
export interface DashboardLayoutSectionItemsAdded extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED";
    readonly payload: DashboardLayoutSectionItemsAddedPayload;
}

export function layoutSectionItemsAdded(
    ctx: DashboardContext,
    sectionIndex: number,
    startIndex: number,
    path: ILayoutItemPath,
    itemsAdded: ExtendedDashboardItem[],
    stashesUsed?: StashedDashboardItemsId[],
    correlationId?: string,
): DashboardLayoutSectionItemsAdded {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionItemsAdded}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemsAdded = eventGuard<DashboardLayoutSectionItemsAdded>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionItemReplaced} event.
 * @beta
 */
export interface DashboardLayoutSectionItemReplacedPayload {
    /**
     * Index of section where the replacement happened.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemReplacedPayload.path} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly sectionIndex: number;

    /**
     * Index of item within the section that was replaced.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemReplacedPayload.path} instead.
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
export interface DashboardLayoutSectionItemReplaced extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED";
    readonly payload: DashboardLayoutSectionItemReplacedPayload;
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
): DashboardLayoutSectionItemReplaced {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionItemReplaced}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemReplaced = eventGuard<DashboardLayoutSectionItemReplaced>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionItemMoved} event.
 * @beta
 */
export interface DashboardLayoutSectionItemMovedPayload {
    /**
     * Item that was moved.
     */
    readonly item: ExtendedDashboardItem;

    /**
     * Index of section from which the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromSectionIndex: number;

    /**
     * Index of section to which the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedPayload.toPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     *
     * This may be the same as `fromSectionIndex` - which means the move happened within the same section.
     */
    readonly toSectionIndex: number;

    /**
     * Index within the `fromSection` from where the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromIndex: number;

    /**
     * Index in `toSection` at which the item was inserted.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedPayload.toPath} instead.
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
export interface DashboardLayoutSectionItemMoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED";
    readonly payload: DashboardLayoutSectionItemMovedPayload;
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
): DashboardLayoutSectionItemMoved {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionItemMoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemMoved = eventGuard<DashboardLayoutSectionItemMoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionItemMovedToNewSection} event.
 * @beta
 */
export interface DashboardLayoutSectionItemMovedToNewSectionPayload {
    /**
     * Item that was moved.
     */
    readonly item: ExtendedDashboardItem;

    /**
     * Index of section from which the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedToNewSectionPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromSectionIndex: number;

    /**
     * Index of section to which the item was moved.
     *
     * This may be the same as `fromSectionIndex` - which means the move happened within the same section.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedToNewSectionPayload.toPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly toSectionIndex: number;

    /**
     * Index within the `fromSection` from where the item was moved.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedToNewSectionPayload.fromPath} instead.
     *
     * TODO LX-648: Remove property in the next major version.
     */
    readonly fromIndex: number;

    /**
     * Index in `toSection` at which the item was inserted.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemMovedToNewSectionPayload.toPath} instead.
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
export interface DashboardLayoutSectionItemMovedToNewSection extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION";
    readonly payload: DashboardLayoutSectionItemMovedToNewSectionPayload;
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
): DashboardLayoutSectionItemMovedToNewSection {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionItemMovedToNewSection}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemMovedToNewSection =
    eventGuard<DashboardLayoutSectionItemMovedToNewSection>(
        "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
    );

//
//
//

/**
 * Payload of the {@link DashboardLayoutSectionItemRemoved} event.
 * @beta
 */
export interface DashboardLayoutSectionItemRemovedPayload {
    /**
     * Item that was removed.
     */
    readonly item: ExtendedDashboardItem;

    /**
     * Index where the item resided.
     *
     * @deprecated The prop will be removed in the next major SDK version. Use {@link DashboardLayoutSectionItemRemovedPayload.itemPath} instead.
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
     * NOTE: the {@link DashboardLayoutSectionRemoved} will be fired at the occasion as well.
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
export interface DashboardLayoutSectionItemRemoved extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED";
    readonly payload: DashboardLayoutSectionItemRemovedPayload;
}

export function layoutSectionItemRemoved(
    ctx: DashboardContext,
    item: ExtendedDashboardItem,
    itemIndex: number,
    itemPath: ILayoutItemPath,
    section?: ExtendedDashboardLayoutSection,
    stashIdentifier?: StashedDashboardItemsId,
    correlationId?: string,
): DashboardLayoutSectionItemRemoved {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutSectionItemRemoved}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutSectionItemRemoved = eventGuard<DashboardLayoutSectionItemRemoved>(
    "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
);

//
//
//

/**
 * Payload of the {@link DashboardLayoutChanged} event.
 * @beta
 */
export interface DashboardLayoutChangedPayload {
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
export interface DashboardLayoutChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED";
    readonly payload: DashboardLayoutChangedPayload;
}

export function layoutChanged(
    ctx: DashboardContext,
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    correlationId?: string,
): DashboardLayoutChanged {
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
 * Tests whether the provided object is an instance of {@link DashboardLayoutChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isDashboardLayoutChanged = eventGuard<DashboardLayoutChanged>(
    "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
);

//
//
//

/**
 * Payload of the {@link ScreenSizeChanged} event.
 * @beta
 */
export interface ScreenSizeChangedPayload {
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
export interface ScreenSizeChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLUID_LAYOUT.SCREEN_SIZE_CHANGED";
    readonly payload: ScreenSizeChangedPayload;
}

export function screenSizeChanged(
    ctx: DashboardContext,
    screenSize: ScreenSize,
    correlationId?: string,
): ScreenSizeChanged {
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
 * Tests whether the provided object is an instance of {@link ScreenSizeChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isScreenSizeChanged = eventGuard<ScreenSizeChanged>(
    "GDC.DASH/EVT.FLUID_LAYOUT.SCREEN_SIZE_CHANGED",
);

//
//
//

/**
 * Payload of the {@link LayoutSectionHeadersToggled} event.
 * @beta
 */
export interface LayoutSectionHeadersToggledPayload {
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
export interface LayoutSectionHeadersToggled extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_SECTION_HEADERS_TOGGLED";
    readonly payload: LayoutSectionHeadersToggledPayload;
}

export function layoutSectionHeadersToggled(
    ctx: DashboardContext,
    layoutPath: ILayoutItemPath | undefined,
    areSectionHeadersEnabled: boolean,
    correlationId?: string,
): LayoutSectionHeadersToggled {
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
 * Tests whether the provided object is an instance of {@link LayoutSectionHeadersToggled}.
 *
 * @param obj - object to test
 * @beta
 */
export const isLayoutSectionHeadersToggled = eventGuard<LayoutSectionHeadersToggled>(
    "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_SECTION_HEADERS_TOGGLED",
);

//
//
//

/**
 * Payload of the {@link LayoutDirectionChanged} event.
 * @beta
 */
export interface LayoutDirectionChangedPayload {
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
export interface LayoutDirectionChanged extends IDashboardEvent {
    readonly type: "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_DIRECTION_CHANGED";
    readonly payload: LayoutDirectionChangedPayload;
}

export function layoutDirectionChanged(
    ctx: DashboardContext,
    layoutPath: ILayoutItemPath | undefined,
    direction: IDashboardLayoutContainerDirection,
    correlationId?: string,
): LayoutDirectionChanged {
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
 * Tests whether the provided object is an instance of {@link LayoutDirectionChanged}.
 *
 * @param obj - object to test
 * @beta
 */
export const isLayoutDirectionChanged = eventGuard<LayoutDirectionChanged>(
    "GDC.DASH/EVT.FLEXIBLE_LAYOUT.LAYOUT_DIRECTION_CHANGED",
);
