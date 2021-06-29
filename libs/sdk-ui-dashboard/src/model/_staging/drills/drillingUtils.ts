// (C) 2020-2021 GoodData Corporation
import compact from "lodash/compact";
import { DrillDefinition, ICatalogAttribute, ICatalogDateAttribute } from "@gooddata/sdk-backend-spi";
import { isLocalIdRef, isIdentifierRef, isUriRef, areObjRefsEqual, localIdRef } from "@gooddata/sdk-model";
import { HeaderPredicates, IAvailableDrillTargetAttribute, IHeaderPredicate } from "@gooddata/sdk-ui";
import { IDrillDownDefinition } from "@gooddata/sdk-ui-ext";

interface IImplicitDrillWithPredicates {
    drillDefinition: DrillDefinition | IDrillDownDefinition;
    predicates: IHeaderPredicate[];
}

function widgetDrillToDrillPredicates(drill: DrillDefinition): IHeaderPredicate[] {
    const origin = drill.origin.measure;
    // add drillable items for all three types of objRefs that the origin measure can be
    return compact([
        isLocalIdRef(origin) && HeaderPredicates.localIdentifierMatch(origin.localIdentifier),
        isIdentifierRef(origin) && HeaderPredicates.identifierMatch(origin.identifier),
        isUriRef(origin) && HeaderPredicates.uriMatch(origin.uri),
    ]);
}

function insightWidgetImplicitDrills(insightWidgetDrills: DrillDefinition[]): IImplicitDrillWithPredicates[] {
    return insightWidgetDrills.map((drill): IImplicitDrillWithPredicates => {
        return {
            drillDefinition: drill,
            predicates: widgetDrillToDrillPredicates(drill),
        };
    });
}

function insightDrillDownImplicitDrills(
    possibleDrills: IAvailableDrillTargetAttribute[],
    attributesWithDrillDown: Array<ICatalogAttribute | ICatalogDateAttribute>,
): IImplicitDrillWithPredicates[] {
    const drillsWitDrillDown = possibleDrills.filter((candidate) => {
        return attributesWithDrillDown.some((attr) =>
            areObjRefsEqual(attr.attribute.ref, candidate.attribute.attributeHeader.formOf.ref),
        );
    });

    return drillsWitDrillDown.map((drill): IImplicitDrillWithPredicates => {
        const matchingCatalogAttribute = attributesWithDrillDown.find((attr) =>
            areObjRefsEqual(attr.attribute.ref, drill.attribute.attributeHeader.formOf.ref),
        );

        return {
            drillDefinition: {
                type: "drillDown",
                origin: localIdRef(drill.attribute.attributeHeader.localIdentifier),
                target: matchingCatalogAttribute!.attribute.drillDownStep!,
            },
            predicates: [
                // add drillable items for both types of objRefs that the header can be
                HeaderPredicates.identifierMatch(drill.attribute.attributeHeader.identifier),
                HeaderPredicates.uriMatch(drill.attribute.attributeHeader.uri),
            ],
        };
    });
}

/**
 * Returns a collection of pairs consisting of a drill definition and all its predicates.
 *
 * @param insightWidgetDrills - drills from the insight widget itself
 * @param possibleDrills - possible drill targets returned by pushData (this contains all attributes in the visualization)
 * @param attributesWithDrillDown - all the attributes in the catalog that have drill down step defined
 */
export function getImplicitDrillsWithPredicates(
    insightWidgetDrills: DrillDefinition[],
    possibleDrills: IAvailableDrillTargetAttribute[],
    attributesWithDrillDown: Array<ICatalogAttribute | ICatalogDateAttribute>,
    disableWidgetDrills?: boolean,
): IImplicitDrillWithPredicates[] {
    let drills = insightDrillDownImplicitDrills(possibleDrills, attributesWithDrillDown);

    if (!disableWidgetDrills) {
        drills = [...drills, ...insightWidgetImplicitDrills(insightWidgetDrills)];
    }

    return drills;
}
