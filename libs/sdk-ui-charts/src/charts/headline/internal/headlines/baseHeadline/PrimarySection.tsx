// (C) 2023-2025 GoodData Corporation

import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { PrimarySectionCompactContent } from "./PrimarySectionCompactContent.js";
import { PrimarySectionContent } from "./PrimarySectionContent.js";
import { type BaseHeadlineItemAccepted, type IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    isOnlyPrimaryItem: boolean;
}

export function PrimarySection({ primaryItem, isOnlyPrimaryItem }: IPrimarySectionProps) {
    const { config } = useBaseHeadline();

    return (
        <div className="gd-flex-container primary-section s-primary-section">
            {config.enableCompactSize ? (
                <PrimarySectionCompactContent
                    primaryItem={primaryItem}
                    isOnlyPrimaryItem={isOnlyPrimaryItem}
                />
            ) : (
                <PrimarySectionContent primaryItem={primaryItem} />
            )}
        </div>
    );
}
