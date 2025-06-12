// (C) 2025 GoodData Corporation
import { IDashboardLayoutSection } from "@gooddata/sdk-model";

/**
 * This function is used to transform each section title and description in the layout to a breakup slide.
 * Create slide only if section has title or description. Breakup slide is standalone slide with title
 * and description only.
 *
 * @param section - current section to transform
 */
export function breakupSlideTransformer<TWidget>(
    section: IDashboardLayoutSection<TWidget>,
): IDashboardLayoutSection<TWidget>[] | undefined {
    if (section.header?.title || section.header?.description) {
        return [
            {
                header: section.header,
                type: "IDashboardLayoutSection",
                items: [],
            },
        ];
    }
    return undefined;
}
