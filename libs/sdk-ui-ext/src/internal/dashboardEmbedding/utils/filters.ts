// (C) 2019-2021 GoodData Corporation
import {
    NotSupported,
    FilterContextItem,
    IDashboardDateFilter,
    IDashboardAttributeFilter,
    isDateFilterGranularity,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import {
    isAbsoluteDateFilter,
    isRelativeDateFilter,
    isNegativeAttributeFilter,
    isAttributeElementsByRef,
    filterAttributeElements,
    filterObjRef,
    isAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newAbsoluteDateFilter,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";
import { IDashboardFilter } from "../types";

export function dashboardFilterToFilterContextItem(filter: IDashboardFilter): FilterContextItem {
    if (isAttributeFilter(filter)) {
        const attributeElements = filterAttributeElements(filter);
        if (!isAttributeElementsByRef(attributeElements)) {
            // For attributes with a lot of elements, this transformation can be very expensive.
            // Let's enforce user to provide element uris by himself.
            throw new NotSupported(
                "Attribute filter with text values is not supported. Please provide element uris instead.",
            );
        }
        const filterContextItem: IDashboardAttributeFilter = {
            attributeFilter: {
                negativeSelection: isNegativeAttributeFilter(filter),
                displayForm: filterObjRef(filter),
                attributeElements,
            },
        };

        return filterContextItem;
    } else if (isAbsoluteDateFilter(filter)) {
        const filterContextItem: IDashboardDateFilter = {
            dateFilter: {
                type: "absolute",
                granularity: "GDC.time.date",
                from: filter.absoluteDateFilter.from,
                to: filter.absoluteDateFilter.to,
                dataSet: filter.absoluteDateFilter.dataSet,
            },
        };

        return filterContextItem;
    } else if (isRelativeDateFilter(filter)) {
        if (!isDateFilterGranularity(filter.relativeDateFilter.granularity)) {
            // Only a subset of granularity can be stored in the filter context.
            throw new NotSupported(
                "Unsupported date filter granularity! Please provide valid date filter granularity. (Check DateFilterGranularity type)",
            );
        }
        const filterContextItem: IDashboardDateFilter = {
            dateFilter: {
                type: "relative",
                granularity: filter.relativeDateFilter.granularity,
                from: filter.relativeDateFilter.from,
                to: filter.relativeDateFilter.to,
                dataSet: filter.relativeDateFilter.dataSet,
            },
        };

        return filterContextItem;
    }

    throw new NotSupported("Unsupported filter type! Please provide valid dashboard filter.");
}

export function filterContextItemToDashboardFilter(filter: FilterContextItem): IDashboardFilter {
    if (isDashboardAttributeFilter(filter)) {
        const { attributeFilter } = filter;
        if (attributeFilter.negativeSelection) {
            return newNegativeAttributeFilter(attributeFilter.displayForm, attributeFilter.attributeElements);
        } else {
            return newPositiveAttributeFilter(attributeFilter.displayForm, attributeFilter.attributeElements);
        }
    } else {
        const { dateFilter } = filter;
        if (dateFilter.type === "absolute") {
            return newAbsoluteDateFilter(
                dateFilter.dataSet,
                dateFilter.from?.toString(),
                dateFilter.to?.toString(),
            );
        } else {
            return newRelativeDateFilter(
                dateFilter.dataSet,
                dateFilter.granularity,
                Number.parseInt(filter.dateFilter.from?.toString() ?? "0", 10),
                Number.parseInt(filter.dateFilter.to?.toString() ?? "0", 10),
            );
        }
    }
}
