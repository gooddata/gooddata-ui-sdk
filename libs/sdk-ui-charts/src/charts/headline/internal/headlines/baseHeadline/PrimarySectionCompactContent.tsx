// (C) 2023-2026 GoodData Corporation

import { type CSSProperties, useMemo } from "react";

import { calculateHeadlineHeightFontSize } from "@gooddata/sdk-ui-vis-commons";

import { type BaseHeadlineItemAccepted, type IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { PrimarySectionContent } from "./PrimarySectionContent.js";

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
