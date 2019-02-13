// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as classNames from 'classnames';
import { AFM, Execution } from '@gooddata/typings';
import { IMenu, IMenuAggregationClickConfig } from '../../../interfaces/PivotTable';

import { ItemsWrapper, Header, Item } from '@gooddata/goodstrap/lib/List/MenuList';
import Menu from '../../menu/Menu';
import { IOnOpenedChangeParams } from '../../menu/MenuSharedTypes';
import { getParsedFields } from '../../../helpers/agGrid';
import { AVAILABLE_TOTALS as renderedTotalTypesOrder } from '../../visualizations/table/totals/utils';

export type AlignPositions = 'left' | 'right' | 'center';
export const ALIGN_LEFT = 'left';
export const ALIGN_RIGHT = 'right';

export interface IProps {
    displayText: string;
    className?: string;
    enableSorting?: boolean;
    defaultSortDirection?: AFM.SortDirection;
    menuPosition?: AlignPositions;
    textAlign?: AlignPositions;
    sortDirection?: AFM.SortDirection;
    onSortClick?: (direction: AFM.SortDirection) => void;
    onMenuAggregationClick?: (config: IMenuAggregationClickConfig) => void;
    menu?: IMenu;
    getExecutionResponse?: () => Execution.IExecutionResponse;
    getColumnTotals?: () => AFM.ITotalItem[];
    colId?: string;
    intl?: ReactIntl.InjectedIntl;
}

export interface IState {
    isMenuOpen: boolean;
    isMenuButtonVisible: boolean;
    currentSortDirection: AFM.SortDirection;
}

export default class HeaderCell extends React.Component<IProps, IState> {
    public static defaultProps: Partial<IProps> = {
        sortDirection: null,
        textAlign: ALIGN_LEFT,
        menuPosition: ALIGN_LEFT,
        defaultSortDirection: 'desc',
        menu: null,
        enableSorting: false,
        onMenuAggregationClick: () => null,
        onSortClick: () => null
    };

    public state: IState = {
        isMenuOpen: false,
        isMenuButtonVisible: false,
        currentSortDirection: null
    };

    public componentDidMount() {
        this.setState({
            currentSortDirection: this.props.sortDirection
        });
    }

    public componentWillReceiveProps(nextProps: IProps) {
        if (nextProps.sortDirection !== this.props.sortDirection) {
            this.setState({
                currentSortDirection: this.props.sortDirection
            });
        }
    }

    public render() {
        const { menuPosition, className } = this.props;

        return (
            <div
                className={classNames(
                    'gd-pivot-table-header',
                    {
                        'gd-pivot-table-header--open': this.state.isMenuButtonVisible
                    },
                    className
                )}
                onMouseEnter={this.onMouseEnterHeaderCell}
                onMouseLeave={this.onMouseLeaveHeaderCell}
            >
                {menuPosition === 'left' && this.renderMenu()}
                {this.renderText()}
                {menuPosition === 'right' && this.renderMenu()}
            </div>
        );
    }

    private renderMenu() {
        if (!this.props.menu || !this.props.menu.aggregations) {
            return null;
        }

        // Because of Ag-grid react wrapper does not rerender the component when we pass
        // new gridOptions we need to pull the data manually on each render
        const executionResponse: Execution.IExecutionResponse = this.props.getExecutionResponse();
        if (!executionResponse) {
            return null;
        }

        const rowAttributeHeaders = executionResponse.dimensions[0].headers as Execution.IAttributeHeader[];
        const isOneRowTable = rowAttributeHeaders.length === 0;
        if (isOneRowTable) {
            return null;
        }

        const dimensionHeader = executionResponse.dimensions[1].headers;
        if (!dimensionHeader) {
            return null;
        }

        const measureGroupHeader = dimensionHeader[dimensionHeader.length - 1] as Execution.IMeasureGroupHeader;
        if (!measureGroupHeader || !Execution.isMeasureGroupHeader(measureGroupHeader)) {
            return null;
        }

        const fields = getParsedFields(this.props.colId);
        const [lastFieldType, lastFieldId, lastFieldValudId = null] = fields[fields.length - 1];
        const columnTotals = this.props.getColumnTotals() || [];
        const measureGroupHeaderItems = measureGroupHeader.measureGroupHeader.items;

        let turnedOnTotals: AFM.TotalType[] = [];
        let localIdentifiers: string[] = [];
        if (lastFieldType === 'm') {
            const headerItemData: Execution.IMeasureHeaderItem['measureHeaderItem'] =
                measureGroupHeaderItems[lastFieldId].measureHeaderItem;

            const localIdentifier = headerItemData.localIdentifier;

            localIdentifiers = [localIdentifier];
            turnedOnTotals = columnTotals
                .filter(totalItem => totalItem.measureIdentifier === localIdentifier)
                .map(totalItem => totalItem.type) as AFM.TotalType[];
        } else if (lastFieldType === 'a') {
            const isColumnAttribute = lastFieldValudId === null;
            if (isColumnAttribute) {
                return null;
            }

            localIdentifiers = measureGroupHeaderItems.map(i => i.measureHeaderItem.localIdentifier);
            turnedOnTotals = renderedTotalTypesOrder
                .filter((type) => {
                    // Show checkmark for attribute aggregation only if all measure
                    // locale identifiers have turned on aggregation
                    const columnTotalsLength = columnTotals.filter((total: any) => total.type === type).length;
                    return columnTotalsLength === localIdentifiers.length;
                });
        }

        if (localIdentifiers.length === 0) {
            return null;
        }

        const menuItems = renderedTotalTypesOrder.map((type) => {
            const checked = turnedOnTotals.includes(type);

            return (
                <div
                    className={'s-menu-aggregation-' + type}
                    key={type}
                >
                    <Item
                        // Performance impact of this lambda is negligible
                        // tslint:disable-next-line: jsx-no-lambda
                        onClick={() => this.menuItemClick({
                            type,
                            measureIdentifiers: localIdentifiers,
                            attributeIdentifier: rowAttributeHeaders[0].attributeHeader.localIdentifier,
                            include: !checked
                        })}
                        checked={checked}
                    >
                        {this.props.intl.formatMessage({ id: `visualizations.totals.dropdown.title.${type}` })}
                    </Item>
                </div>
            );
        });

        return (
            <Menu
                toggler={
                    <svg className="menu-icon">
                        <g transform="translate(4 3)">
                            <path d="M0 0h8v2H0V0zm0 4h8v2H0V4zm0 4h8v2H0V8z" fill="currentColor" />
                        </g>
                    </svg>
                }
                togglerWrapperClassName={classNames('s-table-header-menu', 'gd-pivot-table-header-menu', {
                    'gd-pivot-table-header-menu--show': this.state.isMenuButtonVisible,
                    'gd-pivot-table-header-menu--hide': !this.state.isMenuButtonVisible,
                    'gd-pivot-table-header-menu--open': this.state.isMenuOpen
                })}
                opened={this.state.isMenuOpen}
                onOpenedChange={this.handleMenuOpenedChange}
            >
                <ItemsWrapper>
                    <div className="s-table-header-menu-content">
                        <Header>{this.props.intl.formatMessage({ id: 'visualizations.menu.aggregations' })}</Header>

                        {menuItems}
                    </div>
                </ItemsWrapper>
            </Menu>
        );
    }

