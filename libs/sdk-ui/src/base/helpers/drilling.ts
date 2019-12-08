// (C) 2007-2019 GoodData Corporation
import {
    DataViewFacade,
    isAttributeDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
    isTotalDescriptor,
} from "@gooddata/sdk-backend-spi";
import { identifierMatch, uriMatch } from "../factory/HeaderPredicateFactory";
import {
    IDrillableItem,
    IDrillEventIntersectionElement,
    isDrillableItemIdentifier,
    isDrillableItemUri,
} from "../interfaces/DrillEvents";
import { IHeaderPredicate, isHeaderPredicate } from "../interfaces/HeaderPredicate";
import { IMappingHeader } from "../interfaces/MappingHeader";

export function isSomeHeaderPredicateMatched(
    drillablePredicates: IHeaderPredicate[],
    header: IMappingHeader,
    dv: DataViewFacade,
): boolean {
    return drillablePredicates.some((drillablePredicate: IHeaderPredicate) =>
        drillablePredicate(header, { dv }),
    );
}

export function convertDrillableItemsToPredicates(
    drillableItems: Array<IDrillableItem | IHeaderPredicate>,
): IHeaderPredicate[] {
    return drillableItems.map((drillableItem: IDrillableItem) => {
        if (isDrillableItemUri(drillableItem)) {
            return uriMatch(drillableItem.uri);
        } else if (isDrillableItemIdentifier(drillableItem)) {
            return identifierMatch(drillableItem.identifier);
        } else if (isHeaderPredicate(drillableItem)) {
            return drillableItem;
        }
    });
}

// shared by charts and table
export function getDrillIntersection(drillItems: IMappingHeader[]): IDrillEventIntersectionElement[] {
    return drillItems.reduce(
        (
            drillIntersection: IDrillEventIntersectionElement[],
            drillItem: IMappingHeader,
            index: number,
            drillItems: IMappingHeader[],
        ): IDrillEventIntersectionElement[] => {
            if (isAttributeDescriptor(drillItem)) {
                const attributeItem = drillItems[index - 1]; // attribute item is always before attribute
                if (attributeItem && isResultAttributeHeader(attributeItem)) {
                    drillIntersection.push({
                        header: {
                            ...attributeItem,
                            ...drillItem,
                        },
                    });
                } else {
                    // no attr. item before attribute -> use only attribute header
                    drillIntersection.push({
                        header: drillItem,
                    });
                }
            } else if (isMeasureDescriptor(drillItem)) {
                drillIntersection.push({
                    header: drillItem,
                });
            } else if (isTotalDescriptor(drillItem)) {
                drillIntersection.push({
                    header: drillItem,
                });
            }

            return drillIntersection;
        },
        [],
    );
}
