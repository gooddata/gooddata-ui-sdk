// (C) 2021-2024 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-model";
import { ExtendedDashboardLayoutSection, ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import isEmpty from "lodash/isEmpty.js";
import { ILayoutItemPath, ILayoutSectionPath } from "../../../../types.js";
import {
    getItemIndex,
    findSection,
    getSectionIndex,
    findSections,
} from "../../../../_staging/layout/coordinates.js";

export function validateSectionPlacement(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    index: ILayoutSectionPath | ILayoutItemPath | number,
): boolean {
    if (typeof index === "number") {
        if (index === -1) {
            return true;
        }

        if (isEmpty(layout.sections) && !index) {
            return true;
        }

        // using <= here so that we can add to the last place not only by using -1 by also by using (lastIndex+1)
        return index <= layout.sections.length;
    } else {
        const sectionIndex = getSectionIndex(index);

        if (sectionIndex === -1) {
            return true;
        }

        const sections = findSections(layout, index);

        if (isEmpty(sections) && !sectionIndex) {
            return true;
        }

        // using <= here so that we can add to the last place not only by using -1 by also by using (lastIndex+1)
        return sectionIndex <= sections.length;
    }
}

export function validateSectionExists(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    layoutPath: ILayoutItemPath | ILayoutSectionPath | number,
): boolean {
    if (typeof layoutPath === "number") {
        return layoutPath > -1 && layoutPath < layout.sections.length;
    } else {
        const section = findSection(layout, layoutPath);
        return section !== undefined;
    }
}

export function validateItemPlacement(
    section: ExtendedDashboardLayoutSection,
    index: ILayoutItemPath | number,
): boolean {
    if (typeof index === "number") {
        if (index === -1) {
            return true;
        }

        if (isEmpty(section.items) && !index) {
            return true;
        }

        // using <= here so that we can add to the last place not only by using -1 by also by using (lastIndex+1)
        return index <= section.items.length;
    } else {
        const itemIndex = getItemIndex(index);
        if (itemIndex === -1) {
            return true;
        }

        if (isEmpty(section.items) && !itemIndex) {
            return true;
        }

        // using <= here so that we can add to the last place not only by using -1 by also by using (lastIndex+1)
        return itemIndex <= section.items.length;
    }
}

export function validateItemExists(
    section: ExtendedDashboardLayoutSection,
    index: ILayoutItemPath | number,
): boolean {
    if (typeof index === "number") {
        return index > -1 && index < section.items.length;
    } else {
        const itemIndex = getItemIndex(index);
        return itemIndex > -1 && itemIndex < section.items.length;
    }
}
