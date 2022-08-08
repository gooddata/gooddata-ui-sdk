// (C) 2022 GoodData Corporation
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

export const ALIGN_POINT = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

/**
 * @alpha
 */
export interface IAttributeFilterDropdownButtonProps {
    title?: string;
    subtitle?: string;
    selectedItemsCount?: number;

    isOpen?: boolean;

    isLoading?: boolean;
    isFiltering?: boolean;
    isLoaded?: boolean;

    onClick?: () => void;
}

/**
 * @internal
 */
export const AttributeFilterDropdownButton: React.VFC<IAttributeFilterDropdownButtonProps> = (props) => {
    const { isOpen, title, selectedItemsCount, subtitle, isFiltering, isLoading, isLoaded, onClick } = props;

    const intl = useIntl();
    const subtitleSelectedItemsRef = useRef(null);
    const [displayItemCount, setDisplayItemCount] = useState(false);

    useEffect(() => {
        const element = subtitleSelectedItemsRef.current;

        if (!element) {
            return;
        }

        const roundedWidth = Math.ceil(element.getBoundingClientRect().width);
        const displayItemCount = roundedWidth < element.scrollWidth;

        setDisplayItemCount(displayItemCount);
    }, [subtitle]);

    let buttonTitle = title;
    let buttonSubtitle = subtitle;
    if (isLoading) {
        buttonTitle = intl.formatMessage({ id: "loading" });
        buttonSubtitle = intl.formatMessage({ id: "loading" });
    } else if (isFiltering) {
        buttonSubtitle = intl.formatMessage({ id: "filtering" });
    }

    return (
        <div
            className={cx(
                "attribute-filter-button__next",
                "s-attribute-filter",
                `s-${stringUtils.simplifyText(title)}`,
                {
                    "is-active": isOpen,
                    "gd-attribute-filter-button-is-filtering__next": isFiltering,
                    "is-loaded": isLoaded,
                },
            )}
            onClick={onClick}
        >
            <div className="button-content">
                <div className="button-title__next">
                    <ShortenedText
                        tooltipAlignPoints={ALIGN_POINT}
                        className={"s-attribute-filter-button-title"}
                    >
                        {buttonTitle}
                    </ShortenedText>
                </div>
                <div className="button-subtitle__next">
                    <span
                        className="button-selected-items__next s-attribute-filter-button-subtitle"
                        ref={subtitleSelectedItemsRef}
                    >
                        {buttonSubtitle}
                    </span>
                    {displayItemCount && (
                        <span className="button-selected-items-count__next">{`(${selectedItemsCount})`}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
