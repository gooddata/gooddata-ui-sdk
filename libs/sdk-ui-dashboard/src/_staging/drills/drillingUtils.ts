// (C) 2020-2024 GoodData Corporation
import {
    isLocalIdRef,
    ObjRefInScope,
    InsightDrillDefinition,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToLegacyDashboard,
    isMeasureDescriptor,
    IAttributeDescriptor,
    isCrossFiltering,
    IDrillDownIntersectionIgnoredAttributes,
    ObjRef,
    drillDownReferenceHierarchyRef,
    isIdentifierRef,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { getMappingHeaderLocalIdentifier, IDrillEvent, IAvailableDrillTargets } from "@gooddata/sdk-ui";
import first from "lodash/first.js";
import last from "lodash/last.js";
import {
    DashboardDrillDefinition,
    IDrillDownDefinition,
    IGlobalDrillDownAttributeHierarchyDefinition,
} from "../../types.js";
import isEqual from "lodash/isEqual.js";

export type { IDrillToUrlPlaceholder } from "@gooddata/sdk-model/internal";
export {
    getAttributeIdentifiersPlaceholdersFromUrl,
    getDashboardAttributeFilterPlaceholdersFromUrl,
    getInsightAttributeFilterPlaceholdersFromUrl,
} from "@gooddata/sdk-model/internal";

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

/**
 * Check whether drill intersection ignored attributes belong to a particular hierarchy.
 *
 * Date drill down does not contain a proper date attribute reference (date hierarchy is global),
 * so we just check that the hierarchy and its reference are date hierarchies.
 *
 * For other drill downs, we check reference equality as usual.
 *
 * @internal
 */
export function isDrillDownIntersectionIgnoredAttributesForHierarchy(
    drillDownIgnoredDrillIntersection: IDrillDownIntersectionIgnoredAttributes,
    targetHierarchyRef: ObjRef,
) {
    const hierarchyRef = drillDownReferenceHierarchyRef(drillDownIgnoredDrillIntersection.drillDownReference);
    const targetRefType = isIdentifierRef(targetHierarchyRef) ? targetHierarchyRef.type : undefined;
    const isDateDrillDown = targetRefType === "dateAttributeHierarchy";
    const isDateDrillDownReference =
        drillDownIgnoredDrillIntersection.drillDownReference.type === "dateHierarchyReference";
    return isDateDrillDown && isDateDrillDownReference
        ? true
        : areObjRefsEqual(hierarchyRef, targetHierarchyRef);
}
