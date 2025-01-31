// (C) 2022-2025 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutSection } from "@gooddata/sdk-model";

import { sectionLayoutSection } from "./sectionSlideTransformer.js";

/**
 * Transforms layout to export format
 *
 * @param layout - layout to transform
 */
export function layoutTransformer<TWidget>(layout: IDashboardLayout<TWidget>): IDashboardLayout<TWidget> {
    const sections =
        layout?.sections.reduce((acc, section) => {
            const res = sectionLayoutSection(section);
            return [...acc, ...(res ? res : [])];
        }, [] as IDashboardLayoutSection<TWidget>[]) ?? [];

    return {
        ...layout,
        type: "IDashboardLayout",
        sections,
    };
}
