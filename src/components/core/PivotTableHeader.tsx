// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as classNames from 'classnames';
import { IHeaderParams } from 'ag-grid';
import { MEASURE_COLUMN, FIELD_SEPARATOR, ROW_ATTRIBUTE_COLUMN } from '../../helpers/agGrid';
import { IHeaderReactComp } from 'ag-grid-react/lib/interfaces';
import { AFM } from '@gooddata/typings';

export interface IPivotHeaderState {
    isMenuOpen: boolean;
    sorting?: string;
}

export const ASC = 'asc';
export const DESC = 'desc';

const sortingMap = {
    [ASC]: <span className="gd-pivot-table-header-arrow-up" />,
    [DESC]: <span className="gd-pivot-table-header-arrow-down" />
};

export const getSorting = (column: any): AFM.SortDirection => {
    const direction = (column.isSortAscending() && ASC)
        || (column.isSortDescending() && DESC)
        || null;
    return direction;
};

export const getNextSorting = (column: any, sortingCanBeRemoved = false) => {
    const sorting: string = getSorting(column);
    // attributes are sorted null > ASC > DESC > null
    if (column.getColId().split(FIELD_SEPARATOR).reverse()[0].slice(0, 2) === 'a_') {
        return (sorting === null && ASC) // default
            || (sorting === ASC && DESC) // invert
            || (sortingCanBeRemoved ? null : ASC); // reset
    }
    // measures are sorted null > DESC > ASC > null
    return (sorting === null && DESC) // default
            || (sorting === DESC && ASC) // invert
            || (sortingCanBeRemoved ? null : DESC); // reset
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
        const nextSorting = getNextSorting(column);
        const isValidSortingHeader = column.getColDef().type === MEASURE_COLUMN
            || column.getColDef().type === ROW_ATTRIBUTE_COLUMN;

        const sortElement = (sorting && enableSorting && isValidSortingHeader) ? (
            <span className="gd-pivot-table-header-sort" >{sortingMap[sorting]}</span>
        ) : null;
        const nextSortElement = (nextSorting && enableSorting && isValidSortingHeader) ? (
            <span className="gd-pivot-table-header-next-sort" >{sortingMap[nextSorting]}</span>
        ) : null;
        const onClickProp = isValidSortingHeader ? { onClick: this.onSortRequested } : {};
        return (
            <div
                className={classNames(
                    'gd-pivot-table-header',
                    isMenuOpen ? 'gd-pivot-table-header--open' : null,
                    enableSorting && isValidSortingHeader ? 'gd-pivot-table-header--sorting-enabled' : null,
                    column.getColDef().type === MEASURE_COLUMN ? 'gd-pivot-table-header--numeric' : null
                )}
            >
                <div className="gd-pivot-table-header-label" {...onClickProp}>
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

    public onSortRequested = () => {
        const nextSorting = getNextSorting(this.props.column);
        const multiSort = false; // Enable support for multisort with CMD key with 'event.shiftKey';
        this.props.setSort(nextSorting, multiSort);
    }
}

export default PivotHeader;
