// (C) 2020-2022 GoodData Corporation

import { areObjRefsEqual, IAttributeDescriptor, idRef } from "@gooddata/sdk-model";
import { UrlDrillTarget, isDrillToCustomUrlConfig } from "../../../../drill/types";
import { useDashboardSelector, selectAllCatalogDisplayFormsMap } from "../../../../../model";
import { useMemo } from "react";

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

interface IDrillToUrlPlaceholder {
    placeholder: string;
    identifier: string;
    toBeEncoded: boolean;
}

const getAttributeIdentifiersPlaceholdersFromUrl = (url: string): IDrillToUrlPlaceholder[] =>
    matchAll(/\{attribute_title\((.*?)\)\}/g, url).map((match) => ({
        placeholder: match[0],
        identifier: match[1],
        toBeEncoded: match.index !== 0,
    }));

function matchAll(regex: RegExp, text: string): RegExpExecArray[] {
    const matches = [];
    let match = null;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match);
    }
    return matches;
}
