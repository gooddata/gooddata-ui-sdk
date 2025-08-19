// (C) 2022-2025 GoodData Corporation
import { IDashboardLayoutSection } from "@gooddata/sdk-model";

import { breakupSlideTransformer } from "./breakupSlideTransformer.js";
import { containerSlideTransformer } from "./containerSlideTransformer.js";
import { itemsSlideTransformer } from "./itemsSlideTransformer.js";
import { switcherSlideTransformer } from "./switcherSlideTransformer.js";
import { widgetSlideTransformer } from "./widgetSlideTransformer.js";

export function sectionLayoutSection<TWidget>(
    section: IDashboardLayoutSection<TWidget>,
): IDashboardLayoutSection<TWidget>[] | undefined {
    const slidesBreakup = breakupSlideTransformer(section);
    const slides = sectionItemsLayoutSection(section);
    const res = [...(slidesBreakup ? slidesBreakup : []), ...(slides ? slides : [])];
    return res.length ? res : undefined;
}

export function sectionItemsLayoutSection<TWidget>(section: IDashboardLayoutSection<TWidget>) {
    return itemsSlideTransformer(section, (item) => {
        return (
            containerSlideTransformer(item, sectionLayoutSection) ||
            switcherSlideTransformer(item) ||
            widgetSlideTransformer(item)
        );
    });
}
