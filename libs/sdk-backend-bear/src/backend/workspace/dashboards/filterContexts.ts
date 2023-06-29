// (C) 2021-2022 GoodData Corporation
import compact from "lodash/compact.js";
import flatMap from "lodash/flatMap.js";
import zip from "lodash/zip.js";
import {
    ObjRef,
    uriRef,
    FilterContextItem,
    IDashboardAttributeFilterParent,
    IFilterContextDefinition,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";

type ObjRefsToUris = (refs: ObjRef[]) => Promise<string[]>;

/**
 * Since bear backend does not support idRefs in filter context objects, we need to covert them to uriRefs if they are present.
 *
 * @param filterContext - filter context to sanitize
 * @param objRefsToUris - function converting ObjRefs to URIs
 * @returns filter context that uses uriRefs exclusively in its filters
 */
export async function sanitizeFilterContext<T extends IFilterContextDefinition>(
    filterContext: T,
    objRefsToUris: ObjRefsToUris,
): Promise<T> {
    const { filters } = filterContext;
    if (!filters.length) {
        return filterContext;
    }

    const refs = compact(
        flatMap(filters, (filter) => {
            const ref = getDashboardFilterRef(filter);

            const overRefs = isDashboardAttributeFilter(filter)
                ? flatMap(filter.attributeFilter.filterElementsBy ?? [], (item) => item.over.attributes)
                : [];

            return [ref, ...overRefs];
        }),
    );

    const convertedRefs = await objRefsToUris(refs);

    const refUriPairs = zip(refs, convertedRefs) as [ObjRef, string][];

    const sanitizedFilters = filters.map((filter): FilterContextItem => {
        const originalRef = getDashboardFilterRef(filter);
        if (!originalRef) {
            return filter;
        }

        // we can use referential comparison here, the objects are the same
        const refMatch = refUriPairs.find(([ref]) => ref === originalRef);

        // this indicates a serious fault in the logic
        invariant(refMatch);

        const sanitizedRef = uriRef(refMatch[1]);

        if (isDashboardAttributeFilter(filter)) {
            const sanitizedFilterElementsBy = filter.attributeFilter.filterElementsBy?.map(
                (item): IDashboardAttributeFilterParent => ({
                    ...item,
                    over: {
                        ...item.over,
                        attributes: item.over.attributes.map((attrRef) => {
                            // we can use referential comparison here, the objects are the same
                            const attrMatch = refUriPairs.find(([ref]) => ref === attrRef);

                            // this indicates a serious fault in the logic
                            invariant(attrMatch);
                            return uriRef(attrMatch[1]);
                        }),
                    },
                }),
            );

            return {
                attributeFilter: {
                    ...filter.attributeFilter,
                    displayForm: sanitizedRef,
                    filterElementsBy: sanitizedFilterElementsBy,
                },
            };
        } else {
            return {
                dateFilter: {
                    ...filter.dateFilter,
                    dataSet: sanitizedRef,
                },
            };
        }
    });

    return {
        ...filterContext,
        filters: sanitizedFilters,
    };
}

function getDashboardFilterRef(filter: FilterContextItem): ObjRef | undefined {
    return isDashboardAttributeFilter(filter)
        ? filter.attributeFilter.displayForm
        : filter.dateFilter.dataSet;
}
