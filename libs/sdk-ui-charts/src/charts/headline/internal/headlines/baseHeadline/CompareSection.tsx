// (C) 2023 GoodData Corporation
import React, { createRef, useMemo } from "react";

import { HeadlinePagination, shouldRenderPagination } from "@gooddata/sdk-ui-vis-commons";

import CompareSectionItem from "./CompareSectionItem.js";
import { getCompareSectionClasses } from "../../utils/HeadlineDataItemUtils.js";
import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface ICompareSectionProps {
    secondaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    tertiaryItem?: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
}

const CompareSection: React.FC<ICompareSectionProps> = ({ secondaryItem, tertiaryItem }) => {
    const { config, clientHeight, clientWidth } = useBaseHeadline();
    const { enableCompactSize } = config;

    const secondaryItemTitleWrapperRef = createRef<HTMLDivElement>();

    const pagination = useMemo(
        () => shouldRenderPagination(enableCompactSize, clientWidth, clientHeight),
        [enableCompactSize, clientHeight, clientWidth],
    );

    const compareSectionClassNames = useMemo(
        () => getCompareSectionClasses(clientWidth, secondaryItemTitleWrapperRef),
        [clientWidth, secondaryItemTitleWrapperRef],
    );

    return pagination && tertiaryItem ? (
        <div className="gd-flex-container headline-compare-section headline-paginated-compare-section s-headline-paginated-compare-section">
            <HeadlinePagination
                renderSecondaryItem={() => (
                    <CompareSectionItem dataItem={secondaryItem} titleRef={secondaryItemTitleWrapperRef} />
                )}
                renderTertiaryItem={() => <CompareSectionItem dataItem={tertiaryItem} />}
            />
        </div>
    ) : (
        <div className={compareSectionClassNames}>
            {tertiaryItem ? <CompareSectionItem dataItem={tertiaryItem} /> : null}
            <CompareSectionItem dataItem={secondaryItem} titleRef={secondaryItemTitleWrapperRef} />
        </div>
    );
};

export default CompareSection;
