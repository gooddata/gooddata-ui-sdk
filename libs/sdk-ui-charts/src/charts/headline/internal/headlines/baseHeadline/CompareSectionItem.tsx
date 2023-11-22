// (C) 2023 GoodData Corporation
import React, { RefObject } from "react";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface ICompareSectionItemProps {
    dataItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    titleRef?: RefObject<HTMLDivElement>;
}

const CompareSectionItem: React.FC<ICompareSectionItemProps> = ({ dataItem, titleRef }) => {
    const BaseHeadlineDataItem = dataItem.baseHeadlineDataItemComponent;

    return (
        <div className="gd-flex-item headline-compare-section-item headline-compare-item s-headline-compare-item">
            <BaseHeadlineDataItem
                dataItem={dataItem.data}
                evaluationType={dataItem.evaluationType}
                elementType={dataItem.elementType}
                titleRef={titleRef}
            />
        </div>
    );
};

export default CompareSectionItem;