    private renderText() {
        const { displayText, textAlign, enableSorting } = this.props;

        const classes = classNames('s-header-cell-label', 'gd-pivot-table-header-label', {
            'gd-pivot-table-header-label--right': textAlign === 'right',
            'gd-pivot-table-header-label--center': textAlign === 'center',
            'gd-pivot-table-header-label--clickable': enableSorting
        });

        return (
            <div
                className={classes}
                onClick={this.onTextClick}
                onMouseEnter={this.onMouseEnterHeaderCellText}
                onMouseLeave={this.onMouseLeaveHeaderCellText}
            >
                <span>{displayText ? displayText : ''}</span>
                {this.renderSorting()}
            </div>
        );
    }

    private renderSorting() {
        const { enableSorting } = this.props;
        const { currentSortDirection } = this.state;

        const sortClasses = classNames('s-sort-direction-arrow', `s-sorted-${currentSortDirection}`, {
            'gd-pivot-table-header-arrow-up': currentSortDirection === 'asc',
            'gd-pivot-table-header-arrow-down': currentSortDirection === 'desc'
        });

        return currentSortDirection && enableSorting && (
            <span className="gd-pivot-table-header-next-sort">
                <span className={sortClasses} />
            </span>
        );
    }

    private onMouseEnterHeaderCell = () => {
        this.showMenuButton();
    }

    private onMouseLeaveHeaderCell = () => {
        this.hideMenuButton();
    }

    private onMouseEnterHeaderCellText = () => {
        if (this.props.enableSorting) {
            const { sortDirection } = this.props;
            if (sortDirection === null) {
                return this.setState({
                    currentSortDirection: this.props.defaultSortDirection
                });
            } else if (sortDirection === 'asc') {
                return this.setState({
                    currentSortDirection: 'desc'
                });
            } else if (sortDirection === 'desc') {
                return this.setState({
                    currentSortDirection: 'asc'
                });
            } else {
                return this.setState({
                    currentSortDirection: null
                });
            }
        }
    }

    private onMouseLeaveHeaderCellText = () => {
        this.setState({
            currentSortDirection: this.props.sortDirection
        });
    }

    private onTextClick = () => {
        const { sortDirection, onSortClick, enableSorting, defaultSortDirection } = this.props;

        if (!enableSorting) {
            return;
        }
        if (sortDirection === null) {
            const nextSortDirection = defaultSortDirection;
            this.setState({
                currentSortDirection: nextSortDirection
            });
            onSortClick(nextSortDirection);
            return;
        }

        const nextSort = sortDirection === 'asc' ? 'desc' : 'asc';
        this.setState({
            currentSortDirection: nextSort
        });
        onSortClick(nextSort);
    }

    private showMenuButton = () => {
        if (this.state.isMenuOpen) {
            return;
        }

        this.setState({
            isMenuButtonVisible: true
        });
    }

    private hideMenuButton = () => {
        if (this.state.isMenuOpen) {
            return;
        }

        this.setState({
            isMenuButtonVisible: false
        });
    }

    private hideAndCloseMenu = () => {
        this.setState({
            isMenuButtonVisible: false,
            isMenuOpen: false
        });
    }

    private menuItemClick = (menuAggregationClickConfig: IMenuAggregationClickConfig) => {
        this.hideAndCloseMenu();
        if (this.props.onMenuAggregationClick) {
            this.props.onMenuAggregationClick(menuAggregationClickConfig);
        }
    }

    private handleMenuOpenedChange = ({ opened, source }: IOnOpenedChangeParams) => {
        this.setState({
            isMenuOpen: opened
        });

        // When source is 'TOGGLER_BUTTON_CLICK' we do not want to hide menu
        // button visibility. Because user is hovering over this button
        // so we do not want to hide it.
        if (source === 'OUTSIDE_CLICK' || source === 'SCROLL') {
            this.setState({
                isMenuButtonVisible: false
            });
        }
    }
}
