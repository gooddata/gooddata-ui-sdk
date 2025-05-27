// (C) 2020-2025 GoodData Corporation

import { filterLocalIdentifier, IFilter } from "@gooddata/sdk-model";
import { ICrossFilteringItem } from "../../store/index.js";

/**
 * @internal
 */
function removeCrossFilteringFilters(
    filters: IFilter[],
    crossFilteringItems: ICrossFilteringItem[],
): IFilter[] {
    const crossFilteringFilterLocalIdentifiers = crossFilteringItems.flatMap((c) => c.filterLocalIdentifiers);
    return filters.filter((f) => {
        const filterLocalId = filterLocalIdentifier(f);
        return filterLocalId ? !crossFilteringFilterLocalIdentifiers.includes(filterLocalId) : true;
    });
}

/**
 * @internal
 */
export function sanitizeWidgetFilters(
    filters: IFilter[],
    crossFilteringItems: ICrossFilteringItem[],
): IFilter[] {
    return removeCrossFilteringFilters(filters, crossFilteringItems);
}
