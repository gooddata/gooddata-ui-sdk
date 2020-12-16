// (C) 2019-2020 GoodData Corporation
import {
    NotSupported,
    FilterContextItem,
    IDashboardDateFilter,
    IDashboardAttributeFilter,
    isDateFilterGranularity,
} from "@gooddata/sdk-backend-spi";
import {
    isAbsoluteDateFilter,
    isRelativeDateFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    isAttributeElementsByRef,
    uriRef,
} from "@gooddata/sdk-model";
import { IDashboardFilter } from "../../DashboardView/types";

export const dashboardFilterToFilterContextItem = (filter: IDashboardFilter): FilterContextItem => {
    if (isNegativeAttributeFilter(filter)) {
        if (!isAttributeElementsByRef(filter.negativeAttributeFilter.notIn)) {
            // For attributes with a lot of elements, this transformation can be very expensive.
            // Let's enforce user to provide element uris by himself.
            throw new NotSupported(
                "Attribute filter with text values is not supported. Please provide element uris instead.",
            );
        }
        const filterContextItem: IDashboardAttributeFilter = {
            attributeFilter: {
                negativeSelection: false,
                displayForm: filter.negativeAttributeFilter.displayForm,
                attributeElements: filter.negativeAttributeFilter.notIn.uris.map(uriRef),
            },
        };

        return filterContextItem;
    } else if (isPositiveAttributeFilter(filter)) {
        if (!isAttributeElementsByRef(filter.positiveAttributeFilter.in)) {
            // For attributes with a lot of elements, this transformation can be very expensive.
            // Let's enforce user to provide element uris by himself.
            throw new NotSupported(
                "Attribute filter with text values is not supported. Please provide element uris instead.",
            );
        }
        const filterContextItem: IDashboardAttributeFilter = {
            attributeFilter: {
                negativeSelection: false,
                displayForm: filter.positiveAttributeFilter.displayForm,
                attributeElements: filter.positiveAttributeFilter.in.uris.map(uriRef),
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
};
