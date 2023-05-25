// (C) 2022-2023 GoodData Corporation
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { AttributeFilterButtonToolip } from "./AttributeFilterButtonTooltip.js";

export const ALIGN_POINT = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

/**
 * The interface of the AttributeFilter dropdown button.
 *
 * @remarks
 * It opens Attribute filter dropdown and displaying title or subtitle, selection details and attribute filter statuses like loading or filtering.
 * Note: for rendering error status see {@link IAttributeFilterErrorProps}.
 * @beta
 */
export interface IAttributeFilterDropdownButtonProps {
    /**
     * Title of the attribute {@link @gooddata/sdk-model#IAttributeFilter} and its related display form {@link @gooddata/sdk-model#IAttributeDisplayFormMetadataObject}.
     *
     * @beta
     */
    title?: string;

    /**
     * Comma-separated list of selected element titles.
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
     *
     * @beta
     */
    showSelectionCount?: boolean;

    /**
     * If true, the AttributeFilter dropdown is open.
     *
     * @beta
     */
    isOpen?: boolean;

    /**
     * If true, the AttributeFilter is initializing Attribute elements and its internal data.
     *
     * @beta
     */
    isLoading?: boolean;

    /**
     * If true, the AttributeFilter is filtering its elements by parent filters.
     *
     * @beta
     */
    isFiltering?: boolean;

    /**
     * If true, all the initialization has finished.
     *
     * @beta
     */
    isLoaded?: boolean;

    /**
     * If true, the button supports drag and drop operations.
     *
     * @beta
     */
    isDraggable?: boolean;

    /**
     * Icon of the AttributeFilterDropdownButton.
     *
     * @beta
     */
    icon?: ReactNode;

    /**
     * Customize content of the attribute filter tooltip component.
     *
     * @beta
     */
    TooltipContentComponent?: React.ComponentType;

    /**
     * Callback to open or close AttributeFilter dropdown.
     *
     * @beta
     */
    onClick?: () => void;
}

/**
 * Dropdown button for the AttributeFilter.
 *
 * @remarks
 * This component implements the {@link IAttributeFilterDropdownButtonProps} interface.
 * It displays AttributeFilterDropdownButton in the GoodData look and feel.
 * It displays the name of the related attribute filter as a title and the state of the selection as a subtitle.
 * It displays loading and filtering statuses.
 * It supports setting a left icon and dragging icons.
 *
 * @beta
 */
export const AttributeFilterDropdownButton: React.VFC<IAttributeFilterDropdownButtonProps> = (props) => {
    const {
        isOpen,
        title,
        selectedItemsCount,
        showSelectionCount = true,
        subtitle,
        isFiltering,
        isLoading,
        isLoaded,
        isDraggable,
        icon,
        TooltipContentComponent,
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
                <div className="gd-attribute-filter-dropdown_button-title-content__next">
                    <div className="gd-attribute-filter-dropdown-button-title__next">
                        <ShortenedText
                            tooltipAlignPoints={ALIGN_POINT}
                            className={"s-attribute-filter-button-title"}
                        >
                            {`${buttonTitle}${!isLoading && !isFiltering ? ":" : ""}`}
                        </ShortenedText>
                    </div>
                    {TooltipContentComponent && isLoaded ? (
                        <AttributeFilterButtonToolip>
                            <TooltipContentComponent />
                        </AttributeFilterButtonToolip>
                    ) : null}
                </div>
                <div className="gd-attribute-filter-dropdown-button-subtitle__next">
                    <span
                        className="gd-attribute-filter-dropdown-button-selected-items__next s-attribute-filter-button-subtitle"
                        ref={subtitleSelectedItemsRef}
                    >
                        {buttonSubtitle}
                    </span>
                    {showSelectionCount && displayItemCount ? (
                        <span className="gd-attribute-filter-dropdown-button-selected-items-count__next">{`(${selectedItemsCount})`}</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
