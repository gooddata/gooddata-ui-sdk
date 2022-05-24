// (C) 2022 GoodData Corporation
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import isEmpty from "lodash/isEmpty";
import cx from "classnames";
import { ATTRIBUTE_FILTER_BUTTON_TOOLTIP_ALIGN_POINT } from "../constants";

export interface IAttributeFilterButtonDropdownButtonProps {
    className?: string;
    isMobile?: boolean;
    isOpen?: boolean;
    title: string;
    subtitleText: string;
    subtitleItemCount: number;
    isFiltering?: boolean;
    isLoaded?: boolean;
    startAdornment?: ReactNode;
}

const AttributeFilterButtonDropdownButton: React.FC<IAttributeFilterButtonDropdownButtonProps> = (props) => {
    const {
        className,
        isMobile,
        isOpen,
        title,
        subtitleItemCount,
        subtitleText,
        isFiltering,
        isLoaded,
        startAdornment = null,
    } = props;

    const subtitleSelectedItemsRef = useRef(null);
    const [displayItemCount, setDisplayItemCount] = useState(false);
    const [subtitle, setSubtitle] = useState("");

    useEffect(() => {
        if (!isEmpty(subtitleText) && subtitleText !== subtitle) {
            setSubtitle(subtitleText);
        }
    }, [subtitleText]);

    useEffect(() => {
        const element = subtitleSelectedItemsRef.current;

        if (!element) {
            return;
        }

        const roundedWidth = Math.ceil(element.getBoundingClientRect().width);
        const displayItemCount = roundedWidth < element.scrollWidth;

        setDisplayItemCount(displayItemCount);
    }, [subtitle]);

    return (
        <div
            className={cx(
                "attribute-filter-button",
                className,
                "s-attribute-filter",
                `s-${stringUtils.simplifyText(title)}`,
                {
                    "is-active": isOpen,
                    "gd-attribute-filter-button-mobile": isMobile,
                    "gd-attribute-filter-button-is-filtering": isFiltering,
                    "is-loaded": isLoaded,
                },
            )}
        >
            {startAdornment}
            <div className="button-content">
                <div className="button-title">
                    <ShortenedText
                        tooltipAlignPoints={ATTRIBUTE_FILTER_BUTTON_TOOLTIP_ALIGN_POINT}
                        className={"s-attribute-filter-button-title"}
                    >
                        {title}
                    </ShortenedText>
                </div>
                <div className="button-subtitle">
                    <span
                        className="button-selected-items s-attribute-filter-button-subtitle"
                        ref={subtitleSelectedItemsRef}
                    >
                        {subtitle}
                    </span>
                    {displayItemCount && (
                        <span className="button-selected-items-count">{`(${subtitleItemCount})`}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttributeFilterButtonDropdownButton;
