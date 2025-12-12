// (C) 2022-2025 GoodData Corporation
import { type IDashboardLayoutItem, type IDashboardLayoutSection } from "@gooddata/sdk-model";

export function widgetSlideTransformer<TWidget>(
    item: IDashboardLayoutItem<TWidget>,
): IDashboardLayoutSection<TWidget>[] {
    const base = {
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
                        xs: base,
                        md: base,
                        sm: base,
                        lg: base,
                    },
                },
            ],
        },
    ];
}
