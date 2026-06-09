// (C) 2023-2026 GoodData Corporation

import { type RefObject } from "react";

import {
    type BaseHeadlineDataItemComponentType,
    type IBaseHeadlineItem,
} from "../../interfaces/BaseHeadlines.js";

interface ICompareSectionItemProps {
    dataItem: IBaseHeadlineItem;
    titleRef?: RefObject<HTMLDivElement>;
    onValueOverflow?: (isOverflowing: boolean) => void;
    measurementTrigger?: number; // Used to trigger remeasurement
}

export function CompareSectionItem({
    dataItem,
    titleRef,
    onValueOverflow,
    measurementTrigger,
}: ICompareSectionItemProps) {
    /**
     * When JSX combines all `dataItem.baseHeadlineDataItemComponent` union types, it creates a final
     * intersection type of these component's props to ensure proper type safety, when used in such general way.
     * However, the JSX is not smart enough to realize that `dataItem.baseHeadlineDataItemComponent` and
     * `dataItem.data` are correlated so it is actually fine here and there shouldn't be any type errors in reality.
     * The casting below prevents creation of the default component's props-intersection type so that no type issue arises.
     */
    const BaseHeadlineDataItem = dataItem.baseHeadlineDataItemComponent as BaseHeadlineDataItemComponentType;

    return (
        <div className="gd-flex-item headline-compare-section-item headline-compare-item s-headline-compare-item">
            <BaseHeadlineDataItem
                dataItem={dataItem.data}
                evaluationType={dataItem.evaluationType}
                elementType={dataItem.elementType}
                titleRef={titleRef}
                onValueOverflow={onValueOverflow}
                measurementTrigger={measurementTrigger}
            />
        </div>
    );
}
