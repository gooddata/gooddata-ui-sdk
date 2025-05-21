// (C) 2023-2025 GoodData Corporation

import React, { ReactNode, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import cx from "classnames";

import { messages } from "../../../../locales.js";

const ALIGN_POINTS = [{ align: "bl tl" }];
const ARROW_OFFSETS = { "bl tl": [0, 8] };

interface IAttributeFilterShowFilteredElementsProps {
    attributeTitle: string;
    onClick: () => void;
    parentFilterTitles: string[];
    isFilteredByLimitingValidationItems: boolean;
    className?: string;
}

export const AttributeFilterShowFilteredElements: React.FC<IAttributeFilterShowFilteredElementsProps> = ({
    attributeTitle,
    onClick,
    parentFilterTitles,
    isFilteredByLimitingValidationItems,
    className,
}) => {
    const intl = useIntl();
    const hasParentFilters = parentFilterTitles.length > 0;
    const tooltipLocalizationKey = hasParentFilters
        ? isFilteredByLimitingValidationItems
            ? messages.relevantValuesParentFiltersLimitsTooltip
            : messages.relevantValuesParentFiltersTooltip
        : messages.relevantValuesLimitsTooltip;

    const parentFiltersTooltipText = useMemo(() => {
        return parentFilterTitles ? parentFilterTitles.join(", ") : "";
    }, [parentFilterTitles]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        onClick();
    };

    return (
        <div
            className={cx(
                "gd-attribute-filter-status-show-all s-attribute-filter-status-show-all",
                className,
            )}
        >
            <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                <div className="gd-relevant-values-text">
                    <FormattedMessage id="attributesDropdown.relevantValues" values={{ nbsp: <>&nbsp;</> }} />
                </div>
                <Bubble
                    className={`bubble-primary gd-attribute-filter-dropdown-bubble__next s-attribute-filter-dropdown-bubble`}
                    alignPoints={ALIGN_POINTS}
                    arrowOffsets={ARROW_OFFSETS}
                >
                    {intl.formatMessage(tooltipLocalizationKey, {
                        child: attributeTitle,
                        parents: parentFiltersTooltipText,
                        strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
                    })}
                </Bubble>
            </BubbleHoverTrigger>
            <button className="gd-action-show-all s-action-show-all" onClick={handleClick}>
                <FormattedMessage id="attributesDropdown.showAll" />
            </button>
        </div>
    );
};
