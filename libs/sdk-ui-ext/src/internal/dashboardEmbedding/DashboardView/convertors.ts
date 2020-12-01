// (C) 2020 GoodData Corporation
import compact from "lodash/compact";
import flatMap from "lodash/flatMap";
import { DrillDefinition } from "@gooddata/sdk-backend-spi";
import { isLocalIdRef, isIdentifierRef, isUriRef } from "@gooddata/sdk-model";
import { HeaderPredicates, IHeaderPredicate } from "@gooddata/sdk-ui";

export function widgetDrillsToDrillPredicates(drills: DrillDefinition[]): IHeaderPredicate[] {
    return flatMap(drills, (drill): IHeaderPredicate[] => {
        const origin = drill.origin.measure;
        // add drillable items for all three types of objRefs that the origin measure can be
        return compact([
            isLocalIdRef(origin) && HeaderPredicates.localIdentifierMatch(origin.localIdentifier),
            isIdentifierRef(origin) && HeaderPredicates.identifierMatch(origin.identifier),
            isUriRef(origin) && HeaderPredicates.uriMatch(origin.uri),
        ]);
    });
}
