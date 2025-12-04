// (C) 2022-2025 GoodData Corporation

import { MutableRefObject, ReactNode, RefObject } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { stringUtils } from "@gooddata/util";

import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { ShortenedText } from "../ShortenedText/ShortenedText.js";
import { useIdPrefixed } from "../utils/useId.js";

/**
 * @internal
 */
export interface IFilterGroupItemProps {
    /**
     * Title of the filter group item.
     *
     * @beta
     */
    title?: string;

    /**
     * subtitle of the filter group item.
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
     * If true, the Filter group item is opened and renders its opened look.
     *
     * @beta
     */
    isOpen?: boolean;

    /**
     * If true, the Filter group item component renders in loading state.
     *
     * @beta
     */
    isLoading?: boolean;

    /**
     * If true, all the initialization has finished.
     *
     * @beta
     */
    isLoaded?: boolean;

    /**
     * Icon shown within the FilterGroupItem infront of the title.
     *
     * @beta
     */
    icon?: ReactNode;

    /**
     * Allows adding content to the button after the title.
     *
     * @alpha
     */
    titleExtension?: ReactNode;

    /**
     * Callback to open or close filter.
     *
     * @beta
     */
    onClick?: () => void;

    isError?: boolean;

    /**
     * Ref to the filter group item component.
     *
     * @beta
     */
    buttonRef?: MutableRefObject<HTMLElement>;

    /**
     * Id to link the dropdown body. Mainly for accessibility purposes.
     *
     * @beta
     */
    dropdownId?: string;
}

export const ALIGN_POINT = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

/**
 * @internal
 */
export function FilterGroupItem({
    title,
    subtitle,
    selectedItemsCount,
    showSelectionCount,
    isOpen,
    isLoading,
    isLoaded,
    isError,
    icon,
    titleExtension,
    onClick,
    buttonRef,
    dropdownId,
}: IFilterGroupItemProps) {
    const intl = useIntl();
    let buttonTitle = title;
    let buttonSubtitle = subtitle;
    if (isLoading) {
        buttonTitle = title ?? intl.formatMessage({ id: "loading" });
        buttonSubtitle = intl.formatMessage({ id: "loading" });
    }
    const tooltipId = useIdPrefixed("filter-group-item-locked-tooltip");

    return (
        <div
            className={cx("gd-filter-group-item", {
                "gd-message error": isError,
                "gd-is-active": isOpen,
                "gd-is-loaded": isLoaded,
            })}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-describedby={tooltipId}
            onClick={onClick}
            aria-controls={isOpen ? dropdownId : undefined}
            role="button"
            tabIndex={0}
            ref={buttonRef as RefObject<HTMLDivElement>}
            data-testid={`s-filter-group-item-${stringUtils.simplifyText(title ?? null)}`}
        >
            {isError || icon ? (
                <div className="gd-filter-group-item-icon">
                    {isError ? <UiIcon type="crossCircle" size={12} color="currentColor" /> : icon}
                </div>
            ) : null}

            <div className="gd-filter-group-item-body">
                <div className="gd-filter-group-item-content">
                    <div className="gd-filter-group-item-title-content">
                        <div className="gd-filter-group-item-title">
                            <ShortenedText
                                tooltipAlignPoints={ALIGN_POINT}
                                data-testid="s-filter-group-item-title"
                            >
                                {`${buttonTitle}`}
                            </ShortenedText>
                        </div>
                        {titleExtension}
                    </div>
                    <div className="gd-filter-group-item-subtitle">
                        <span
                            className="gd-filter-group-item-selected-items"
                            data-testid="s-filter-group-item-subtitle"
                        >
                            {buttonSubtitle}
                        </span>
                        {showSelectionCount && isLoaded ? (
                            <span className="gd-filter-group-item-selected-items-count">
                                {`(${selectedItemsCount})`}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="gd-filter-group-item-chevron">
                    <UiIcon type="navigateRight" size={14} />
                </div>
            </div>
        </div>
    );
}
