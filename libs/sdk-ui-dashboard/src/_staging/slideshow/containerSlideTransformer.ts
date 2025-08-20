// (C) 2022-2025 GoodData Corporation
import { IDashboardLayoutItem, IDashboardLayoutSection, isDashboardLayout } from "@gooddata/sdk-model";

import { containsVisualizationSwitcher } from "./utils/index.js";

/**
 * This function is used to transform inner container item in the layout to a slide. Container item is
 * transformed as a structured slide, but if it contains a visualization switcher, it is transformed
 * to a flat list of visualizations.
 *
 * @param item - current item to transform
 * @param transformLayoutSection - function to transform each section in the layout
 */
export function containerSlideTransformer<TWidget>(
    item: IDashboardLayoutItem<TWidget>,
    transformLayoutSection: (
        section: IDashboardLayoutSection<TWidget>,
    ) => IDashboardLayoutSection<TWidget>[] | undefined,
): IDashboardLayoutSection<TWidget>[] | undefined {
    if (isDashboardLayout(item.widget)) {
        // If the layout contains a visualization switcher, transform it to a flat list of visualizations
        if (containsVisualizationSwitcher(item.widget)) {
            return item.widget.sections.reduce((acc, section) => {
                const res = transformLayoutSection(section as IDashboardLayoutSection<TWidget>);
                return [...acc, ...(res || [])];
            }, [] as IDashboardLayoutSection<TWidget>[]);

            // If the layout does not contain a visualization switcher use whole content as a single slide
        } else {
            const base = {
                ...item.size?.xl,
                gridWidth: 12,
                gridHeight: 22,
            };

            return [
                {
                    type: "IDashboardLayoutSection",
                    items: [
                        {
                            ...item,
                            size: {
                                xl: base,
                                lg: base,
                                xs: base,
                                sm: base,
                                md: base,
                            },
                        },
                    ],
                },
            ];
        }
    }
    return undefined;
}
