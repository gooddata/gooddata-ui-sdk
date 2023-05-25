// (C) 2022-2023 GoodData Corporation
import { useMemo } from "react";
import { invariant } from "ts-invariant";

import { IDashboardAttributeFilter, IDashboardAttributeFilterParent } from "@gooddata/sdk-model";

/**
 * @internal
 */
export function useOriginalConfigurationState(
    neighborFilters: IDashboardAttributeFilter[],
    filterElementsBy: IDashboardAttributeFilterParent[] | undefined,
) {
    return useMemo(() => {
        return neighborFilters.map((neighborFilter) => {
            const neighborFilterLocalId = neighborFilter.attributeFilter.localIdentifier;
            const neighborFilterDisplayForm = neighborFilter.attributeFilter.displayForm;
            const neighborFilterTitle = neighborFilter.attributeFilter.title;

            const isSelected =
                filterElementsBy?.some((by) => by.filterLocalIdentifier === neighborFilterLocalId) || false;

            const overAttributes = filterElementsBy?.find(
                (by) => by.filterLocalIdentifier === neighborFilterLocalId,
            )?.over.attributes;

            invariant(
                neighborFilterLocalId,
                "Cannot initialize the attribute filter configuration panel, neighbor filter has missing 'localIdentifier' property.",
            );

            return {
                localIdentifier: neighborFilterLocalId,
                displayForm: neighborFilterDisplayForm,
                isSelected,
                overAttributes: overAttributes,
                selectedConnectingAttribute: overAttributes?.[0],
                title: neighborFilterTitle,
            };
        });
    }, [neighborFilters, filterElementsBy]);
}
