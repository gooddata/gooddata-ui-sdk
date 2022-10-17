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
 * This is the interface of AttributeFilter dropdown button.
 * It opens Attribute filter dropdown and displaying title or subtitle, selection details and attribute filter statuses like loading or filtering.
 *
 * @remarks
 * Note for rendering error status see {@link IAttributeFilterErrorProps}
 * @beta
 */
export interface IAttributeFilterDropdownButtonProps {
    /**
     * Title of attribute {@link  @gooddata/sdk-model#IAttributeFilter} and its related display form {@link  @gooddata/sdk-model#IAttributeDisplayFormMetadataObject}
     *
     * @beta
     */
    title?: string;

    /**
     * List of selected elements titles separated by comma.
     *
     * @beta
     */
    subtitle?: string;

    /**
     * Selected items count
     *
     * @remarks
     * -  If value is 0 for {@link @gooddata/sdk-model#IPositiveAttributeFilter} means NONE items are selected
     *
     * -  If value is 0 for {@link @gooddata/sdk-model#INegativeAttributeFilter} means ALL items are selected
     *
     * @beta
     */
    selectedItemsCount?: number;

    /**
     * This prop defines the open or close state of AttributeFilter dropdown.
     *
     * @beta
     */
    isOpen?: boolean;

    /**
     * This prop means that AttributeFilter is initializing Attribute elements and its internal data.
     *
     * @beta
     */
    isLoading?: boolean;

    /**
     * This prop means that AttributeFilter is filtering elements by parent filters.
     *
     * @beta
     */
    isFiltering?: boolean;

    /**
     * This prop means that all initialization finished
     *
     * @beta
     */
    isLoaded?: boolean;

    /**
     * This prop means that button support drag and drop operation
     *
     * @beta
     */
    isDraggable?: boolean;

    /**
     * Icon of AttributeFilterDropdownButton
     *
     * @beta
     */
    icon?: ReactNode;

    /**
     * Callback to open or close AttributeFilter dropdown.
     *
     * @beta
     */
    onClick?: () => void;
}

/**
 * This component implement {@link IAttributeFilterDropdownButtonProps}
 * It displays AttributeFilterDropdownButton in GD look and feel.
 * It displays the name of related attribute filter and as subtitle state of selection and selection count.
 * It displays loading and filtering statuses.
 * It supports the left icon and dragging icons.
 *
 * @beta
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
            {icon ? <div className="gd-attribute-filter-dropdown-button-icon__next">{icon}</div> : null}
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
                    {displayItemCount ? (
                        <span className="gd-attribute-filter-dropdown-button-selected-items-count__next">{`(${selectedItemsCount})`}</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
