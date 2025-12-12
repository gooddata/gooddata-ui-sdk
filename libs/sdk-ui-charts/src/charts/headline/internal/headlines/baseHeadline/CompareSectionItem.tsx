// (C) 2023-2025 GoodData Corporation

import { type RefObject } from "react";

import { type BaseHeadlineItemAccepted, type IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface ICompareSectionItemProps {
    dataItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
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
    const BaseHeadlineDataItem = dataItem.baseHeadlineDataItemComponent;
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
