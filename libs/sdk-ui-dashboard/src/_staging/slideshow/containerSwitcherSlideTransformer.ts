// (C) 2022-2025 GoodData Corporation
import {
    IDashboardLayoutItem,
    IDashboardLayoutSection,
    isDashboardLayout,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import cloneDeep from "lodash/cloneDeep.js";

import { containsVisualizationSwitcher } from "./utils/index.js";
import { containerSlideTransformer } from "./containerSlideTransformer.js";
import { objRef } from "../../model/utils/objRef.js";

/**
 *
 * @param item - current item to transform
 * @param transformLayoutSection - function to transform each section in the layout
 */
export function containerSwitcherSlideTransformer<TWidget>(
    item: IDashboardLayoutItem<TWidget>,
    transformLayoutSection: (
        section: IDashboardLayoutSection<TWidget>,
    ) => IDashboardLayoutSection<TWidget>[] | undefined,
): IDashboardLayoutSection<TWidget>[] | undefined {
    if (isDashboardLayout<TWidget>(item.widget)) {
        // If the layout contains a visualization switcher, iterate over all visualizations in
        // all switchers and create a slide for each visualization
        if (containsVisualizationSwitcher(item.widget)) {
            const totalIterations = calculateMaximumVisualisationsInSwitcher(item.widget, 0);
            const slides: IDashboardLayoutSection<TWidget>[] = [];
            for (let i = 0; i < totalIterations; i++) {
                slides.push({
                    type: "IDashboardLayoutSection",
                    items: [pickVisualisationFromSwitchersOnIndex<TWidget>(cloneDeep(item), i)],
                });
            }
            return slides;
        } else {
            //Default behaviour
            return containerSlideTransformer(item, transformLayoutSection);
        }
    }
    return undefined;
}

/**
 * This method get maximum count of visualizations in one of the switchers in the layout
 *
 * @param widget - current widget
 * @param current - current maximum count of visualizations in switcher
 */
function calculateMaximumVisualisationsInSwitcher<TWidget>(widget: TWidget, current: number) {
    if (!isDashboardLayout(widget)) {
        return current;
    }
    for (const section of widget.sections) {
        for (const item of section.items) {
            if (isDashboardLayout(item.widget)) {
                return calculateMaximumVisualisationsInSwitcher(item.widget, current);
            } else if (isVisualizationSwitcherWidget(item.widget)) {
                return Math.max(item.widget.visualizations.length, current);
            }
        }
    }
    return current;
}

/**
 * This visualisation retrieve visualisation from all nested switchers on index and create a
 * copy of layout where all switchers are replaced by single visualisation
 *
 * @param item - current item to transform
 * @param index - index of visualisation in switcher
 */
function pickVisualisationFromSwitchersOnIndex<TWidget>(
    item: IDashboardLayoutItem<TWidget>,
    index: number,
): IDashboardLayoutItem<TWidget> {
    if (isDashboardLayout(item.widget)) {
        const sections = item.widget.sections.map((section) => {
            return {
                ...section,
                items: section.items.map((item) => {
                    return pickVisualisationFromSwitchersOnIndex(item, index);
                }),
            };
        }) as IDashboardLayoutSection<TWidget>[];

        return {
            ...item,
            widget: {
                ...item.widget,
                sections,
            },
        };
    } else if (isVisualizationSwitcherWidget(item.widget)) {
        const vis = item.widget.visualizations[index];

        if (!vis) {
            return {
                widget: createEmptyText<TWidget>(),
                type: "IDashboardLayoutItem",
                size: item.size,
            };
        }

        return {
            widget: vis as TWidget,
            type: "IDashboardLayoutItem",
            size: item.size,
        };
    } else {
        return {
            ...item,
        };
    }
}

function createEmptyText<TWidget>(): TWidget {
    return {
        type: "richText",
        content: "",
        title: "",
        description: "",
        ignoreDashboardFilters: false,
        drills: [],
        ref: objRef("", ""),
        uri: "",
        identifier: "",
    } as TWidget;
}
