// (C) 2007-2026 GoodData Corporation

import {
    type IResultAttributeHeader,
    isAttributeDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
    isTotalDescriptor,
} from "@gooddata/sdk-model";

import {
    type ExplicitDrill,
    type IDrillEvent,
    type IDrillEventCallback,
    type IDrillEventIntersectionElement,
    isDrillIntersectionAttributeItem,
    isDrillableItemIdentifier,
    isDrillableItemUri,
} from "./DrillEvents.js";
import { type IHeaderPredicate } from "../headerMatching/HeaderPredicate.js";
import { identifierMatch, uriMatch } from "../headerMatching/HeaderPredicateFactory.js";
import { type IMappingHeader } from "../headerMatching/MappingHeader.js";
import { type DataViewFacade } from "../results/facade.js";

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
 *
 *
 * @public
 */
export function convertDrillableItemsToPredicates(
    drillableItems: ExplicitDrill[] | undefined,
): IHeaderPredicate[] {
    if (!drillableItems) {
        return [];
    }
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
    const index = intersection.findIndex(
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
    drillEventFunction: IDrillEventCallback | undefined,
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
            name: isEmpty ? "" : (attributeHeaderItem.name ?? ""),
        },
    };
}

/**
 * Chart coordinates for positioning drill popovers near the clicked element.
 * @internal
 */
export interface IChartCoordinates {
    chartX?: number;
    chartY?: number;
}

/**
 * Calculate chart coordinates relative to a container element for drill popover positioning.
 * This function finds the closest ancestor matching the container selector and calculates
 * the position of the target element's center relative to that container.
 *
 * @param targetElement - The element that was clicked/focused (e.g., table cell, chart point)
 * @param containerSelector - CSS selector to find the container element (e.g., ".ag-root-wrapper", "[grid-id]")
 * @returns Object with chartX and chartY coordinates, or undefined values if elements are not found
 * @internal
 */
export function getChartClickCoordinates(
    targetElement: HTMLElement | EventTarget | null | undefined,
    containerSelector: string,
): IChartCoordinates {
    const target = targetElement as HTMLElement | undefined;
    const container = target?.closest(containerSelector) as HTMLElement | undefined;

    if (!target || !container) {
        return {
            chartX: undefined,
            chartY: undefined,
        };
    }

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Position at the center of the clicked/focused element, relative to the container
    const chartX = targetRect.left + targetRect.width / 2 - containerRect.left;
    const chartY = targetRect.top + targetRect.height / 2 - containerRect.top;

    return {
        chartX,
        chartY,
    };
}
