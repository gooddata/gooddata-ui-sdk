// (C) 2007-2025 GoodData Corporation
import React, { useState, useEffect, useCallback } from "react";
import { IntlShape } from "react-intl";
import cx from "classnames";
import { IExecutionDefinition, ITotal, SortDirection } from "@gooddata/sdk-model";
import { IOnOpenedChangeParams } from "@gooddata/sdk-ui-kit";

import { IMenu } from "../../../publicTypes.js";
import { AVAILABLE_TOTALS, HEADER_LABEL_CLASS } from "../../base/constants.js";
import { TableDescriptor } from "../tableDescriptor.js";
import { IMenuAggregationClickConfig } from "../../privateTypes.js";

import AggregationsMenu from "./AggregationsMenu.js";

export type AlignPositions = "left" | "right" | "center";
export const ALIGN_LEFT = "left";
export const ALIGN_RIGHT = "right";

export interface ICommonHeaderParams {
    getTableDescriptor: () => TableDescriptor;
    onMenuAggregationClick?: (config: IMenuAggregationClickConfig) => void;
    getExecutionDefinition?: () => IExecutionDefinition;
    getColumnTotals?: () => ITotal[];
    getRowTotals?: () => ITotal[];
    intl?: IntlShape;
    setLastSortedColId?: (colId: string | null) => void;
}

export interface IHeaderCellProps extends ICommonHeaderParams {
    displayText: string;
    className?: string;
    enableSorting?: boolean;
    defaultSortDirection?: SortDirection;
    menuPosition?: AlignPositions;
    textAlign?: AlignPositions;
    sortDirection?: SortDirection | null;
    onSortClick?: () => void;
    menu?: IMenu | null;
    colId?: string;
    isFocused?: boolean;
}

export interface IHeaderCellState {
    isMenuOpen: boolean;
    isMenuButtonVisible: boolean;
    currentSortDirection: SortDirection | null;
}

function HeaderCell({
    sortDirection = null,
    textAlign = ALIGN_LEFT,
    menuPosition = ALIGN_LEFT,
    menu = null,
    enableSorting = false,
    onMenuAggregationClick = () => null,
    onSortClick = () => null,
    displayText,
    className,
    defaultSortDirection,
    intl,
    colId,
    getTableDescriptor,
    getExecutionDefinition,
    getColumnTotals,
    getRowTotals,
    isFocused,
}: IHeaderCellProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuButtonVisible, setIsMenuButtonVisible] = useState(false);
    const [currentSortDirection, setCurrentSortDirection] = useState<SortDirection | null>(null);

    const resetSortDirection = useCallback(() => {
        setCurrentSortDirection(sortDirection!);
    }, [sortDirection]);

    useEffect(() => {
        resetSortDirection();
    }, [resetSortDirection]);

    useEffect(() => {
        setCurrentSortDirection((currentSortDirection) => {
            if (sortDirection !== currentSortDirection) {
                return sortDirection;
            }
            return currentSortDirection;
        });
    }, [sortDirection]);

    const onMouseEnterHeaderCellText = useCallback(() => {
        if (enableSorting) {
            let newSortDirection: SortDirection | null = null;
            if (sortDirection === null) {
                newSortDirection = defaultSortDirection ?? null;
            } else if (sortDirection === "asc") {
                newSortDirection = "desc";
            } else if (sortDirection === "desc") {
                newSortDirection = "asc";
            } else {
                newSortDirection = null;
            }
            setCurrentSortDirection(newSortDirection);
        }
    }, [enableSorting, sortDirection, defaultSortDirection, setCurrentSortDirection]);

    const onMouseLeaveHeaderCellText = useCallback(() => {
        resetSortDirection();
    }, [resetSortDirection]);

    useEffect(() => {
        if (isFocused) {
            onMouseEnterHeaderCellText();
        } else {
            onMouseLeaveHeaderCellText();
        }
    }, [isFocused, onMouseEnterHeaderCellText, onMouseLeaveHeaderCellText]);

    const renderMenu = () => {
        if (!menu?.aggregations) {
            return null;
        }

        return (
            <AggregationsMenu
                intl={intl!}
                colId={colId!}
                isMenuOpened={isMenuOpen}
                isMenuButtonVisible={isMenuButtonVisible}
                showSubmenu={menu.aggregations ?? false}
                showColumnsSubMenu={menu.aggregationsSubMenuForRows ?? false}
                availableTotalTypes={menu.aggregationTypes ?? AVAILABLE_TOTALS}
                getTableDescriptor={getTableDescriptor}
                getExecutionDefinition={getExecutionDefinition!}
                getColumnTotals={getColumnTotals}
                getRowTotals={getRowTotals}
                onMenuOpenedChange={handleMenuOpenedChange}
                onAggregationSelect={menuItemClick}
            />
        );
    };

    const renderText = () => {
        const classes = cx(HEADER_LABEL_CLASS, "gd-pivot-table-header-label", {
            "gd-pivot-table-header-label--right": textAlign === "right",
            "gd-pivot-table-header-label--center": textAlign === "center",
            "gd-pivot-table-header-label--clickable": enableSorting,
        });

        return (
            <div
                className={classes}
                onClick={onTextClick}
                onMouseEnter={onMouseEnterHeaderCellText}
                onMouseLeave={onMouseLeaveHeaderCellText}
            >
                <span>{displayText ? displayText : ""}</span>
                {renderSorting()}
            </div>
        );
    };

    const renderSorting = () => {
        const sortClasses = cx("s-sort-direction-arrow", `s-sorted-${currentSortDirection}`, {
            "gd-pivot-table-header-arrow-up": currentSortDirection === "asc",
            "gd-pivot-table-header-arrow-down": currentSortDirection === "desc",
        });

        return (
            currentSortDirection &&
            enableSorting && (
                <span className="gd-pivot-table-header-next-sort">
                    <span className={sortClasses} />
                </span>
            )
        );
    };

    const onMouseEnterHeaderCell = () => {
        showMenuButton();
    };

    const onMouseLeaveHeaderCell = () => {
        hideMenuButton();
    };

    const onTextClick = () => {
        if (!enableSorting) {
            return;
        }

        onSortClick!();
    };

    const showMenuButton = () => {
        if (isMenuOpen) {
            return;
        }

        setIsMenuButtonVisible(true);
    };

    const hideMenuButton = () => {
        if (isMenuOpen) {
            return;
        }

        setIsMenuButtonVisible(false);
    };

    const hideAndCloseMenu = () => {
        setIsMenuButtonVisible(false);
        setIsMenuOpen(false);
    };

    const menuItemClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        hideAndCloseMenu();
        if (onMenuAggregationClick) {
            onMenuAggregationClick(menuAggregationClickConfig);
        }
    };

    const handleMenuOpenedChange = ({ opened, source }: IOnOpenedChangeParams) => {
        setIsMenuOpen(opened);

        // When source is 'TOGGLER_BUTTON_CLICK' we do not want to hide menu
        // button visibility. Because user is hovering over this button
        // so we do not want to hide it.
        if (source === "OUTSIDE_CLICK" || source === "SCROLL") {
            setIsMenuButtonVisible(false);
        }
    };

    return (
        <div
            className={cx(
                "gd-pivot-table-header",
                {
                    "gd-pivot-table-header--open": isMenuButtonVisible,
                },
                className,
            )}
            onMouseEnter={onMouseEnterHeaderCell}
            onMouseLeave={onMouseLeaveHeaderCell}
        >
            {menuPosition === "left" && renderMenu()}
            {renderText()}
            {menuPosition === "right" && renderMenu()}
        </div>
    );
}

export default HeaderCell;
