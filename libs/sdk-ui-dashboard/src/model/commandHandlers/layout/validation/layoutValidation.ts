// (C) 2021 GoodData Corporation
import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
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
    return index < layout.sections.length;
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
