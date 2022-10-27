// (C) 2020-2022 GoodData Corporation

import { UrlDrillTarget, isDrillToCustomUrlConfig } from "../../../../drill/types";
import { useDashboardSelector, selectAllCatalogDisplayFormsMap } from "../../../../../model";
import { useMemo } from "react";

export function useInvalidAttributeDisplayFormIdentifiers(urlDrillTarget: UrlDrillTarget | undefined) {
    const displayForms = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useMemo(() => {
        if (isDrillToCustomUrlConfig(urlDrillTarget)) {
            const parameters = getAttributeIdentifiersPlaceholdersFromUrl(urlDrillTarget.customUrl);
            return parameters
                .filter(({ identifier }) => !displayForms.get({ identifier }))
                .map(({ identifier }) => identifier);
        }
        return [];
    }, [displayForms, urlDrillTarget]);
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
