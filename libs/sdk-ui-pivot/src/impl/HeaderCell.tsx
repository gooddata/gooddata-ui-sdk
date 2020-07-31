// (C) 2007-2018 GoodData Corporation
import { DataViewFacade } from "@gooddata/sdk-ui";
import React from "react";
import { IntlShape } from "react-intl";
import cx from "classnames";

import { IMenu, IMenuAggregationClickConfig } from "../types";
import { IOnOpenedChangeParams } from "../menu/MenuSharedTypes";
import AggregationsMenu from "./AggregationsMenu";
import { IExecutionDefinition, ITotal, SortDirection } from "@gooddata/sdk-model";

export type AlignPositions = "left" | "right" | "center";
export const ALIGN_LEFT = "left";
export const ALIGN_RIGHT = "right";

export interface ICommonHeaderParams {
    onMenuAggregationClick?: (config: IMenuAggregationClickConfig) => void;
    getExecutionDefinition?: () => IExecutionDefinition;
    getDataView?: () => DataViewFacade;
    getColumnTotals?: () => ITotal[];
    intl?: IntlShape;
}

export interface IHeaderCellProps extends ICommonHeaderParams {
    displayText: string;
    className?: string;
    enableSorting?: boolean;
    defaultSortDirection?: SortDirection;
    menuPosition?: AlignPositions;
    textAlign?: AlignPositions;
    sortDirection?: SortDirection;
    onSortClick?: (direction: SortDirection) => void;
    menu?: IMenu;
    colId?: string;
}

export interface IHeaderCellState {
    isMenuOpen: boolean;
    isMenuButtonVisible: boolean;
    currentSortDirection: SortDirection;
}

export default class HeaderCell extends React.Component<IHeaderCellProps, IHeaderCellState> {
    public static defaultProps: Partial<IHeaderCellProps> = {
        sortDirection: null,
        textAlign: ALIGN_LEFT,
        menuPosition: ALIGN_LEFT,
        defaultSortDirection: "desc",
        menu: null,
        enableSorting: false,
        onMenuAggregationClick: () => null,
        onSortClick: () => null,
    };

    public state: IHeaderCellState = {
        isMenuOpen: false,
        isMenuButtonVisible: false,
        currentSortDirection: null,
    };

    public componentDidMount(): void {
        this.setState({
            currentSortDirection: this.props.sortDirection,
        });
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IHeaderCellProps): void {
        if (nextProps.sortDirection !== this.props.sortDirection) {
            this.setState({
                currentSortDirection: this.props.sortDirection,
            });
        }
    }

    public render(): React.ReactNode {
        const { menuPosition, className } = this.props;

        return (
            <div
                className={cx(
                    "gd-pivot-table-header",
                    {
                        "gd-pivot-table-header--open": this.state.isMenuButtonVisible,
                    },
                    className,
                )}
                onMouseEnter={this.onMouseEnterHeaderCell}
                onMouseLeave={this.onMouseLeaveHeaderCell}
            >
                {menuPosition === "left" && this.renderMenu()}
                {this.renderText()}
                {menuPosition === "right" && this.renderMenu()}
            </div>
        );
    }

    private renderMenu() {
        const { intl, colId, menu, getExecutionDefinition, getDataView, getColumnTotals } = this.props;
        const { isMenuOpen, isMenuButtonVisible } = this.state;

        if (!menu || !menu.aggregations) {
            return null;
        }

        return (
            <AggregationsMenu
                intl={intl}
                colId={colId}
                isMenuOpened={isMenuOpen}
                isMenuButtonVisible={isMenuButtonVisible}
                showSubmenu={menu.aggregationsSubMenu}
                getExecutionDefinition={getExecutionDefinition}
                getDataView={getDataView}
                getTotals={getColumnTotals}
                onMenuOpenedChange={this.handleMenuOpenedChange}
                onAggregationSelect={this.menuItemClick}
            />
        );
    }

    private renderText() {
        const { displayText, textAlign, enableSorting } = this.props;

        const classes = cx("s-header-cell-label", "gd-pivot-table-header-label", {
            "gd-pivot-table-header-label--right": textAlign === "right",
            "gd-pivot-table-header-label--center": textAlign === "center",
            "gd-pivot-table-header-label--clickable": enableSorting,
        });

        return (
            <div
                className={classes}
                onClick={this.onTextClick}
                onMouseEnter={this.onMouseEnterHeaderCellText}
                onMouseLeave={this.onMouseLeaveHeaderCellText}
            >
                <span>{displayText ? displayText : ""}</span>
                {this.renderSorting()}
            </div>
        );
    }

    private renderSorting() {
        const { enableSorting } = this.props;
        const { currentSortDirection } = this.state;

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
    }

    private onMouseEnterHeaderCell = () => {
        this.showMenuButton();
    };

    private onMouseLeaveHeaderCell = () => {
        this.hideMenuButton();
    };

    private onMouseEnterHeaderCellText = () => {
        if (this.props.enableSorting) {
            const { sortDirection } = this.props;
            if (sortDirection === null) {
                return this.setState({
                    currentSortDirection: this.props.defaultSortDirection,
                });
            } else if (sortDirection === "asc") {
                return this.setState({
                    currentSortDirection: "desc",
                });
            } else if (sortDirection === "desc") {
                return this.setState({
                    currentSortDirection: "asc",
                });
            } else {
                return this.setState({
                    currentSortDirection: null,
                });
            }
        }
    };

    private onMouseLeaveHeaderCellText = () => {
        this.setState({
            currentSortDirection: this.props.sortDirection,
        });
    };

    private onTextClick = () => {
        const { sortDirection, onSortClick, enableSorting, defaultSortDirection } = this.props;

        if (!enableSorting) {
            return;
        }
        if (sortDirection === null) {
            const nextSortDirection = defaultSortDirection;
            this.setState({
                currentSortDirection: nextSortDirection,
            });
            onSortClick(nextSortDirection);
            return;
        }

        const nextSort = sortDirection === "asc" ? "desc" : "asc";
        this.setState({
            currentSortDirection: nextSort,
        });
        onSortClick(nextSort);
    };

    private showMenuButton = () => {
        if (this.state.isMenuOpen) {
            return;
        }

        this.setState({
            isMenuButtonVisible: true,
        });
    };

    private hideMenuButton = () => {
        if (this.state.isMenuOpen) {
            return;
        }

        this.setState({
            isMenuButtonVisible: false,
        });
    };

    private hideAndCloseMenu = () => {
        this.setState({
            isMenuButtonVisible: false,
            isMenuOpen: false,
        });
    };

    private menuItemClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        this.hideAndCloseMenu();
        if (this.props.onMenuAggregationClick) {
            this.props.onMenuAggregationClick(menuAggregationClickConfig);
        }
    };

    private handleMenuOpenedChange = ({ opened, source }: IOnOpenedChangeParams) => {
        this.setState({
            isMenuOpen: opened,
        });

        // When source is 'TOGGLER_BUTTON_CLICK' we do not want to hide menu
        // button visibility. Because user is hovering over this button
        // so we do not want to hide it.
        if (source === "OUTSIDE_CLICK" || source === "SCROLL") {
            this.setState({
                isMenuButtonVisible: false,
            });
        }
    };
}
