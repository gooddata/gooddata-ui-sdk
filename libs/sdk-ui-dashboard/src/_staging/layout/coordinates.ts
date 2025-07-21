// (C) 2019-2025 GoodData Corporation

import {
    IDashboardLayout,
    IDashboardLayoutSection,
    isDashboardLayout,
    IDashboardLayoutItem,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";

import {
    ILayoutCoordinates,
    ILayoutItemPath,
    ILayoutSectionPath,
    isLayoutItemPath,
    isLayoutSectionPath,
} from "../../types.js";
import { IDashboardLayoutItemFacade } from "../dashboard/legacyFluidLayout/facade/interfaces.js";
import { ExtendedDashboardWidget } from "../../model/types/layoutTypes.js";

/**
 * @internal
 */
export function getLayoutCoordinates(item: IDashboardLayoutItemFacade<unknown>): ILayoutCoordinates {
    return {
        sectionIndex: item.section()?.index(),
        itemIndex: item.index(),
    };
}

export const areLayoutPathsEqual = (
    path1: ILayoutItemPath | undefined,
    path2: ILayoutItemPath | undefined,
): boolean => {
    if (path1 === path2) {
        return true;
    }
    if (path1 === undefined || path2 === undefined) {
        return false;
    }
    if (path1.length !== path2.length) {
        return false;
    }
    return path1.every((path, index) => areSameCoordinates(path, path2[index]));
};

export const areSameCoordinates = (
    coordinates1?: ILayoutCoordinates,
    coordinates2?: ILayoutCoordinates,
): boolean => {
    if (coordinates1 === undefined || coordinates2 === undefined) {
        return false;
    }
    return (
        coordinates1.sectionIndex === coordinates2.sectionIndex &&
        coordinates1.itemIndex === coordinates2.itemIndex
    );
};

export const areItemsInSameSection = (
    path1: ILayoutItemPath | undefined,
    path2: ILayoutItemPath | undefined,
): boolean => {
    if (path1 === undefined || path2 === undefined) {
        return false;
    }
    if (path1.length === 0 || path2.length === 0) {
        return false;
    }
    if (path1 === path2) {
        return true;
    }
    if (path1.length !== path2.length) {
        return false;
    }
    return path1.every(
        (path, index) =>
            path.sectionIndex === path2[index].sectionIndex &&
            path.sectionIndex !== undefined &&
            path2[index].sectionIndex !== undefined &&
            (path.itemIndex === path2[index].itemIndex || index === path1.length - 1),
    );
};

/**
 * Returns the common path between two item paths. After first difference rest is not included.
 *
 * @param fromItemPath - the path of the item from which the move is starting
 * @param toItemPath - the path of the item to which the move is going
 * @returns the common path between the two item paths. If the paths are not related, returns an empty path.
 */
export function getCommonPath(fromItemPath: ILayoutItemPath, toItemPath: ILayoutItemPath): ILayoutItemPath {
    const commonPath: ILayoutItemPath = [];
    const minLength = Math.min(fromItemPath.length, toItemPath.length);

    // Early return for empty paths
    if (minLength === 0) {
        return commonPath;
    }

    // Find common path with early termination
    for (let i = 0; i < minLength; i++) {
        if (areSameCoordinates(fromItemPath[i], toItemPath[i])) {
            commonPath.push(fromItemPath[i]);
        } else {
            break; // Stop at first difference
        }
    }

    return commonPath;
}

export const serializeLayoutItemPath = (path: ILayoutItemPath | undefined): string => {
    return (
        path?.map(({ sectionIndex, itemIndex }) => `${sectionIndex}_${itemIndex}`).join("-") || "undefined"
    );
};

export const serializeLayoutSectionPath = (path: ILayoutSectionPath | undefined): string => {
    const parentPath = path?.parent
        ?.map(({ sectionIndex, itemIndex }) => `${sectionIndex}_${itemIndex}`)
        .join("-");
    return parentPath
        ? `${parentPath}-${path?.sectionIndex}`
        : path?.sectionIndex === undefined
          ? "undefined"
          : String(path.sectionIndex);
};

export const areSectionLayoutPathsEqual = (
    section1: ILayoutSectionPath | undefined,
    section2: ILayoutSectionPath | undefined,
): boolean => {
    if (section1 === section2) {
        return true;
    }
    if (section1 === undefined || section2 === undefined) {
        return false;
    }
    if (!areLayoutPathsEqual(section1.parent, section2.parent)) {
        return false;
    }
    return section1.sectionIndex == section2.sectionIndex;
};

export const asLayoutItemPath = (sectionIndex: ILayoutSectionPath, itemIndex: number): ILayoutItemPath => {
    invariant(sectionIndex, "Section path is not defined.");
    return [
        ...(sectionIndex.parent ? sectionIndex.parent : []),
        {
            sectionIndex: sectionIndex.sectionIndex,
            itemIndex,
        },
    ];
};

export const asSectionPath = (layoutPath: ILayoutItemPath): ILayoutSectionPath => {
    invariant(layoutPath, "Layout item path is not defined.");
    const parent = layoutPath.slice(0, -1);
    return {
        parent: parent.length === 0 ? undefined : parent,
        sectionIndex: getSectionIndex(layoutPath),
    };
};

const findSectionRecursive = (
    searchingViaItemPath: boolean,
    currentLayout: IDashboardLayout<ExtendedDashboardWidget>,
    path: ILayoutItemPath,
    targetSectionIndex: number,
): IDashboardLayoutSection<ExtendedDashboardWidget> => {
    if (path.length === 0) {
        const section = currentLayout.sections[targetSectionIndex];
        invariant(section, "Section not found under the provided path.");
        return section;
    }

    const [nextPathEntry, ...remainingPath] = path;
    const section = currentLayout.sections[nextPathEntry.sectionIndex];
    const item = section.items[nextPathEntry.itemIndex];

    if (searchingViaItemPath && remainingPath.length === 0) {
        return section;
    }

    invariant(isDashboardLayout(item.widget), "Invalid path: Expected a layout at the specified path.");

    return findSectionRecursive(searchingViaItemPath, item.widget, remainingPath, targetSectionIndex);
};

export const findSection = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    index: ILayoutSectionPath | ILayoutItemPath,
): IDashboardLayoutSection<ExtendedDashboardWidget> => {
    invariant(layout, "Layout is undefined.");
    invariant(index, "Layout item or section path is undefined.");

    if (isLayoutSectionPath(index)) {
        const path = index.parent ?? [];
        return findSectionRecursive(false, layout, path, index.sectionIndex);
    } else {
        const path = index.length > 1 ? index : [];
        const sectionIndex = index[index.length - 1].sectionIndex;
        return findSectionRecursive(true, layout, path, sectionIndex);
    }
};

