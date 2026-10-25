// (C) 2007-2026 GoodData Corporation

import { memo, useCallback, useEffect, useRef, useState } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";

import { DropdownButton, type IOnOpenedChangeParams, Menu } from "@gooddata/sdk-ui-kit";

import { type Granularity, type IGranularityOption } from "../../../models/granularity.js";

import { DateGranularityMenu } from "./DateGranularityMenu.js";

interface IDateGranularityDropdownProps {
    granularities: IGranularityOption[];
    selectedGranularity: Granularity;
    onGranularityChange: (granularity: Granularity) => void;
}

export const DateGranularityDropdown = memo(function DateGranularityDropdown({
    granularities,
    selectedGranularity,
    onGranularityChange,
}: IDateGranularityDropdownProps) {
    const intl = useIntl();
    const [isOpen, setIsOpen] = useState(false);
    const isMenuMountedRef = useRef(false);

    useEffect(() => {
        isMenuMountedRef.current = true;
        return () => {
            isMenuMountedRef.current = false;
        };
    }, []);

    const toggleDropdown = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
    }, []);

    const onOpenedChange = useCallback(({ opened, source }: IOnOpenedChangeParams) => {
        if (isMenuMountedRef.current && source === "OUTSIDE_CLICK") {
            setIsOpen(opened);
        }
    }, []);

    const renderDropdownButton = useCallback(
        (isOpen: boolean, toggleDropdown: () => void) => {
            const className = classNames("s-date-granularity-button", {
                "s-expanded": isOpen,
                "s-collapsed": !isOpen,
            });
            const selectedGranularityLabel = granularities.find(
                (granularity) => granularity.dateType === selectedGranularity,
            )?.label;
            return (
                <DropdownButton
                    onClick={toggleDropdown}
                    className={className}
                    value={intl.formatMessage({ id: selectedGranularityLabel })}
                    isOpen={isOpen}
                />
            );
        },
        [granularities, selectedGranularity, intl],
    );

    const handleOnGranularityChange = useCallback(
        (granularity: Granularity) => {
            onGranularityChange(granularity);
            closeDropdown();
        },
        [onGranularityChange, closeDropdown],
    );

    return (
        <Menu
            toggler={renderDropdownButton(isOpen, toggleDropdown)}
            opened={isOpen}
            openAction={"click"}
            closeOnScroll
            onOpenedChange={onOpenedChange}
        >
            <DateGranularityMenu
                granularities={granularities}
                selectedGranularity={selectedGranularity}
                onGranularityChange={handleOnGranularityChange}
            />
        </Menu>
    );
});
