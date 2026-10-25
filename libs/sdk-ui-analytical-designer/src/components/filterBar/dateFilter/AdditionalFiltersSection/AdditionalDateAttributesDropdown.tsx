// (C) 2021-2026 GoodData Corporation

import { type ReactNode, useEffect, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { Button, Header, Item, ItemsWrapper, Menu, useOverlayZIndexWithRegister } from "@gooddata/sdk-ui-kit";

import { type Granularity, type IGranularityOption } from "../../../../models/granularity.js";
import { DateGranularitySubMenuItems } from "../../../buckets/categories/DateGranularitySubMenuItems.js";

interface IAdditionalDateAttributesDropdownProps {
    granularities: IGranularityOption[];
    onGranularityChange: (granularity: Granularity) => void;
    isEmptyDateValuesFilterEnabled: boolean;
    onEmptyDateValuesFilterAdd: () => void;
    isDisabled?: boolean;
    /**
     * Whether the empty date values filter is offered at all; a metric date filter has no place to
     * store it.
     */
    isEmptyDateValuesFilterAvailable?: boolean;
}

// Menu portals to <body> with no overlay-stack awareness, so its z-index must come from the
// active OverlayController: when AD runs inside the KD editor overlay, the hosting date filter
// dropdown gets an inline z-index from that controller and would otherwise paint over the menu
// (the .adi-date-granularity-dropdown CSS pins 5001, tying only with un-controlled overlays).
// Mounted only while the menu is open, so it registers on open and releases on close; without a
// controller it falls back to 5001, keeping standalone AD behavior unchanged.
function MenuItemsWrapper({ children }: { children: ReactNode }) {
    const zIndex = useOverlayZIndexWithRegister();
    return (
        <ItemsWrapper
            className="adi-additional-date-granularities-dropdown s-adi-additional-date-granularities-dropdown adi-date-granularity-dropdown"
            smallItemsSpacing
            style={{ zIndex }}
        >
            {children}
        </ItemsWrapper>
    );
}

export function AdditionalDateAttributesDropdown({
    granularities,
    onGranularityChange,
    isEmptyDateValuesFilterEnabled,
    onEmptyDateValuesFilterAdd,
    isDisabled,
    isEmptyDateValuesFilterAvailable = true,
}: IAdditionalDateAttributesDropdownProps) {
    const intl = useIntl();
    const canAddEmptyDateValuesFilter = isEmptyDateValuesFilterAvailable && !isEmptyDateValuesFilterEnabled;

    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = ({ opened: shouldBeOpen }: { opened: boolean }) => {
        // Always allow closing (shouldBeOpen === false), but only allow opening when not disabled
        if (!shouldBeOpen || !isDisabled) {
            setIsOpen(shouldBeOpen);
        }
    };

    // Close the menu when it becomes disabled
    useEffect(() => {
        if (isDisabled && isOpen) {
            setIsOpen(false);
        }
    }, [isDisabled, isOpen]);

    const onGranularityChangeHandler = (granularity: Granularity) => {
        setIsOpen(false);
        onGranularityChange(granularity);
    };

    const onEmptyDateValuesFilterAddHandler = () => {
        setIsOpen(false);
        onEmptyDateValuesFilterAdd();
    };

    const additionalDateAttributesDropdownButtonClasses = cx(
        "adi-additional-date-granularities-dropdown-button",
        "s-adi-additional-date-granularities-dropdown-button",
        "gd-button-link",
        "gd-icon-plus",
        "button-dropdown",
        { "is-active": isOpen },
    );

    const AdditionalDateAttributesDropdownButton = (
        <Button
            className={additionalDateAttributesDropdownButtonClasses}
            value={intl.formatMessage({ id: "filter.date.additional_filter" })}
        />
    );

    const hasGranularities = granularities.length > 0;

    // Show dropdown if there are granularities or if the empty date values filter can still be added
    if (!hasGranularities && !canAddEmptyDateValuesFilter) {
        return null;
    }

    return (
        <Menu
            openAction="click"
            opened={isOpen}
            onOpenedChange={handleOpenChange}
            toggler={AdditionalDateAttributesDropdownButton}
        >
            <MenuItemsWrapper>
                <div className="adi-additional-date-granularities-dropdown-label">
                    <FormattedMessage id="filter.date.additional_filter_dropdown_label" />
                </div>
                {hasGranularities ? (
                    <DateGranularitySubMenuItems
                        granularities={granularities}
                        onGranularityChange={onGranularityChangeHandler}
                    />
                ) : null}
                {canAddEmptyDateValuesFilter ? (
                    <>
                        <Header>
                            <FormattedMessage id="filter.date.additional_filter.category.other" />
                        </Header>
                        <Item
                            className="adi-empty-values-filter-item s-adi-empty-values-filter-item"
                            onClick={onEmptyDateValuesFilterAddHandler}
                        >
                            <FormattedMessage id="filter.date.additional_filter.empty_values" />
                        </Item>
                    </>
                ) : null}
            </MenuItemsWrapper>
        </Menu>
    );
}