const findSectionsRecursive = (
    searchingViaItemPath: boolean,
    currentLayout: IDashboardLayout<ExtendedDashboardWidget>,
    path: ILayoutItemPath,
): IDashboardLayoutSection<ExtendedDashboardWidget>[] => {
    if (path.length === 0) {
        const sections = currentLayout.sections;
        invariant(sections, "Invalid path: Expected a sections to find based on provided path.");
        return sections;
    }

    const [nextPathEntry, ...remainingPath] = path;
    const section = currentLayout.sections[nextPathEntry.sectionIndex];
    const item = section.items[nextPathEntry.itemIndex];

    if (searchingViaItemPath && remainingPath.length === 0) {
        return currentLayout.sections;
    }

    invariant(isDashboardLayout(item.widget), "Invalid path: Expected a layout at the specified path.");

    return findSectionsRecursive(searchingViaItemPath, item.widget, remainingPath);
};

export const findSections = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    index: ILayoutSectionPath | ILayoutItemPath,
): IDashboardLayoutSection<ExtendedDashboardWidget>[] => {
    invariant(layout, "Layout is undefined.");
    invariant(
        index !== undefined &&
            (isLayoutSectionPath(index) ? index.sectionIndex !== undefined : index.length > 0),
        "Layout item or section path is undefined.",
    );

    const path = isLayoutSectionPath(index) ? (index.parent ?? []) : index;
    return findSectionsRecursive(!isLayoutSectionPath(index), layout, path);
};

