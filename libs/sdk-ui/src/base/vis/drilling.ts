// (C) 2007-2020 GoodData Corporation
import {
    isAttributeDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
    isTotalDescriptor,
} from "@gooddata/sdk-backend-spi";
import CustomEventPolyfill from "custom-event";
import { identifierMatch, uriMatch } from "../headerMatching/HeaderPredicateFactory";
import {
    IDrillableItem,
    IDrillEventIntersectionElement,
    isDrillableItemIdentifier,
    isDrillableItemUri,
    IDrillEventCallback,
    IDrillEvent,
    isDrillIntersectionAttributeItem,
} from "./DrillEvents";
import { IHeaderPredicate } from "../headerMatching/HeaderPredicate";
import { IMappingHeader } from "../headerMatching/MappingHeader";
import { DataViewFacade } from "../results/facade";

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
    return drillableItems.map((drillableItem: IDrillableItem | IHeaderPredicate) => {
        if (isDrillableItemUri(drillableItem)) {
            return uriMatch(drillableItem.uri);
        } else if (isDrillableItemIdentifier(drillableItem)) {
            return identifierMatch(drillableItem.identifier);
        } else {
            return drillableItem;
        }
    });
}

export function getIntersectionPartAfter(
    intersection: IDrillEventIntersectionElement[],
    localIdentifier: string,
): IDrillEventIntersectionElement[] {
    const index = intersection.findIndex(
        (item: IDrillEventIntersectionElement) =>
            isDrillIntersectionAttributeItem(item.header) &&
            item.header.attributeHeader.localIdentifier === localIdentifier,
    );

    return intersection.slice(index);
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

/**
 * Fire a new drill event built from the provided data to the target that have a 'dispatchEvent' method.
 *
 * @param drillEventFunction - custom drill event function which could process and prevent default post message event.
 * @param drillEventData - The event data in {executionContext, drillContext} format.
 * @param target - The target where the built event must be dispatched.
 */
export function fireDrillEvent(
    drillEventFunction: IDrillEventCallback,
    drillEventData: IDrillEvent,
    target: EventTarget,
): void {
    const shouldDispatchPostMessage = drillEventFunction && drillEventFunction(drillEventData);

    if (shouldDispatchPostMessage !== false) {
        target.dispatchEvent(
            new CustomEventPolyfill("drill", {
                detail: drillEventData,
                bubbles: true,
            }),
        );
    }
}
