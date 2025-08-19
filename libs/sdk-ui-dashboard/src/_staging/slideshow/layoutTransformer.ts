// (C) 2022-2025 GoodData Corporation
import { IDashboardLayout, IDashboardLayoutSection } from "@gooddata/sdk-model";

import { sectionLayoutSection } from "./sectionSlideTransformer.js";
import { singleWidgetTransformer } from "./singleWidgetTransformer.js";
import { findFocusedWidget } from "./utils/index.js";
import { DashboardFocusObject } from "../../model/index.js";

/**
 * Transforms layout to export format
 *
 * @param layout - layout to transform
 * @param focusObject - focus object
 */
export function layoutTransformer<TWidget>(
    layout: IDashboardLayout<TWidget>,
    focusObject?: DashboardFocusObject,
): IDashboardLayout<TWidget> {
    const focusedWidget = findFocusedWidget(layout, focusObject?.widgetId);
    if (focusedWidget) {
        return singleWidgetTransformer(layout, focusedWidget);
    }

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
