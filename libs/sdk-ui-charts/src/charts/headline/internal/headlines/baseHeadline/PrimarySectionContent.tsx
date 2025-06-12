// (C) 2023 GoodData Corporation
import React, { CSSProperties } from "react";

import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    customStyle?: CSSProperties;
}

const PrimarySectionContent: React.FC<IPrimarySectionProps> = ({ primaryItem, customStyle }) => {
    const BaseHeadlineDataItem = primaryItem.baseHeadlineDataItemComponent;

    return (
        <div className="gd-flex-item headline-primary-item s-headline-primary-item" style={customStyle}>
            <BaseHeadlineDataItem
                dataItem={primaryItem.data}
                evaluationType={primaryItem.evaluationType}
                elementType={primaryItem.elementType}
                shouldHideTitle={true}
            />
        </div>
    );
};

export default PrimarySectionContent;
