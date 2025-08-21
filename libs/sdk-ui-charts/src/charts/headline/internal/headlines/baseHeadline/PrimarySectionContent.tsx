// (C) 2023-2025 GoodData Corporation
import React, { CSSProperties } from "react";

import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    customStyle?: CSSProperties;
}

export function PrimarySectionContent({ primaryItem, customStyle }: IPrimarySectionProps) {
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
}
