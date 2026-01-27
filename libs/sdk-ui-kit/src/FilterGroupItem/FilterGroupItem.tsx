// (C) 2022-2026 GoodData Corporation

import {
    type KeyboardEvent,
    type KeyboardEventHandler,
    type MutableRefObject,
    type ReactNode,
    type RefObject,
    useCallback,
} from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { simplifyText } from "@gooddata/util";

import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { UiTooltip } from "../@ui/UiTooltip/UiTooltip.js";
import { ShortenedText } from "../ShortenedText/ShortenedText.js";
import { isActionKey } from "../utils/events.js";
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
     * Total items count. Shown beside the selected items count if showSelectionCount is true.
     *
     * @beta
     */
    totalItemsCount?: number;

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
    buttonRef?: MutableRefObject<HTMLElement | null>;

    /**
     * Id to link the dropdown body. Mainly for accessibility purposes.
     *
     * @beta
     */
    dropdownId?: string;

    /**
     * Specifies the visibility mode of the filter.
     *
     * @alpha
     */
    disabled?: boolean;
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
    totalItemsCount,
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
    disabled,
}: IFilterGroupItemProps) {
    const intl = useIntl();
    let buttonTitle = title;
    let buttonSubtitle = subtitle;
    if (isLoading) {
        buttonTitle = title ?? intl.formatMessage({ id: "loading" });
        buttonSubtitle = intl.formatMessage({ id: "loading" });
    }
    const tooltipId = useIdPrefixed("filter-group-item-locked-tooltip");
    const onKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (disabled && isActionKey(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        [disabled],
    );

    let itemsCountString: string | undefined;
    if (selectedItemsCount !== undefined && totalItemsCount !== undefined) {
        itemsCountString = `${selectedItemsCount}/${totalItemsCount}`;
    } else if (selectedItemsCount !== undefined) {
        itemsCountString = `${selectedItemsCount}`;
    } else if (totalItemsCount !== undefined) {
        itemsCountString = `${totalItemsCount}`;
    }

    const buttonComponent = (
        <div
            className={cx("gd-filter-group-item", {
                error: isError,
                "gd-is-active": isOpen,
                "gd-is-loaded": isLoaded,
                "gd-is-disabled": disabled,
            })}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-describedby={disabled ? tooltipId : undefined}
            aria-disabled={disabled}
            onClick={disabled ? undefined : onClick}
            onKeyDown={onKeyDown}
            aria-controls={isOpen ? dropdownId : undefined}
            role="button"
            tabIndex={0}
            ref={buttonRef as RefObject<HTMLDivElement>}
            data-testid={`s-filter-group-item-${simplifyText(title ?? null)}`}
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
                        <div className="gd-filter-group-item-title-extension">{titleExtension}</div>
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
                                {`(${itemsCountString})`}
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

    return disabled ? (
        <UiTooltip
            id={tooltipId}
            anchor={buttonComponent}
            content={intl.formatMessage({ id: "filters.locked.filter.tooltip" })}
            triggerBy={["focus"]}
            arrowPlacement="top"
            showArrow
            width="same-as-anchor"
            anchorWrapperStyles={{ width: "100%" }}
        />
    ) : (
        buttonComponent
    );
}
