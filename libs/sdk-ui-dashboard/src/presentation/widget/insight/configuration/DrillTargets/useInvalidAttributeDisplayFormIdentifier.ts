// (C) 2020-2025 GoodData Corporation

import { useMemo } from "react";

import { IAttributeDescriptor, areObjRefsEqual, idRef } from "@gooddata/sdk-model";

import { getAttributeIdentifiersPlaceholdersFromUrl } from "../../../../../_staging/drills/drillingUtils.js";
import { selectAllCatalogDisplayFormsMap, useDashboardSelector } from "../../../../../model/index.js";
import { UrlDrillTarget, isDrillToCustomUrlConfig } from "../../../../drill/types.js";

export function useInvalidAttributeDisplayFormIdentifiers(
    urlDrillTarget: UrlDrillTarget | undefined,
    attributes: IAttributeDescriptor[],
) {
    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useMemo(() => {
        if (isDrillToCustomUrlConfig(urlDrillTarget)) {
            const parameters = getAttributeIdentifiersPlaceholdersFromUrl(urlDrillTarget.customUrl);
            return parameters
                .filter(({ identifier }) => {
                    // parameter is invalid if either it points to display form that no longer exists
                    const relevantDf = displayForms.get(idRef(identifier, "displayForm"));
                    if (!relevantDf) {
                        return false;
                    }
                    // or if it points to an attribute that is no longer a valid drill target
                    return !attributes.some((attribute) =>
                        areObjRefsEqual(relevantDf.attribute, attribute.attributeHeader.formOf),
                    );
                })
                .map(({ identifier }) => identifier);
        }
        return [];
    }, [displayForms, urlDrillTarget, attributes]);
}
