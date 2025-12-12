// (C) 2023-2025 GoodData Corporation

import { type CSSProperties, useMemo } from "react";

import { calculateHeadlineHeightFontSize } from "@gooddata/sdk-ui-vis-commons";

import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { PrimarySectionContent } from "./PrimarySectionContent.js";
import { type BaseHeadlineItemAccepted, type IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionCompactContentProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    isOnlyPrimaryItem: boolean;
}

export function PrimarySectionCompactContent({
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
