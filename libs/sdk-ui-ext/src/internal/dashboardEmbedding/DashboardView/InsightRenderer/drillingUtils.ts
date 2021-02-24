// (C) 2020 GoodData Corporation
import compact from "lodash/compact";
import flatMap from "lodash/flatMap";
import { DrillDefinition, ICatalogAttribute, ICatalogDateAttribute } from "@gooddata/sdk-backend-spi";
import { isLocalIdRef, isIdentifierRef, isUriRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { HeaderPredicates, IAvailableDrillTargetAttribute, IHeaderPredicate } from "@gooddata/sdk-ui";

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

export function insightDrillDownPredicates(
    possibleDrills: IAvailableDrillTargetAttribute[],
    attributesWithDrillDown: Array<ICatalogAttribute | ICatalogDateAttribute>,
): IHeaderPredicate[] {
    const drillsWitDrillDown = possibleDrills.filter((candidate) => {
        return attributesWithDrillDown.some((attr) =>
            areObjRefsEqual(attr.attribute.ref, candidate.attribute.attributeHeader.formOf.ref),
        );
    });

    return flatMap(drillsWitDrillDown, (drill): IHeaderPredicate[] => {
        // add drillable items for both types of objRefs that the attribute can be
        return [
            HeaderPredicates.identifierMatch(drill.attribute.attributeHeader.identifier),
            HeaderPredicates.uriMatch(drill.attribute.attributeHeader.uri),
        ];
    });
}
