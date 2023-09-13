// (C) 2023 GoodData Corporation
import React, { CSSProperties, useMemo } from "react";

import PrimarySectionContent from "./PrimarySectionContent.js";
import { calculateHeadlineHeightFontSize } from "@gooddata/sdk-ui-vis-commons";
import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionCompactContentProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    isOnlyPrimaryItem: boolean;
}

const PrimarySectionCompactContent: React.FC<IPrimarySectionCompactContentProps> = ({
    primaryItem,
    isOnlyPrimaryItem,
}) => {
    const { clientHeight } = useBaseHeadline();

    const customStyle = useMemo<CSSProperties>(() => {
        const { height, fontSize } = calculateHeadlineHeightFontSize(!isOnlyPrimaryItem, clientHeight);
        return {
            height: `${height}px`,
            lineHeight: `${height}px`,
            fontSize,
        };
    }, [isOnlyPrimaryItem, clientHeight]);

    return clientHeight ? (
        <PrimarySectionContent primaryItem={primaryItem} customStyle={customStyle} />
    ) : null;
};

export default PrimarySectionCompactContent;
