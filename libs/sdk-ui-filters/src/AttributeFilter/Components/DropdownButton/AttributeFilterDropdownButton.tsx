// (C) 2022-2026 GoodData Corporation

import {
    type ComponentType,
    type ReactNode,
    type Ref,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiControlButton } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { FilterButtonCustomIcon } from "../../../shared/components/internal/FilterButtonCustomIcon.js";
import { type IFilterButtonCustomIcon } from "../../../shared/interfaces/index.js";

import { AttributeFilterButtonTooltip } from "./AttributeFilterButtonTooltip.js";

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
    TooltipContentComponent?: ComponentType;

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
    buttonRef?: Ref<HTMLElement>;

    /**
     * Id of the dropdown trigger button.
     *
     * @beta
     */
    buttonId?: string;

    /**
     * Id of the Attribute filter dropdown body.
     *
     * @beta
     */
    dropdownId?: string;

    /**
     * Overrides the accessible name of the button. When omitted, the name is derived from the
     * rendered title.
     *
     * @beta
     */
    ariaLabel?: string;
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
    totalItemsCount,
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
    buttonId,
    dropdownId,
    ariaLabel,
}: IAttributeFilterDropdownButtonProps) {
    const intl = useIntl();
    const subtitleSelectedItemsRef = useRef<HTMLSpanElement>(null);
    const [displayItemCount, setDisplayItemCount] = useState(false);
    const filterIcon = isError ? <i className="gd-icon gd-icon-circle-cross" /> : icon;

    useEffect(() => {
        const element = subtitleSelectedItemsRef.current;
        if (!element) {
            return;
        }
        const roundedWidth = Math.ceil(element.getBoundingClientRect().width);
        setDisplayItemCount(roundedWidth < element.scrollWidth);
    }, [subtitle]);

    const itemsCountString = formatItemsCount(selectedItemsCount, totalItemsCount);

    let buttonTitle = title;
    let buttonSubtitle = subtitle;
    if (isLoading) {
        buttonTitle = intl.formatMessage({ id: "loading" });
        buttonSubtitle = intl.formatMessage({ id: "loading" });
    } else if (isFiltering) {
        buttonSubtitle = intl.formatMessage({ id: "filtering" });
    }

    const titleSlotExtension = (
        <>
            {titleExtension}
            <FilterButtonCustomIcon customIcon={customIcon} disabled={disabled} />
            {TooltipContentComponent && isLoaded ? (
                <AttributeFilterButtonTooltip>
                    <TooltipContentComponent />
                </AttributeFilterButtonTooltip>
            ) : null}
        </>
    );

    const subtitleNode = (
        <span
            className="gd-attribute-filter-dropdown-button-selected-items__next s-attribute-filter-button-subtitle"
            data-testid={isOpen ? "attribute-filter-button-subtitle" : undefined}
            ref={subtitleSelectedItemsRef}
        >
            {buttonSubtitle}
        </span>
    );

    const subtitleExtension =
        showSelectionCount && displayItemCount && isLoaded && itemsCountString ? (
            <span className="gd-attribute-filter-dropdown-button-selected-items-count__next">{`(${itemsCountString})`}</span>
        ) : null;

    const handleButtonRef = useCallback(
        (element: HTMLDivElement | null) => {
            if (!buttonRef) {
                return;
            }
            if (typeof buttonRef === "function") {
                buttonRef(element);
                return;
            }
            buttonRef.current = element;
        },
        [buttonRef],
    );

    return (
        <UiControlButton
            title={`${buttonTitle ?? ""}`}
            titleClassName="s-attribute-filter-button-title"
            subtitle={subtitleNode}
            subtitleExtension={subtitleExtension}
            icon={filterIcon}
            titleExtension={titleSlotExtension}
            isOpen={isOpen}
            isDraggable={isDraggable}
            isError={isError}
            disabled={disabled}
            disabledTooltip={
                disabled ? intl.formatMessage({ id: "filters.locked.filter.tooltip" }) : undefined
            }
            onClick={onClick}
            buttonRef={handleButtonRef}
            buttonId={buttonId}
            dropdownId={dropdownId}
            ariaLabel={ariaLabel}
            className={cx(
                "gd-attribute-filter-dropdown-button__next",
                "s-attribute-filter",
                `s-${simplifyText(title ?? "")}`,
                {
                    "gd-message error": isError,
                    "gd-is-filtering": isFiltering,
                    "gd-is-active": isOpen,
                    "gd-is-loaded": isLoaded,
                    "gd-is-draggable": isDraggable,
                    disabled,
                },
                className,
            )}
        />
    );
}

function formatItemsCount(selected?: number, total?: number): string | undefined {
    if (selected !== undefined && total !== undefined) {
        return `${selected}/${total}`;
    }
    if (selected !== undefined) {
        return `${selected}`;
    }
    if (total !== undefined) {
        return `${total}`;
    }
    return undefined;
}
