// (C) 2023 GoodData Corporation
import React, { RefObject, useMemo } from "react";
import cx from "classnames";
import { getDrillableClasses } from "../../utils/HeadlineDataItemUtils.js";
import { IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface ICompareSectionItemProps {
    dataItem: IBaseHeadlineItem;
    titleRef?: RefObject<HTMLDivElement>;
}

const CompareSectionItem: React.FC<ICompareSectionItemProps> = ({ dataItem, titleRef }) => {
    const BaseHeadlineDataItem = dataItem.baseHeadlineDataItemComponent;

    const classNames = useMemo(
        () =>
            cx([
                "gd-flex-item",
                "headline-compare-section-item",
                "headline-compare-item",
                "s-headline-compare-item",
                ...getDrillableClasses(dataItem?.data?.isDrillable),
            ]),
        [dataItem],
    );

    return (
        <div className={classNames}>
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
