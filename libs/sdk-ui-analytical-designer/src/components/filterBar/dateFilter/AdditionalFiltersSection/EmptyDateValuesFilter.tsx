// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, useCallback, useMemo, useRef } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import {
    Button,
    FilterLabel,
    type IUiDropdownBodyRenderProps,
    type IUiListboxInteractiveItem,
    OverlayController,
    OverlayControllerProvider,
    UiDropdown,
    UiListbox,
} from "@gooddata/sdk-ui-kit";

import { type EmptyDateValuesFilterMode } from "../../../../store/filter_bar/filter_bar_types.js";

// High z-index to ensure dropdown appears above date filter dialog
const DROPDOWN_Z_INDEX = 6001;
// Overlay controller for nested floating elements (tooltips) - starts above the dropdown
const overlayController = OverlayController.getInstance(DROPDOWN_Z_INDEX + 1);

interface IEmptyDateValuesFilterProps {
    mode: EmptyDateValuesFilterMode;
    onModeChange: (mode: EmptyDateValuesFilterMode) => void;
    onRemove: () => void;
    openOnInit?: boolean;
    isAllTime?: boolean;
    canRemove?: boolean;
}

/**
 * Stops event propagation to prevent parent overlays from closing.
 * Re-dispatches to documentElement (not document) so other floating elements
 * can still detect outside clicks, but old Overlay components listening on
 * document won't receive it.
 */
const stopOverlayPropagation = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    // Re-dispatch to documentElement for floating-ui based components
    const evt = new MouseEvent(e.nativeEvent.type, e.nativeEvent);
    Object.defineProperty(evt, "target", { value: e.nativeEvent.target, enumerable: true });
    document.documentElement.dispatchEvent(evt);
};

export function EmptyDateValuesFilter({
    mode,
    onModeChange,
    onRemove,
    openOnInit = false,
    isAllTime = true,
    canRemove = true,
}: IEmptyDateValuesFilterProps) {
    const intl = useIntl();
    const listboxRef = useRef<HTMLUListElement>(null);

    const getModeLabel = useCallback(
        (filterMode: EmptyDateValuesFilterMode) => {
            switch (filterMode) {
                case "include":
                    return intl.formatMessage({ id: "filter.date.empty_values.include" });
                case "exclude":
                    return intl.formatMessage({ id: "filter.date.empty_values.exclude" });
                case "only":
                    return intl.formatMessage({ id: "filter.date.empty_values.only" });
                default:
                    return "";
            }
        },
        [intl],
    );

    const isIncludeDisabled = !isAllTime;
    const listboxItems: IUiListboxInteractiveItem<EmptyDateValuesFilterMode>[] = useMemo(
        () => [
            {
                type: "interactive",
                id: "include",
                stringTitle: getModeLabel("include"),
                data: "include",
                isDisabled: isIncludeDisabled,
                tooltip: isIncludeDisabled
                    ? intl.formatMessage({ id: "filter.date.empty_values.include.disabled_option_tooltip" })
                    : undefined,
            },
            {
                type: "interactive",
                id: "exclude",
                stringTitle: getModeLabel("exclude"),
                data: "exclude",
            },
            {
                type: "interactive",
                id: "only",
                stringTitle: getModeLabel("only"),
                data: "only",
                tooltip: intl.formatMessage({ id: "filter.date.empty_values.only.tooltip" }),
            },
        ],
        [getModeLabel, intl, isIncludeDisabled],
    );

    const renderDropdownButton = useCallback(
        ({ isOpen, toggleDropdown }: { isOpen: boolean; toggleDropdown: () => void }) => {
            const buttonClasses = cx(
                "adi-empty-values-filter-button",
                "s-adi-empty-values-filter-button",
                "gd-button-primary",
                "gd-button-small",
                "button-dropdown",
                "dropdown-button",
                "gd-icon-right",
                { "is-dropdown-open": isOpen },
                { "is-active": isOpen },
                { "gd-icon-navigateup": isOpen },
                { "gd-icon-navigatedown": !isOpen },
            );

            return (
                <button tabIndex={-1} className={buttonClasses} onClick={toggleDropdown}>
                    <FilterLabel title={getModeLabel(mode)} />
                </button>
            );
        },
        [getModeLabel, mode],
    );

    const renderDropdownBody = useCallback(
        ({
            closeDropdown,
            ariaAttributes,
            triggerId,
        }: Pick<IUiDropdownBodyRenderProps, "closeDropdown" | "ariaAttributes" | "triggerId">) => {
            const handleSelect = (item: IUiListboxInteractiveItem<EmptyDateValuesFilterMode>) => {
                onModeChange(item.data);
                closeDropdown();
            };

            return (
                // OverlayControllerProvider ensures nested floating elements (tooltips) get proper z-index
                <OverlayControllerProvider overlayController={overlayController}>
                    {/*Wrapper to stop click/mousedown propagation to parent overlays*/}
                    <div
                        className="adi-empty-values-filter-dropdown"
                        onClick={stopOverlayPropagation}
                        onMouseDown={stopOverlayPropagation}
                    >
                        <UiListbox
                            items={listboxItems}
                            itemDataTestId={(item) =>
                                item.type === "interactive"
                                    ? `empty-values-filter-dropdown-${item.data}`
                                    : undefined
                            }
                            selectedItemId={mode}
                            onSelect={handleSelect}
                            onClose={closeDropdown}
                            dataTestId="s-adi-empty-values-filter-dropdown"
                            ariaAttributes={{ ...ariaAttributes, "aria-labelledby": triggerId }}
                            reference={listboxRef}
                            isCompact
                        />
                    </div>
                </OverlayControllerProvider>
            );
        },
        [listboxItems, mode, onModeChange],
    );

    // Focus the listbox when dropdown opens for keyboard navigation
    const handleDropdownOpen = useCallback(() => {
        // Use setTimeout to ensure the dropdown is rendered before focusing
        setTimeout(() => {
            listboxRef.current?.focus();
        }, 0);
    }, []);

    return (
        <div className="adi-date-dropdown adi-empty-values-filter s-adi-empty-values-filter">
            <FormattedMessage id="filter.date.additional_filter.empty_values" />
            <div className="adi-empty-values-filter-button-wrapper">
                <UiDropdown
                    renderButton={renderDropdownButton}
                    renderBody={renderDropdownBody}
                    closeOnOutsideClick
                    closeOnParentScroll
                    closeOnMouseDrag
                    closeOnEscape
                    placement="bottom-start"
                    zIndex={DROPDOWN_Z_INDEX}
                    accessibilityConfig={{
                        triggerRole: "combobox",
                        popupRole: "listbox",
                    }}
                    width="same-as-anchor"
                    onOpen={handleDropdownOpen}
                    openOnInit={openOnInit}
                />
                {canRemove ? (
                    <Button
                        className="gd-button-link gd-button-icon-only gd-icon-cross adi-empty-values-filter-remove s-remove-empty-values-filter"
                        onClick={onRemove}
                    />
                ) : null}
            </div>
        </div>
    );
}
