// (C) 2022-2025 GoodData Corporation
import { IDashboardLayoutItem, IDashboardLayoutSection } from "@gooddata/sdk-model";

/**
 * This function is used to transform each item in the section to a slide.
 *
 * @param section - current section to transform
 * @param transform - function to transform each item in the section
 */
export function itemsSlideTransformer<TWidget>(
    section: IDashboardLayoutSection<TWidget>,
    transform: (item: IDashboardLayoutItem<TWidget>) => IDashboardLayoutSection<TWidget>[],
) {
    const items = section.items.reduce((acc, item) => {
        return [...acc, ...transform(item)];
    }, [] as IDashboardLayoutSection<TWidget>[]);

    return items.length > 0 ? items : undefined;
}
