// (C) 2022-2025 GoodData Corporation
import {
    IDashboardLayoutItem,
    IDashboardLayoutSection,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";

/**
 * This function is used to transform switcher widget to multiple slides. Each slide contains one visualization
 * from the switcher.
 *
 * @param item - current item to transform
 */
export function switcherSlideTransformer<TWidget>(
    item: IDashboardLayoutItem<TWidget>,
): IDashboardLayoutSection<TWidget>[] | undefined {
    if (isVisualizationSwitcherWidget(item.widget)) {
        return item.widget.visualizations.map((visualization) => {
            return {
                type: "IDashboardLayoutSection",
                items: [
                    {
                        widget: visualization as TWidget,
                        type: "IDashboardLayoutItem",
                        size: {
                            xl: {
                                ...item.size.xl,
                                gridWidth: 12,
                            },
                        },
                    },
                ],
            } as IDashboardLayoutSection<TWidget>;
        });
    }
    return undefined;
}
