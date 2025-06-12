// (C) 2020-2024 GoodData Corporation
import {
    areObjRefsEqual,
    attributeIdentifier,
    attributeLocalId,
    attributeUri,
    bucketItemLocalId,
    IAttribute,
    IAttributeOrMeasure,
    IFilter,
    IInsight,
    insightAttributes,
    insightFilters,
    insightItems,
    insightModifyItems,
    insightProperties,
    insightReduceItems,
    insightSetFilters,
    insightSetProperties,
    insightSetSorts,
    insightSorts,
    isAttribute,
    isIdentifierRef,
    isLocalIdRef,
    isRankingFilter,
    isUriRef,
    modifyAttribute,
    newPositiveAttributeFilter,
    VisualizationProperties,
} from "@gooddata/sdk-model";
import {
    getIntersectionPartAfter,
    IDrillEventIntersectionElement,
    isDrillIntersectionAttributeItem,
} from "@gooddata/sdk-ui";
import { drillDownDisplayForm, drillDownFromAttributeLocalId } from "../../utils/ImplicitDrillDownHelper.js";
import { ColumnWidthItem, isAttributeColumnWidthItem } from "@gooddata/sdk-ui-pivot";
import { IDrillDownDefinition } from "../../interfaces/Visualization.js";

function matchesDrillDownTargetAttribute(
    drillDefinition: IDrillDownDefinition,
    attribute: IAttribute,
): boolean {
    return attributeLocalId(attribute) === drillDownFromAttributeLocalId(drillDefinition);
}

enum ENUM_PROPERTIES_TYPE {
    CONTROLS = "controls",
}

export function modifyBucketsAttributesForDrillDown(
    insight: IInsight,
    drillDefinition: IDrillDownDefinition,
): IInsight {
    const removedLeftAttributes = insightReduceItems(
        insight,
        (acc: IAttributeOrMeasure[], cur: IAttributeOrMeasure): IAttributeOrMeasure[] => {
            if (isAttribute(cur) && matchesDrillDownTargetAttribute(drillDefinition, cur)) {
                return [cur];
            }

            return [...acc, cur];
        },
    );

    const replacedDrill = insightModifyItems(
        removedLeftAttributes,
        (bucketItem: IAttributeOrMeasure): IAttributeOrMeasure => {
            if (isAttribute(bucketItem) && matchesDrillDownTargetAttribute(drillDefinition, bucketItem)) {
                const displayForm = drillDownDisplayForm(drillDefinition);
                return modifyAttribute(bucketItem, (a) => a.displayForm(displayForm).noAlias());
            }
            return bucketItem;
        },
    );

    const removedDuplicateAttributes = insightReduceItems(
        replacedDrill,
        (acc: IAttributeOrMeasure[], cur: IAttributeOrMeasure): IAttributeOrMeasure[] => {
            if (isAttribute(cur)) {
                const alreadyContainsTarget = acc
                    .filter(isAttribute)
                    .find((attr) => areObjRefsEqual(cur.attribute.displayForm, attr.attribute.displayForm));
                return alreadyContainsTarget ? acc : [...acc, cur];
            }

            return [...acc, cur];
        },
    );

    // remove invalid sorts: the insightSorts already has the logic to remove invalid sorts
    const removedInvalidSorts = insightSetSorts(
        removedDuplicateAttributes,
        insightSorts(removedDuplicateAttributes),
    );

    // remove ranking filters that are related to any of the removed attributes
    return removeRankingFiltersForRemovedAttributes(removedInvalidSorts);
}

function removePropertiesForRemovedAttributes(insight: IInsight): IInsight {
    const properties: VisualizationProperties = insightProperties(insight);

    if (!properties) {
        return insight;
    }

    const identifiers = insightItems(insight).map((bucketItem: IAttributeOrMeasure) =>
        bucketItemLocalId(bucketItem),
    );

    const result = Object.entries(properties).reduce(
        (acc, [key, value]) => {
            if (key === ENUM_PROPERTIES_TYPE.CONTROLS && value.columnWidths) {
                const columns = value.columnWidths.filter((columnWidth: ColumnWidthItem) => {
                    if (isAttributeColumnWidthItem(columnWidth)) {
                        return identifiers.includes(columnWidth.attributeColumnWidthItem.attributeIdentifier);
                    }
                    return true;
                });
                acc[key] = {
                    columnWidths: columns,
                };
            }

            return acc;
        },
        { ...properties },
    );

    return insightSetProperties(insight, result);
}

export function sanitizeTableProperties(insight: IInsight): IInsight {
    return removePropertiesForRemovedAttributes(insight);
}

export function convertIntersectionToFilters(
    intersections: IDrillEventIntersectionElement[],
    backendSupportsElementUris: boolean = true,
    enableDuplicatedLabelValuesInAttributeFilter: boolean = true,
): IFilter[] {
    return intersections
        .map((intersection) => intersection.header)
        .filter(isDrillIntersectionAttributeItem)
        .map((header) => {
            const ref = enableDuplicatedLabelValuesInAttributeFilter
                ? header.attributeHeader.primaryLabel
                : header.attributeHeader.ref;
            if (backendSupportsElementUris) {
                return newPositiveAttributeFilter(ref, {
                    uris: [header.attributeHeaderItem.uri],
                });
            }
            return newPositiveAttributeFilter(ref, {
                values: [
                    enableDuplicatedLabelValuesInAttributeFilter
                        ? header.attributeHeaderItem.uri
                        : header.attributeHeaderItem.name,
                ],
            });
        });
}

export function reverseAndTrimIntersection(
    drillConfig: IDrillDownDefinition,
    intersection?: IDrillEventIntersectionElement[],
): IDrillEventIntersectionElement[] {
    if (!intersection || intersection.length === 0) {
        return intersection;
    }

    const clicked = drillDownFromAttributeLocalId(drillConfig);
    const reorderedIntersection = intersection.slice().reverse();
    return getIntersectionPartAfter(reorderedIntersection, clicked);
}

/**
 * @internal
 */
export function addIntersectionFiltersToInsight(
    source: IInsight,
    intersection: IDrillEventIntersectionElement[],
    backendSupportsElementUris: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
): IInsight {
    const filters = convertIntersectionToFilters(
        intersection,
        backendSupportsElementUris,
        enableDuplicatedLabelValuesInAttributeFilter,
    );
    const resultFilters = [...source.insight.filters, ...filters];

    return insightSetFilters(source, resultFilters);
}

function removeRankingFiltersForRemovedAttributes(insight: IInsight): IInsight {
    const attributes = insightAttributes(insight);
    return insightSetFilters(
        insight,
        insightFilters(insight).filter((def) => {
            if (isRankingFilter(def)) {
                return (
                    def.rankingFilter.attributes?.some((attrRef) => {
                        return (
                            (isLocalIdRef(attrRef) &&
                                attributes.some((a) => attributeLocalId(a) === attrRef.localIdentifier)) ||
                            (isIdentifierRef(attrRef) &&
                                attributes.some((a) => attributeIdentifier(a) === attrRef.identifier)) ||
                            (isUriRef(attrRef) && attributes.some((a) => attributeUri(a) === attrRef.uri))
                        );
                    }) ?? true
                );
            }

            return true;
        }),
    );
}
