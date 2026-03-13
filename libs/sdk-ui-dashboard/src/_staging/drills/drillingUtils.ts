// (C) 2020-2026 GoodData Corporation

import { isEqual } from "lodash-es";

import {
    type IAttributeDescriptor,
    type IAttributeFilter,
    type IDateFilter,
    type IDrillDownIntersectionIgnoredAttributes,
    type IDrillToDashboard,
    type IDrillToInsight,
    type IFilter,
    type IMeasure,
    type InsightDrillDefinition,
    type ObjRef,
    type ObjRefInScope,
    type SourceInsightFilterObjRef,
    areObjRefsEqual,
    drillDownReferenceHierarchyRef,
    filterMeasureRef,
    filterObjRef,
    isAttributeFilter,
    isCrossFiltering,
    isDateFilter,
    isDrillFromAttribute,
    isDrillFromMeasure,
    isDrillToLegacyDashboard,
    isIdentifierRef,
    isKeyDriveAnalysis,
    isLocalIdRef,
    isMeasureDescriptor,
    isMeasureValueFilter,
    isRankingFilter,
    measureFilters,
    measureLocalId,
} from "@gooddata/sdk-model";
import {
    type IAvailableDrillTargets,
    type IDrillEvent,
    getMappingHeaderLocalIdentifier,
} from "@gooddata/sdk-ui";

import {
    type DashboardDrillDefinition,
    type IDrillDownDefinition,
    type IDrillToUrlAttributeDefinition,
    type IGlobalDrillDownAttributeHierarchyDefinition,
} from "../../types.js";

export function getDrillsBySourceLocalIdentifiers(
    widgetDrillDefinition: Array<DashboardDrillDefinition>,
    drillSourceLocalIdentifiers: string[],
): Array<DashboardDrillDefinition> {
    return widgetDrillDefinition.filter(
        (d) =>
            isDrillToLegacyDashboard(d) ||
            isCrossFiltering(d) ||
            isKeyDriveAnalysis(d) ||
            drillSourceLocalIdentifiers.includes(getDrillOriginLocalIdentifier(d)),
    );
}

export function getLocalIdentifiersFromEvent(drillEvent: IDrillEvent): string[] {
    const drillIntersection = drillEvent?.drillContext?.intersection || [];
    return drillIntersection.map((x) => x.header).map(getMappingHeaderLocalIdentifier);
}

const getMeasureLocalIdentifier = (drillEvent: IDrillEvent): string =>
    (drillEvent?.drillContext?.intersection || [])
        .map((intersection) => intersection.header)
        .filter(isMeasureDescriptor)
        .map(getMappingHeaderLocalIdentifier)
        .at(0)!;

export function getDrillSourceLocalIdentifierFromEvent(drillEvent: IDrillEvent): string[] {
    const localIdentifiersFromEvent = getLocalIdentifiersFromEvent(drillEvent);

    if (drillEvent.drillContext.type === "table") {
        /*
        For tables, the event is always triggered on the individual column and there is no hierarchy involved.
        */
        const measureLocalIdentifier = getMeasureLocalIdentifier(drillEvent);

        return [measureLocalIdentifier || localIdentifiersFromEvent.at(-1)!];
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

export function getDrillOriginLocalIdentifier({
    origin,
}:
    | InsightDrillDefinition
    | IDrillDownDefinition
    | IGlobalDrillDownAttributeHierarchyDefinition
    | IDrillToUrlAttributeDefinition): string {
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

/**
 * Returns source measure filters for a drill origin measure.
 *
 * @internal
 */
export function getSourceMeasureFiltersForDrillDefinition(
    drillDefinition: Pick<IDrillToDashboard | IDrillToInsight, "origin">,
    sourceInsightMeasures: IMeasure[],
): Array<IAttributeFilter | IDateFilter> {
    const { origin } = drillDefinition;

    if (!isDrillFromMeasure(origin)) {
        return [];
    }

    if (!isLocalIdRef(origin.measure)) {
        return [];
    }

    const sourceMeasureLocalIdentifier = origin.measure.localIdentifier;
    const sourceMeasure = sourceInsightMeasures.find(
        (measure) => measureLocalId(measure) === sourceMeasureLocalIdentifier,
    );
    if (!sourceMeasure) {
        return [];
    }

    return (measureFilters(sourceMeasure) ?? []).filter(
        (filter) => isAttributeFilter(filter) || isDateFilter(filter),
    );
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

/**
 * Compares persisted drill filter reference with actual insight filter.
 *
 * @internal
 */
export function isMatchingSourceInsightFilter(
    filter: IFilter,
    sourceFilterObjRef: SourceInsightFilterObjRef,
): boolean {
    const currentSourceFilterObjRef = sourceInsightFilterObjRef(filter);
    if (!currentSourceFilterObjRef) {
        return false;
    }

    return isSourceInsightFilterObjRefEqual(currentSourceFilterObjRef, sourceFilterObjRef);
}

/**
 * Compares two persisted source insight filter references.
 *
 * @internal
 */
export function isSourceInsightFilterObjRefEqual(
    left: SourceInsightFilterObjRef,
    right: SourceInsightFilterObjRef,
): boolean {
    return (
        left.type === right.type &&
        areObjRefsEqual(sourceInsightFilterObjRefValue(left), sourceInsightFilterObjRefValue(right))
    );
}

export function sourceInsightFilterObjRef(filter: IFilter): SourceInsightFilterObjRef | undefined {
    if (isAttributeFilter(filter)) {
        const displayFormRef = filterObjRef(filter);
        return displayFormRef
            ? {
                  type: "attributeFilter",
                  label: displayFormRef,
              }
            : undefined;
    }

    if (isDateFilter(filter)) {
        const dataSetRef = filterObjRef(filter);
        return dataSetRef
            ? {
                  type: "dateFilter",
                  dataSet: dataSetRef,
              }
            : undefined;
    }

    if (isMeasureValueFilter(filter)) {
        const measureRef = filterMeasureRef(filter);
        return measureRef
            ? {
                  type: "measureValueFilter",
                  measure: measureRef,
              }
            : undefined;
    }

    if (isRankingFilter(filter)) {
        const measureRef = filterMeasureRef(filter);
        return measureRef
            ? {
                  type: "rankingFilter",
                  measure: measureRef,
              }
            : undefined;
    }

    return undefined;
}

export function sourceInsightFilterObjRefValue(sourceFilterObjRef: SourceInsightFilterObjRef) {
    if (sourceFilterObjRef.type === "attributeFilter") {
        return sourceFilterObjRef.label;
    }

    if (sourceFilterObjRef.type === "dateFilter") {
        return sourceFilterObjRef.dataSet;
    }

    if (sourceFilterObjRef.type === "measureValueFilter" || sourceFilterObjRef.type === "rankingFilter") {
        return sourceFilterObjRef.measure;
    }

    throw new Error("Invalid SourceInsightFilterObjRef");
}
