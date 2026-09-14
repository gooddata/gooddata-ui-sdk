// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import { type IAttributeDescriptor, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    getAttributeIdentifiersPlaceholdersFromUrl,
    placeholderIdentifierText,
} from "@gooddata/sdk-model/internal";

import { useDashboardSelector } from "../../../../../model/react/DashboardStoreProvider.js";
import { selectAllCatalogDisplayFormsMap } from "../../../../../model/store/catalog/catalogSelectors.js";
import { type UrlDrillTarget, isDrillToCustomUrlConfig } from "../../../../drill/types.js";

export function useInvalidAttributeDisplayFormIdentifiers(
    urlDrillTarget: UrlDrillTarget | undefined,
    attributes: IAttributeDescriptor[],
) {
    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useMemo(() => {
        if (isDrillToCustomUrlConfig(urlDrillTarget)) {
            const parameters = getAttributeIdentifiersPlaceholdersFromUrl(urlDrillTarget.customUrl);
            return (
                parameters
                    .filter(({ ref }) => {
                        // parameter is invalid if either it points to display form that no longer exists
                        const relevantDf = displayForms.get(ref);
                        if (!relevantDf) {
                            return false;
                        }
                        // or if it points to an attribute that is no longer a valid drill target
                        return !attributes.some((attribute) =>
                            areObjRefsEqual(relevantDf.attribute, attribute.attributeHeader.formOf),
                        );
                    })
                    // named as it is written in the URL, so the warning quotes text the user can find there
                    .map(({ ref }) => placeholderIdentifierText(ref))
            );
        }
        return [];
    }, [displayForms, urlDrillTarget, attributes]);
}
