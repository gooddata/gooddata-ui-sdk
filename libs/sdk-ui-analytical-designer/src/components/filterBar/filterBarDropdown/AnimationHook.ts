// (C) 2007-2026 GoodData Corporation

import { useEffect, useMemo, useRef, useState } from "react";

import { type IFilterBarDropdownItem } from "./model/filter_bar_dropdown_item.js";

interface IPreviousAnimationTimeProps {
    dateItem?: IFilterBarDropdownItem;
    measures?: ReadonlyArray<IFilterBarDropdownItem>;
    attributes?: ReadonlyArray<IFilterBarDropdownItem>;
    animationTimestamp?: number;
}

/**
 * Get timestamp when filter bar button animation should be triggered.
 *
 * The hook returns the current timestamp if animation should be triggered now or the last timestamp when
 * animation was triggered if it is not necessary to trigger it now.
 *
 * In case the previous timestamp is returned, the exact object as the last time is returned, therefore the
 * timestamp object can be used as useEffect dependency of the animation effect hook.
 *
 * @param dateItem - current date item in filter bar dropdown or null if not available
 * @param measures - current measure items in filter bar dropdown
 * @param attributes - current attribute items in filter bar dropdown
 */
export const useFilterBarButtonAnimationTimestamp = (
    dateItem: IFilterBarDropdownItem | null,
    measures: ReadonlyArray<IFilterBarDropdownItem>,
    attributes: ReadonlyArray<IFilterBarDropdownItem>,
): number => {
    const previousProps = useRef<IPreviousAnimationTimeProps>({
        dateItem: null,
        measures: [],
        attributes: [],
        animationTimestamp: null,
    });

    const animationTimestamp = useMemo(() => {
        return shouldAnimateButton(dateItem, measures, attributes, previousProps.current)
            ? createNewAnimationTimestamp()
            : previousProps.current.animationTimestamp;
    }, [dateItem, measures, attributes, previousProps]);

    previousProps.current = {
        dateItem,
        measures,
        attributes,
        animationTimestamp,
    };

    return animationTimestamp;
};

const shouldAnimateButton = (
    dateItem: IFilterBarDropdownItem | null,
    measures: ReadonlyArray<IFilterBarDropdownItem>,
    attributes: ReadonlyArray<IFilterBarDropdownItem>,
    previousProps: IPreviousAnimationTimeProps,
): boolean => {
    return (
        wasDateJustAddedToBuckets(dateItem, previousProps) ||
        isNewUniqueAttributeInBuckets(attributes, previousProps) ||
        isAnyNewMeasureInBuckets(measures, previousProps)
    );
};

const wasDateJustAddedToBuckets = (
    dateItem: IFilterBarDropdownItem | null,
    previousProps: IPreviousAnimationTimeProps,
): boolean => {
    const isDateItemVisible = dateItem !== null;
    const wasDateItemVisible = previousProps.dateItem !== null;
    const isDateFilterEnabled = isDateItemVisible && dateItem.filterLocalIdentifier !== null;
    return isDateItemVisible && !wasDateItemVisible && !isDateFilterEnabled;
};

const isNewUniqueAttributeInBuckets = (
    attributes: ReadonlyArray<IFilterBarDropdownItem> = [],
    previousProps: IPreviousAnimationTimeProps,
): boolean => {
    const previousItemIdentifiers = asFlatIdentifiers(previousProps.attributes);
    return (
        attributes.filter((item) => {
            const hasFilterBarItem = item.filterLocalIdentifier !== null;
            const isItemAlreadyInBuckets = item.bucketItemLocalIdentifiers.some((identifier) =>
                previousItemIdentifiers.includes(identifier),
            );
            return !hasFilterBarItem && !isItemAlreadyInBuckets;
        }).length > 0
    );
};

const isAnyNewMeasureInBuckets = (
    measures: ReadonlyArray<IFilterBarDropdownItem> = [],
    previousProps: IPreviousAnimationTimeProps,
): boolean => {
    const previousMeasuresIdentifiers = asFlatIdentifiers(previousProps.measures);

    return (
        measures.filter((item) => {
            const hasFilterBarItem = item.filterLocalIdentifier !== null;
            const isItemAlreadyInBuckets = item.bucketItemLocalIdentifiers.every((identifier) =>
                previousMeasuresIdentifiers.includes(identifier),
            );
            return !hasFilterBarItem && !isItemAlreadyInBuckets;
        }).length > 0
    );
};

const asFlatIdentifiers = (items: ReadonlyArray<IFilterBarDropdownItem>): string[] =>
    items.flatMap((item: IFilterBarDropdownItem) => item.bucketItemLocalIdentifiers);

const createNewAnimationTimestamp = () => performance.now();

/**
 * Determine if "even" or "odd" rendering cycle animation class name should be used to animate
 * the filter bar button. The animation type is changed only when provided animationTimestamp is
 * different from the last one provided.
 *
 * @param animationTimestamp - animation timestamp
 */
export const useIsEvenAnimation = (animationTimestamp: number): boolean => {
    const [isEven, setIsEven] = useState(false);
    useEffect(() => setIsEven((currentIsEven) => !currentIsEven), [animationTimestamp]);
    return isEven;
};
