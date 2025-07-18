// (C) 2023-2025 GoodData Corporation

import PrimarySectionContent from "./PrimarySectionContent.js";
import PrimarySectionCompactContent from "./PrimarySectionCompactContent.js";
import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    isOnlyPrimaryItem: boolean;
}

export default function PrimarySection({ primaryItem, isOnlyPrimaryItem }: IPrimarySectionProps) {
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
