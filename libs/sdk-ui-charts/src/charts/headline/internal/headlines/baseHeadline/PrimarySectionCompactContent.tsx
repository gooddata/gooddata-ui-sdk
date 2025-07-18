// (C) 2023-2025 GoodData Corporation
import { CSSProperties, useMemo } from "react";

import PrimarySectionContent from "./PrimarySectionContent.js";
import { calculateHeadlineHeightFontSize } from "@gooddata/sdk-ui-vis-commons";
import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionCompactContentProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    isOnlyPrimaryItem: boolean;
}

export default function PrimarySectionCompactContent({
    primaryItem,
    isOnlyPrimaryItem,
}: IPrimarySectionCompactContentProps) {
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
}
