// (C) 2022 GoodData Corporation
import React, { ReactNode, useEffect, useRef, useState } from "react";
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

    isDraggable?: boolean;

    icon?: ReactNode;

    onClick?: () => void;
}

/**
 * @internal
 */
export const AttributeFilterDropdownButton: React.VFC<IAttributeFilterDropdownButtonProps> = (props) => {
    const {
        isOpen,
        title,
        selectedItemsCount,
        subtitle,
        isFiltering,
        isLoading,
        isLoaded,
        isDraggable,
        icon,
        onClick,
    } = props;

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
                "gd-attribute-filter-dropdown-button__next",
                "s-attribute-filter",
                `s-${stringUtils.simplifyText(title)}`,
                {
                    "gd-is-filtering": isFiltering,
                    "gd-is-active": isOpen,
                    "gd-is-loaded": isLoaded,
                    "gd-is-draggable": isDraggable,
                },
            )}
            onClick={onClick}
        >
            {icon && <div className="gd-attribute-filter-dropdown-button-icon__next">{icon}</div>}
            <div className="gd-attribute-filter-dropdown-button-content__next">
                <div className="gd-attribute-filter-dropdown-button-title__next">
                    <ShortenedText
                        tooltipAlignPoints={ALIGN_POINT}
                        className={"s-attribute-filter-button-title"}
                    >
                        {`${buttonTitle}${!isLoading && !isFiltering ? ":" : ""}`}
                    </ShortenedText>
                </div>
                <div className="gd-attribute-filter-dropdown-button-subtitle__next">
                    <span
                        className="gd-attribute-filter-dropdown-button-selected-items__next s-attribute-filter-button-subtitle"
                        ref={subtitleSelectedItemsRef}
                    >
                        {buttonSubtitle}
                    </span>
                    {displayItemCount && (
                        <span className="gd-attribute-filter-dropdown-button-selected-items-count__next">{`(${selectedItemsCount})`}</span>
                    )}
                </div>
            </div>
        </div>
    );
};
