// (C) 2007-2023 GoodData Corporation
import {
    isAttributeDescriptor,
    isTotalDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
    IResultAttributeHeader,
} from "@gooddata/sdk-model";
import findIndex from "lodash/findIndex.js";
import { identifierMatch, uriMatch } from "../headerMatching/HeaderPredicateFactory.js";
import {
    ExplicitDrill,
    IDrillEventIntersectionElement,
    isDrillableItemIdentifier,
    isDrillableItemUri,
    IDrillEventCallback,
    IDrillEvent,
    isDrillIntersectionAttributeItem,
} from "./DrillEvents.js";
import { IHeaderPredicate } from "../headerMatching/HeaderPredicate.js";
import { IMappingHeader } from "../headerMatching/MappingHeader.js";
import { DataViewFacade } from "../results/facade.js";

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
                            ...convertToEmpty(attributeItem),
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
            new CustomEvent("drill", {
                detail: drillEventData,
                bubbles: true,
            }),
        );
    }
}

function convertToEmpty(attributeItem: IResultAttributeHeader) {
    const { attributeHeaderItem } = attributeItem;

    // This is special behaviour for tiger when we allowed empty string or null
    // In this case if uri is one of these special value, set on same value also name
    // because there is now some special ui value (from example "(empty value)") which is not
    // valid for this case
    const values = ["", null] as Array<any>;
    const isEmpty = values.indexOf(attributeHeaderItem.uri) >= 0;

    return {
        ...attributeItem,
        attributeHeaderItem: {
            ...attributeHeaderItem,
            // Send empty string for not, need to be updated for NULL in future
            name: isEmpty ? "" : attributeHeaderItem.name ?? "",
        },
    };
}
