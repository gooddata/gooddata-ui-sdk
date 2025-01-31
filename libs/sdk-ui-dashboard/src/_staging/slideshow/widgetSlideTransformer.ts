// (C) 2022-2025 GoodData Corporation
import { IDashboardLayoutItem, IDashboardLayoutSection } from "@gooddata/sdk-model";

export function widgetSlideTransformer<TWidget>(
    item: IDashboardLayoutItem<TWidget>,
): IDashboardLayoutSection<TWidget>[] {
    return [
        {
            type: "IDashboardLayoutSection",
            items: [
                {
                    ...item,
                    size: {
                        xl: {
                            gridWidth: 12,
                            gridHeight: 22,
                        },
                    },
                },
            ],
        },
    ];
}
