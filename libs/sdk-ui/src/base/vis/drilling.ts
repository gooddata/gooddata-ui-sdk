// (C) 2007-2022 GoodData Corporation
import {
    isAttributeDescriptor,
    isTotalDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import CustomEventPolyfill from "custom-event";
import findIndex from "lodash/findIndex";
import { identifierMatch, uriMatch } from "../headerMatching/HeaderPredicateFactory";
import {
    ExplicitDrill,
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

/**
 * @internal
 */
export function isSomeHeaderPredicateMatched(
    drillablePredicates: IHeaderPredicate[],
    header: IMappingHeader,
    dv: DataViewFacade,
): boolean {
    return drillablePredicates.some((drillablePredicate: IHeaderPredicate) =>
        drillablePredicate(header, { dv }),
    );
}

/**
 * @internal
 */
export function convertDrillableItemsToPredicates(drillableItems: ExplicitDrill[]): IHeaderPredicate[] {
    return drillableItems.map((drillableItem: ExplicitDrill) => {
        if (isDrillableItemUri(drillableItem)) {
            return uriMatch(drillableItem.uri);
        } else if (isDrillableItemIdentifier(drillableItem)) {
            return identifierMatch(drillableItem.identifier);
        } else {
            return drillableItem;
        }
    });
}

/**
 * @internal
 */
export function getIntersectionPartAfter(
    intersection: IDrillEventIntersectionElement[],
    localIdentifier: string,
): IDrillEventIntersectionElement[] {
    const index = findIndex(
        intersection,
        (item: IDrillEventIntersectionElement) =>
            isDrillIntersectionAttributeItem(item.header) &&
            item.header.attributeHeader.localIdentifier === localIdentifier,
    );

    return intersection.slice(index);
}

/**
 * @internal
 */
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
            } else if (isMeasureDescriptor(drillItem) || isTotalDescriptor(drillItem)) {
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
 * @param drillEventData - The event data in `{ executionContext, drillContext }` format.
 * @param target - The target where the built event must be dispatched.
 * @internal
 */
export function fireDrillEvent(
    drillEventFunction: IDrillEventCallback,
    drillEventData: IDrillEvent,
    target: EventTarget,
): void {
    const shouldDispatchPostMessage = drillEventFunction?.(drillEventData);

    if (shouldDispatchPostMessage !== false) {
        target.dispatchEvent(
            new CustomEventPolyfill("drill", {
                detail: drillEventData,
                bubbles: true,
            }),
        );
    }
}
