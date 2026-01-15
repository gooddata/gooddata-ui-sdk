// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useRef, useState } from "react";

import cx from "classnames";
import { type IntlShape } from "react-intl";

import { type IExecutionDefinition, type ITotal, type SortDirection } from "@gooddata/sdk-model";
import { type IOnOpenedChangeParams } from "@gooddata/sdk-ui-kit";

import { AggregationsMenu } from "./AggregationsMenu.js";
import { type IMenu } from "../../../publicTypes.js";
import { AVAILABLE_TOTALS, HEADER_LABEL_CLASS } from "../../base/constants.js";
import { type IMenuAggregationClickConfig } from "../../privateTypes.js";
import { type TableDescriptor } from "../tableDescriptor.js";

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

export function HeaderCell({
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
        setCurrentSortDirection(sortDirection);
    }, [sortDirection]);

    // This effect replaces UNSAFE_componentWillReceiveProps
    // It should only update currentSortDirection when sortDirection prop changes
    // and is different from the current value
    const prevSortDirectionRef = useRef(sortDirection);
    useEffect(() => {
        if (prevSortDirectionRef.current !== sortDirection) {
            prevSortDirectionRef.current = sortDirection;
            resetSortDirection();
        }
    }, [sortDirection, resetSortDirection]);

    const onMouseEnterHeaderCellText = useCallback(() => {
        if (enableSorting) {
            let newSortDirection: SortDirection | null;
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

    const handleMenuOpenedChange = useCallback(({ opened, source }: IOnOpenedChangeParams) => {
        setIsMenuOpen(opened);

        // When source is 'TOGGLER_BUTTON_CLICK' we do not want to hide menu
        // button visibility. Because user is hovering over this button
        // so we do not want to hide it.
        if (source === "OUTSIDE_CLICK" || source === "SCROLL") {
            setIsMenuButtonVisible(false);
        }
    }, []);

    const hideAndCloseMenu = useCallback(() => {
        setIsMenuButtonVisible(false);
        setIsMenuOpen(false);
    }, []);

    const menuItemClick = useCallback(
        (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
            hideAndCloseMenu();
            if (onMenuAggregationClick) {
                onMenuAggregationClick(menuAggregationClickConfig);
            }
        },
        [hideAndCloseMenu, onMenuAggregationClick],
    );

    const renderMenu = useCallback(() => {
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
    }, [
        colId,
        getColumnTotals,
        getExecutionDefinition,
        getRowTotals,
        getTableDescriptor,
        handleMenuOpenedChange,
        intl,
        isMenuButtonVisible,
        isMenuOpen,
        menu?.aggregationTypes,
        menu?.aggregations,
        menu?.aggregationsSubMenuForRows,
        menuItemClick,
    ]);

    const onTextClick = useCallback(() => {
        if (!enableSorting) {
            return;
        }

        onSortClick();
    }, [enableSorting, onSortClick]);

    const renderSorting = useCallback(() => {
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
    }, [currentSortDirection, enableSorting]);

    const renderText = useCallback(() => {
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
                <span>{displayText || ""}</span>
                {renderSorting()}
            </div>
        );
    }, [
        displayText,
        enableSorting,
        onMouseEnterHeaderCellText,
        onMouseLeaveHeaderCellText,
        onTextClick,
        renderSorting,
        textAlign,
    ]);

    const hideMenuButton = useCallback(() => {
        if (isMenuOpen) {
            return;
        }

        setIsMenuButtonVisible(false);
    }, [isMenuOpen]);

    const showMenuButton = useCallback(() => {
        if (isMenuOpen) {
            return;
        }

        setIsMenuButtonVisible(true);
    }, [isMenuOpen]);

    const onMouseEnterHeaderCell = useCallback(() => {
        showMenuButton();
    }, [showMenuButton]);

    const onMouseLeaveHeaderCell = useCallback(() => {
        hideMenuButton();
    }, [hideMenuButton]);

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
