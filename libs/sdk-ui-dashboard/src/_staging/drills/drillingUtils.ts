// (C) 2020-2022 GoodData Corporation
import compact from "lodash/compact.js";
import { UnexpectedError } from "@gooddata/sdk-backend-spi";
import {
    isLocalIdRef,
    isIdentifierRef,
    isUriRef,
    areObjRefsEqual,
    ObjRefInScope,
    localIdRef,
    DrillDefinition,
    InsightDrillDefinition,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToLegacyDashboard,
    ICatalogAttribute,
    ICatalogDateAttribute,
    isMeasureDescriptor,
    IAttributeDescriptor,
    isCrossFiltering,
} from "@gooddata/sdk-model";
import {
    HeaderPredicates,
    IAvailableDrillTargetAttribute,
    IHeaderPredicate,
    getMappingHeaderLocalIdentifier,
    IDrillEvent,
    IAvailableDrillTargets,
} from "@gooddata/sdk-ui";
import first from "lodash/first.js";
import last from "lodash/last.js";
import {
    DashboardDrillDefinition,
    IDrillDownDefinition,
    IGlobalDrillDownAttributeHierarchyDefinition,
} from "../../types.js";
import isEqual from "lodash/isEqual.js";

export { getAttributeIdentifiersPlaceholdersFromUrl } from "@gooddata/sdk-model/internal";

interface IImplicitDrillWithPredicates {
    drillDefinition: DrillDefinition | IDrillDownDefinition;
    predicates: IHeaderPredicate[];
}

function widgetDrillToDrillPredicates(drill: DrillDefinition): IHeaderPredicate[] {
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
                HeaderPredicates.localIdentifierMatch(drill.attribute.attributeHeader.localIdentifier),
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

export function getDrillsBySourceLocalIdentifiers(
    widgetDrillDefinition: Array<DashboardDrillDefinition>,
    drillSourceLocalIdentifiers: string[],
): Array<DashboardDrillDefinition> {
    return widgetDrillDefinition.filter(
        (d) =>
            isDrillToLegacyDashboard(d) ||
            isCrossFiltering(d) ||
            drillSourceLocalIdentifiers.includes(getDrillOriginLocalIdentifier(d)),
    );
}

export function getLocalIdentifiersFromEvent(drillEvent: IDrillEvent): string[] {
    const drillIntersection = drillEvent?.drillContext?.intersection || [];
    return drillIntersection.map((x) => x.header).map(getMappingHeaderLocalIdentifier);
}

const getMeasureLocalIdentifier = (drillEvent: IDrillEvent): string =>
    first(
        (drillEvent?.drillContext?.intersection || [])
            .map((intersection) => intersection.header)
            .filter(isMeasureDescriptor)
            .map(getMappingHeaderLocalIdentifier),
    )!;

export function getDrillSourceLocalIdentifierFromEvent(drillEvent: IDrillEvent): string[] {
    const localIdentifiersFromEvent = getLocalIdentifiersFromEvent(drillEvent);

    if (drillEvent.drillContext.type === "table") {
        /*
        For tables, the event is always triggered on the individual column and there is no hierarchy involved.
        */
        const measureLocalIdentifier = getMeasureLocalIdentifier(drillEvent);

        return [measureLocalIdentifier ? measureLocalIdentifier : last(localIdentifiersFromEvent)!];
    }

    return localIdentifiersFromEvent;
}

export function filterDrillsByDrillEvent(
    drillDefinitions: DashboardDrillDefinition[],
    drillEvent: IDrillEvent,
): DashboardDrillDefinition[] {
    if (!drillDefinitions || !drillEvent) {
        return [];
    }
    const drillSourceLocalIdentifiers = getDrillSourceLocalIdentifierFromEvent(drillEvent);
    return getDrillsBySourceLocalIdentifiers(drillDefinitions, drillSourceLocalIdentifiers);
}

export function getDrillOriginLocalIdentifier(
    drillDefinition:
        | InsightDrillDefinition
        | IDrillDownDefinition
        | IGlobalDrillDownAttributeHierarchyDefinition,
): string {
    const { origin } = drillDefinition;

    if (isLocalIdRef(origin)) {
        return origin.localIdentifier;
    }

    if (isDrillFromMeasure(origin)) {
        return getLocalIdentifierOrDie(origin.measure);
    }

    if (isDrillFromAttribute(origin)) {
        return getLocalIdentifierOrDie(origin.attribute);
    }

    throw new Error("InsightDrillDefinition has invalid drill origin");
}

export function getLocalIdentifierOrDie(ref: ObjRefInScope): string {
    if (isLocalIdRef(ref)) {
        return ref.localIdentifier;
    }

    throw new Error("Invalid ObjRef invariant expecting LocalIdRef");
}

export function isDrillConfigured(
    drill: DashboardDrillDefinition,
    configuredDrills: DashboardDrillDefinition[],
): boolean {
    if (isDrillToLegacyDashboard(drill)) {
        return false;
    }
    return configuredDrills.some((configDrill) => {
        if (isDrillToLegacyDashboard(configDrill)) {
            return false;
        }

        return isEqual(drill, configDrill);
    });
}

export function getValidDrillOriginAttributes(
    supportedItemsForWidget: IAvailableDrillTargets,
    localIdentifier: string,
): IAttributeDescriptor[] {
    const measureItems = supportedItemsForWidget.measures ?? [];
    const measureSupportedItems = measureItems.find(
        (item) => item.measure.measureHeaderItem.localIdentifier === localIdentifier,
    );

    if (measureSupportedItems) {
        return measureSupportedItems.attributes;
    }

    const attributeItems = supportedItemsForWidget.attributes ?? [];
    const attributeSupportedItems = attributeItems.find(
        (attrItem) => attrItem.attribute.attributeHeader.localIdentifier === localIdentifier,
    );

    return attributeSupportedItems?.intersectionAttributes ?? [];
}
