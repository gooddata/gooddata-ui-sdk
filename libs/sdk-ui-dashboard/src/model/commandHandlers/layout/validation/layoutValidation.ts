// (C) 2021-2022 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-model";
import { ExtendedDashboardLayoutSection, ExtendedDashboardWidget } from "../../../types/layoutTypes";
import isEmpty from "lodash/isEmpty";

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

    return index < layout.sections.length;
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

    return index < section.items.length;
}

export function validateItemExists(section: ExtendedDashboardLayoutSection, index: number): boolean {
    return index > -1 && index < section.items.length;
}
