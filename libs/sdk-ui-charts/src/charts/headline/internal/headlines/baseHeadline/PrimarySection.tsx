// (C) 2023 GoodData Corporation
import React from "react";

import PrimarySectionContent from "./PrimarySectionContent.js";
import PrimarySectionCompactContent from "./PrimarySectionCompactContent.js";
import { useBaseHeadline } from "./BaseHeadlineContext.js";
import { BaseHeadlineItemAccepted, IBaseHeadlineItem } from "../../interfaces/BaseHeadlines.js";

interface IPrimarySectionProps {
    primaryItem: IBaseHeadlineItem<BaseHeadlineItemAccepted>;
    isOnlyPrimaryItem: boolean;
}

const PrimarySection: React.FC<IPrimarySectionProps> = ({ primaryItem, isOnlyPrimaryItem }) => {
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
};

export default PrimarySection;