export const findItem = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    path: ILayoutItemPath,
): IDashboardLayoutItem<ExtendedDashboardWidget> => {
    invariant(layout, "Layout is undefined.");
    invariant(path !== undefined && path.length > 0, "Layout item path is undefined.");

    const [nextPathEntry, ...remainingPath] = path;

    // Get the target section
    const section = layout.sections[nextPathEntry.sectionIndex];
    invariant(section, "Invalid path: Section index out of bounds.");

    // Get the target item in the section
    const item = section.items[nextPathEntry.itemIndex];
    invariant(item, "Invalid path: Item index out of bounds.");

    // Base case: if there are no more path entries, we’ve reached the target item
    if (remainingPath.length === 0) {
        return item;
    }

    // Recursive case: if there are more path entries, ensure the item is a layout and keep traversing
    invariant(isDashboardLayout(item.widget), "Invalid path: Expected a layout at the specified path.");

    // Recur into the nested layout
    return findItem(item.widget, remainingPath);
};

const sanitizeParentPath = (path: ILayoutItemPath | undefined) =>
    path === undefined || path.length > 0 ? path : undefined;

export const isItemInSection = (item: ILayoutItemPath, section: ILayoutSectionPath): boolean => {
    invariant(item, "Layout item path is undefined.");
    invariant(section, "Layout section path is undefined.");

    const isParentSame = areLayoutPathsEqual(
        sanitizeParentPath(item.slice(0, -1)),
        sanitizeParentPath(section.parent),
    );
    return isParentSame && getSectionIndex(item) === section.sectionIndex;
};

export const getItemIndex = (layoutPath: ILayoutItemPath): number => {
    invariant(layoutPath, "Layout item path is undefined.");
    return layoutPath[layoutPath.length - 1].itemIndex;
};

export const getSectionIndex = (layoutPath: ILayoutItemPath | ILayoutSectionPath): number => {
    invariant(layoutPath, "Layout item or section path is undefined.");
    return isLayoutSectionPath(layoutPath)
        ? layoutPath.sectionIndex
        : layoutPath[layoutPath.length - 1].sectionIndex;
};

export const updateItemIndex = (layoutPath: ILayoutItemPath, newItemIndex: number): ILayoutItemPath => {
    invariant(layoutPath !== undefined && layoutPath.length > 0, "Layout item path is undefined.");
    return [
        ...layoutPath.slice(0, -1),
        {
            sectionIndex: getSectionIndex(layoutPath),
            itemIndex: newItemIndex,
        },
    ];
};

export const updateSectionIndex = (
    layoutPath: ILayoutSectionPath,
    newSectionIndex: number,
): ILayoutSectionPath => {
    invariant(layoutPath, "Layout section path is undefined.");
    return {
        ...layoutPath,
        sectionIndex: newSectionIndex,
    };
};

export const updateItem = (
    layoutPath: ILayoutItemPath,
    newSectionIndex: number,
    newItemIndex: number,
): ILayoutItemPath => {
    invariant(layoutPath !== undefined && layoutPath.length > 0, "Layout item path is undefined.");
    return [
        ...layoutPath.slice(0, -1),
        {
            sectionIndex: newSectionIndex,
            itemIndex: newItemIndex,
        },
    ];
};

export const hasParent = (path: ILayoutItemPath | ILayoutSectionPath): boolean => {
    return (
        (isLayoutItemPath(path) && path.length > 1) ||
        (isLayoutSectionPath(path) && path.parent !== undefined && path.parent.length > 0)
    );
};

export const getParentPath = (
    path: ILayoutItemPath | ILayoutSectionPath | undefined,
): ILayoutItemPath | undefined => {
    if (path === undefined) {
        return undefined;
    }
    return isLayoutItemPath(path) ? (path.length > 1 ? path.slice(0, -1) : undefined) : path.parent;
};
