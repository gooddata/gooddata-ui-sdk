// (C) 2023-2025 GoodData Corporation
import React, { RefObject } from "react";

import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface ICompareSectionItemProps {
    dataItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    titleRef?: RefObject<HTMLDivElement>;
    onValueOverflow?: (isOverflowing: boolean) => void;
    measurementTrigger?: number; // Used to trigger remeasurement
}

export const CompareSectionItem: React.FC<ICompareSectionItemProps> = ({
    dataItem,
    titleRef,
    onValueOverflow,
    measurementTrigger,
}) => {
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
};
