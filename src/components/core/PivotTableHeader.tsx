// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as classNames from 'classnames';
import { IHeaderParams } from 'ag-grid';
import { MEASURE_COLUMN } from '../../helpers/agGrid';
import { IHeaderReactComp } from 'ag-grid-react/lib/interfaces';

export interface IPivotHeaderState {
    isMenuOpen: boolean;
    sorting?: string;
}

const ASC = 'ASCENDING';
const DESC = 'DESCENDING';

const sortingMap = {
    [ASC]: <span className="gd-pivot-table-header-arrow-up" />,
    [DESC]: <span className="gd-pivot-table-header-arrow-down" />
};

export const getNextSorting = (sorting: string) => {
    return (sorting === ASC && DESC)
        || (sorting === null && ASC)
        || null;
};

export const getSorting = (column: any) => {
    return (column.isSortAscending() && ASC)
        || (column.isSortDescending() && DESC)
        || null;
};

class PivotHeader extends React.Component<IHeaderParams, IPivotHeaderState> implements IHeaderReactComp {
    public static propTypes = {
        enableMenu: PropTypes.bool,
        enableSorting: PropTypes.bool,
        displayName: PropTypes.string,
        column: PropTypes.any,
        reactContainer: PropTypes.any,
        showColumnMenu: PropTypes.func,
        setSort: PropTypes.func
    };

    constructor(props: IHeaderParams) {
        super(props);
        this.state = {
            sorting: null,
            isMenuOpen: false
        };
        this.onSortChanged = this.onSortChanged.bind(this);
        props.column.addEventListener('sortChanged', this.onSortChanged);
    }

    public componentDidMount() {
        this.onSortChanged();
    }

    public componentWillUnmount() {
        this.props.column.removeEventListener('sortChanged', this.onSortChanged);
    }

    public render() {
        const { column, displayName, enableSorting } = this.props;
        const { isMenuOpen } = this.state;
        const menu = (this.props.enableMenu) ? (
            <div className="gd-pivot-table-header-menu" onClick={this.onMenuClick}>
                <svg width="16" height="16" >
                    <g transform="translate(4 3)" >
                        <path d="M0 0h8v2H0V0zm0 4h8v2H0V4zm0 4h8v2H0V8z" fill="currentColor"/>
                    </g>
                </svg>
            </div>
        ) : null;
        const sorting = getSorting(column);
        const nextSorting = getNextSorting(sorting);
        const sortElement = (sorting && enableSorting) ? (
            <span className="gd-pivot-table-header-sort" >{sortingMap[sorting]}</span>
        ) : null;
        const nextSortElement = (nextSorting && enableSorting) ? (
            <span className="gd-pivot-table-header-next-sort" >{sortingMap[nextSorting]}</span>
        ) : null;
        return (
            <div
                className={classNames(
                    'gd-pivot-table-header',
                    isMenuOpen ? 'gd-pivot-table-header--open' : null,
                    enableSorting ? 'gd-pivot-table-header--sorting-enabled' : null,
                    column.getColDef().type === MEASURE_COLUMN ? 'gd-pivot-table-header--numeric' : null
                )}
            >
                <div className="gd-pivot-table-header-label" onClick={this.onSortRequested}>
                    <span className="gd-pivot-table-header-label-text">{displayName}</span>
                    {sortElement}
                    {nextSortElement}
                </div>
                {menu}
            </div>
        );
    }

    public onSortChanged() {
        this.setState({
            sorting: getSorting(this.props.column)
        });
    }

    public onMenuClick = () => {
        this.toggleMenu();
    }

    public toggleMenu = (setTo: boolean = null) => {
        return this.setState({
            isMenuOpen: setTo !== null ? setTo : !this.state.isMenuOpen
        });
    }

    public onSortRequested(event: any) {
        const order = 'asc';
        const multiSort = event.shiftKey;
        this.props.setSort(order, multiSort);
    }
}

export default PivotHeader;
