// (C) 2022-2026 GoodData Corporation

import { type MutableRefObject, useMemo } from "react";

import classNames from "classnames";
import { type IntlShape, useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { type CurrentSortType } from "./types.js";

export interface ISortButtonProps {
    currentSortType: CurrentSortType;
    isEnabled: boolean;
    isOpen: boolean;
    onClick: () => void;
    refCallback: MutableRefObject<HTMLElement>;
}

const getButtonValue = (currentSortType: CurrentSortType, intl: IntlShape) => {
    switch (currentSortType) {
        case "DISABLED":
            return intl.formatMessage({ id: "chartSort.sortConfigButton.value.disabled" });
        case "MIXED":
            return intl.formatMessage({ id: "chartSort.sortConfigButton.value.mixed" });
        default:
            return undefined;
    }
};

export function SortButton({ currentSortType, onClick, isEnabled, isOpen, refCallback }: ISortButtonProps) {
    const intl = useIntl();

    const cssClasses = classNames(
        "adi-filter-bar-button",
        "sort-button",
        "s-chart-sort-button",
        "gd-button-primary",
        "gd-button-small",
        {
            "is-dropdown-open": isOpen,
            "is-active": isOpen,
            disabled: !isEnabled,
        },
    );

    const leftIcon = classNames({
        "sort-icon sort-icon--date-asc s-sort-icon--date-asc": currentSortType === "DATE_ASC",
        "sort-icon sort-icon--date-desc s-sort-icon--date-desc": currentSortType === "DATE_DESC",
        "sort-icon sort-icon--default s-sort-icon--default": currentSortType === "DEFAULT",
        "sort-icon sort-icon--numerical-asc s-sort-icon--numerical-asc": currentSortType === "NUMERICAL_ASC",
        "sort-icon sort-icon--numerical-desc s-sort-icon--numerical-desc":
            currentSortType === "NUMERICAL_DESC",
        "sort-icon sort-icon--alphabetical-asc s-sort-icon--alphabetical-asc":
            currentSortType === "ALPHABETICAL_ASC",
        "sort-icon sort-icon--alphabetical-desc s-sort-icon--alphabetical-desc":
            currentSortType === "ALPHABETICAL_DESC",
    });

    const dropDownIcon = classNames({
        "gd-icon-navigateup": isOpen,
        "gd-icon-navigatedown": !isOpen,
    });

    const buttonValue = useMemo(() => getButtonValue(currentSortType, intl), [currentSortType, intl]);

    const handleClick = () => {
        if (isEnabled) {
            onClick();
        }
    };

    return (
        <Button
            className={cssClasses}
            onClick={handleClick}
            iconLeft={leftIcon}
            iconRight={dropDownIcon}
            value={buttonValue}
            ref={refCallback}
        />
    );
}
