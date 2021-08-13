// (C) 2020-2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import compact from "lodash/compact";
import {
    DrillDefinition,
    ICatalogAttribute,
    ICatalogDateAttribute,
    isDrillFromAttribute,
    isDrillFromMeasure,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    isLocalIdRef,
    isIdentifierRef,
    isUriRef,
    ObjRef,
    areObjRefsEqual,
    ObjRefInScope,
    localIdRef,
} from "@gooddata/sdk-model";
import {
    HeaderPredicates,
    IAvailableDrillTargetAttribute,
    IAvailableDrillTargets,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";
import { createMemoizedSelector } from "../_infra/selectors";
import { DashboardDrillDefinition } from "../../../types";
/////
import { selectWidgetDrills } from "../layout/layoutSelectors";
import { selectDrillTargetsByWidgetRef } from "../drillTargets/drillTargetsSelectors";
import { selectAttributesWithDrillDown } from "../catalog/catalogSelectors";
import { selectDrillableItems } from "../drill/drillSelectors";
import { selectDisableDefaultDrills } from "../config/configSelectors";
import flatMap from "lodash/flatMap";

/**
 * @internal
 */
export interface IImplicitDrillWithPredicates {
    drillDefinition: DashboardDrillDefinition;
    predicates: IHeaderPredicate[];
}

function drillDefinitionToPredicates(drill: DrillDefinition): IHeaderPredicate[] {
    let origin: ObjRefInScope;
    if (isDrillFromMeasure(drill.origin)) {
        origin = drill.origin.measure;
    } else if (isDrillFromAttribute(drill.origin)) {
        origin = drill.origin.attribute;
    } else {
        throw new UnexpectedError("Unknown drill origin!");
    }

    // add drillable items for all three types of objRefs that the origin measure can be
    return compact([
        isLocalIdRef(origin) && HeaderPredicates.localIdentifierMatch(origin.localIdentifier),
        isIdentifierRef(origin) && HeaderPredicates.identifierMatch(origin.identifier),
        isUriRef(origin) && HeaderPredicates.uriMatch(origin.uri),
    ]);
}

function getDrillDownDefinitionsWithPredicates(
    availableDrillAttributes: IAvailableDrillTargetAttribute[],
    attributesWithDrillDown: Array<ICatalogAttribute | ICatalogDateAttribute>,
): IImplicitDrillWithPredicates[] {
    const matchingAvailableDrillAttributes = availableDrillAttributes.filter((candidate) => {
        return attributesWithDrillDown.some((attr) =>
            areObjRefsEqual(attr.attribute.ref, candidate.attribute.attributeHeader.formOf.ref),
        );
    });

    return matchingAvailableDrillAttributes.map((drill): IImplicitDrillWithPredicates => {
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

function getDrillDefinitionsWithPredicates(
    insightWidgetDrills: DrillDefinition[],
): IImplicitDrillWithPredicates[] {
    return insightWidgetDrills.map((drill): IImplicitDrillWithPredicates => {
        return {
            drillDefinition: drill,
            predicates: drillDefinitionToPredicates(drill),
        };
    });
}

//
// Following selectors are for the 1st level insight widget (insight widget on the dashboard)
//

/**
 * @internal
 */
export const selectInsightWidgeImplicitDrillDownsByRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectDrillTargetsByWidgetRef(ref),
        selectAttributesWithDrillDown,
        (availableDrillTargets, attributesWithDrillDown) => {
            const availableDrillAttributes = availableDrillTargets?.availableDrillTargets?.attributes ?? [];
            return getDrillDownDefinitionsWithPredicates(availableDrillAttributes, attributesWithDrillDown);
        },
    ),
);

/**
 * @internal
 */
export const selectInsightWidgetImplicitDrillsByRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectWidgetDrills(ref), (drills = []) => {
        return getDrillDefinitionsWithPredicates(drills);
    }),
);

/**
 * @internal
 */
export const selectInsightWidgetImplicitDrillsAndDrillDownsByRef = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectInsightWidgetImplicitDrillsByRef(ref),
        selectInsightWidgeImplicitDrillDownsByRef(ref),
        (widgetImplicitDrills, widgetImplicitDrillDownDrills) => {
            return [...widgetImplicitDrills, ...widgetImplicitDrillDownDrills];
        },
    ),
);

const selectInsightWidgetDrillDownImplicitDrillPredicates = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectInsightWidgeImplicitDrillDownsByRef(ref), (widgetDrillDownImplicitDrills) => {
        return flatMap(widgetDrillDownImplicitDrills, (implicitDrill) => implicitDrill.predicates);
    }),
);

const selectInsightWidgetImplicitDrillPredicates = createMemoizedSelector((ref: ObjRef) =>
    createSelector(selectInsightWidgetImplicitDrillsByRef(ref), (widgetImplicitDrills = []) => {
        return flatMap(widgetImplicitDrills, (implicitDrill) => implicitDrill.predicates);
    }),
);

/**
 * @internal
 */
export const selectInsightWidgetDrillableItems = createMemoizedSelector((ref: ObjRef) =>
    createSelector(
        selectDisableDefaultDrills,
        selectDrillableItems,
        selectInsightWidgetImplicitDrillPredicates(ref),
        selectInsightWidgetDrillDownImplicitDrillPredicates(ref),
        (disableDefaultDrills, drillableItems, widgetImplicitDrills, widgetImplicitDrillDownDrills) => {
            const resolvedDrillableItems = [...drillableItems];

            if (!disableDefaultDrills) {
                resolvedDrillableItems.push(...widgetImplicitDrills, ...widgetImplicitDrillDownDrills);
            }

            return resolvedDrillableItems;
        },
    ),
);

//
// Following selectors are for insight widget in drill dialog
//

/**
 * @internal
 */
export const selectImplicitDrillDownsByAvailableDrillTargets = createMemoizedSelector(
    (availableDrillTargets: IAvailableDrillTargets | undefined) =>
        createSelector(selectAttributesWithDrillDown, (attributesWithDrillDown) => {
            const availableDrillAttributes = availableDrillTargets?.attributes ?? [];
            return getDrillDownDefinitionsWithPredicates(availableDrillAttributes, attributesWithDrillDown);
        }),
);

/**
 * @internal
 */
export const selectDrillableItemsByAvailableDrillTargets = createMemoizedSelector(
    (availableDrillTargets: IAvailableDrillTargets | undefined) =>
        createSelector(
            selectImplicitDrillDownsByAvailableDrillTargets(availableDrillTargets),
            (implicitDrillDowns) => {
                const drillableItems = flatMap(
                    implicitDrillDowns,
                    (implicitDrill) => implicitDrill.predicates,
                );
                return drillableItems;
            },
        ),
);
