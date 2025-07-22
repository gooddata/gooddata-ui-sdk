// (C) 2022-2025 GoodData Corporation
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import { isActionKey, ShortenedText } from "@gooddata/sdk-ui-kit";
import { AttributeFilterButtonTooltip } from "./AttributeFilterButtonTooltip.js";
import { FilterButtonCustomIcon, IFilterButtonCustomIcon } from "../../../shared/index.js";

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
     * Specifies the visibility mode of the filter.
     *
     * @alpha
     */
    disabled?: boolean;

    /**
     * Represents a custom icon along with a tooltip.
     *
     * @alpha
     */
    customIcon?: IFilterButtonCustomIcon;

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
     * Allows adding content to the button after the title.
     *
     * @alpha
     */
    titleExtension?: ReactNode;

    /**
     * Callback to open or close AttributeFilter dropdown.
     *
     * @beta
     */
    onClick?: () => void;

    isError?: boolean;

    /**
     * Classnames to add to the dropdown button component.
     *
     * @beta
     */
    className?: string;

    /**
     * Ref to the dropdown button component.
     *
     * @beta
     */
    buttonRef?: React.MutableRefObject<HTMLElement>;

    /**
     * Id of the Attribute filter dropdown body.
     *
     * @beta
     */
    dropdownId?: string;
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
export function AttributeFilterDropdownButton({
    isOpen,
    title,
    selectedItemsCount,
    showSelectionCount = true,
    subtitle,
    disabled,
    customIcon,
    isFiltering,
    isLoading,
    isLoaded,
    isError,
    isDraggable,
    icon,
    TooltipContentComponent,
    titleExtension,
    onClick,
    className,
    buttonRef,
    dropdownId,
}: IAttributeFilterDropdownButtonProps) {
    const intl = useIntl();
    const subtitleSelectedItemsRef = useRef(null);
    const [displayItemCount, setDisplayItemCount] = useState(false);
    const filterIcon = isError ? <i className="gd-icon gd-icon-circle-cross" /> : icon;
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

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (isActionKey(event) && disabled) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        [disabled],
    );

    return (
        <div
            className={cx(
                "gd-attribute-filter-dropdown-button__next",
                "s-attribute-filter",
                `s-${stringUtils.simplifyText(title)}`,
                {
                    "gd-message": isError,
                    "gd-is-filtering": isFiltering,
                    "gd-is-active": isOpen,
                    "gd-is-loaded": isLoaded,
                    "gd-is-draggable": isDraggable,
                    disabled: disabled,
                },
                className,
            )}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            onClick={onClick}
            onKeyDown={onKeyDown}
            aria-controls={isOpen ? dropdownId : undefined}
            role="button"
            tabIndex={0}
            ref={buttonRef as React.RefObject<HTMLDivElement>}
        >
            {filterIcon ? (
                <div className="gd-attribute-filter-dropdown-button-icon__next">{filterIcon}</div>
            ) : null}
            <div className="gd-attribute-filter-dropdown-button-content__next">
                <div className="gd-attribute-filter-dropdown_button-title-content__next">
                    <div className="gd-attribute-filter-dropdown-button-title__next">
                        <ShortenedText
                            tooltipAlignPoints={ALIGN_POINT}
                            className={"s-attribute-filter-button-title"}
                        >
                            {`${buttonTitle}`}
                        </ShortenedText>
                    </div>
                    {titleExtension}
                    <FilterButtonCustomIcon customIcon={customIcon} disabled={disabled} />
                    {TooltipContentComponent && isLoaded ? (
                        <AttributeFilterButtonTooltip>
                            <TooltipContentComponent />
                        </AttributeFilterButtonTooltip>
                    ) : null}
                </div>
                <div className="gd-attribute-filter-dropdown-button-subtitle__next">
                    <span
                        className="gd-attribute-filter-dropdown-button-selected-items__next s-attribute-filter-button-subtitle"
                        ref={subtitleSelectedItemsRef}
                    >
                        {buttonSubtitle}
                    </span>
                    {showSelectionCount && displayItemCount && isLoaded ? (
                        <span className="gd-attribute-filter-dropdown-button-selected-items-count__next">{`(${selectedItemsCount})`}</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
