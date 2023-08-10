// (C) 2023 GoodData Corporation
import React, { CSSProperties, useMemo } from "react";
import cx from "classnames";

import { getDrillableClasses } from "../../utils/HeadlineDataItemUtils.js";
import { IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionProps {
    primaryItem: IBaseHeadlineItem;
    customStyle?: CSSProperties;
}

const PrimarySectionContent: React.FC<IPrimarySectionProps> = ({ primaryItem, customStyle }) => {
    const BaseHeadlineDataItem = primaryItem.baseHeadlineDataItemComponent;

    const classNames = useMemo(
        () =>
            cx([
                "gd-flex-item",
                "headline-primary-item",
                "s-headline-primary-item",
                ...getDrillableClasses(primaryItem?.data?.isDrillable),
            ]),
        [primaryItem],
    );

    return (
        <div className={classNames} style={customStyle}>
            <BaseHeadlineDataItem
                dataItem={primaryItem.data}
                elementType={primaryItem.elementType}
                shouldHideTitle={true}
            />
        </div>
    );
};

export default PrimarySectionContent;
