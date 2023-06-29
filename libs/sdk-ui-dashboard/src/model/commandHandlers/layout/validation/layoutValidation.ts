// (C) 2021-2022 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-model";
import { ExtendedDashboardLayoutSection, ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import isEmpty from "lodash/isEmpty.js";

export function validateSectionPlacement(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    index: number,
): boolean {
    if (index === -1) {
        return true;
    }

    if (isEmpty(layout.sections) && !index) {
        return true;
    }

    // using <= here so that we can add to the last place not only by using -1 by also by using (lastIndex+1)
    return index <= layout.sections.length;
}

export function validateSectionExists(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    index: number,
): boolean {
    return index > -1 && index < layout.sections.length;
}

export function validateItemPlacement(section: ExtendedDashboardLayoutSection, index: number): boolean {
    if (index === -1) {
        return true;
    }

    if (isEmpty(section.items) && !index) {
        return true;
    }

    // using <= here so that we can add to the last place not only by using -1 by also by using (lastIndex+1)
    return index <= section.items.length;
}

export function validateItemExists(section: ExtendedDashboardLayoutSection, index: number): boolean {
    return index > -1 && index < section.items.length;
}
