// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as classNames from 'classnames';
import { AFM } from '@gooddata/typings';
import HeaderMenu from './HeaderMenu';

export type AlignPositions = 'left' | 'right' | 'center';
export const ALIGN_LEFT = 'left';
export const ALIGN_RIGHT = 'right';

export interface IProps {
    displayText: string;
    enableMenu?: boolean;
    enableSorting?: boolean;
    defaultSortDirection?: AFM.SortDirection;
    menuPosition?: AlignPositions;
    textAlign?: AlignPositions;
    sortDirection?: AFM.SortDirection;
    onMenuClick?: () => void;
    onSortClick?: (direction: AFM.SortDirection) => void;
}

export interface IState {
    isMenuOpen: boolean;
    isMenuVisible: boolean;
    currentSortDirection: AFM.SortDirection;
}

export default class HeaderCell extends React.Component<IProps, IState> {
    public static defaultProps: Partial<IProps> = {
        sortDirection: null,
        textAlign: ALIGN_LEFT,
        menuPosition: ALIGN_LEFT,
        defaultSortDirection: 'desc',
        enableMenu: false,
        enableSorting: false,
        onMenuClick: () => null,
        onSortClick: () => null
    };

    public state: IState = {
        isMenuOpen: false,
        isMenuVisible: false,
        currentSortDirection: null
    };

    constructor(props: IProps) {
        super(props);
    }

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

    public onMenuClick = () => {
        if (this.state.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    public showMenu = () => {
        if (this.state.isMenuOpen) {
            return;
        }

        this.setState({
            isMenuVisible: true
        });
    }

    public hideMenu = () => {
        if (this.state.isMenuOpen) {
            return;
        }

        this.setState({
            isMenuVisible: false
        });
    }

    public openMenu = () => {
        this.setState({
            isMenuVisible: true,
            isMenuOpen: true
        });
    }

    public closeMenu = () => {
        this.setState({
            isMenuOpen: false
        });
    }

    public hideAndCloseMenu = () => {
        this.setState({
            isMenuVisible: false,
            isMenuOpen: false
        });
    }

    public renderMenu() {
        const { enableMenu } = this.props;

        return enableMenu ? (
            <HeaderMenu
              isOpen={this.state.isMenuOpen}
              isVisible={this.state.isMenuVisible}
              onClick={this.onMenuClick}
              onClickOutside={this.hideAndCloseMenu}
            />
          ) : null;
    }

    public onMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
        ev.preventDefault();
        this.showMenu();

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

    public onMouseLeave = () => {
        this.hideMenu();
        this.setState({
            currentSortDirection: this.props.sortDirection
        });
    }

    public onTextClick = (ev: React.MouseEvent<HTMLDivElement>) => {
        ev.preventDefault();
        if (this.props.sortDirection === null) {
            const nextSortDirection = this.props.defaultSortDirection;
            this.setState({
                currentSortDirection: nextSortDirection
            });
            this.props.onSortClick(nextSortDirection);
            return;
        }

        const nextSort = this.props.sortDirection === 'asc' ? 'desc' : 'asc';
        this.setState({
            currentSortDirection: nextSort
        });
        this.props.onSortClick(nextSort);
    }

    public renderSorting() {
        const { enableSorting } = this.props;
        const { currentSortDirection } = this.state;

        const sortClasses = classNames('s-sort-direction-arrow', {
            'gd-pivot-table-header-arrow-up': currentSortDirection === 'asc',
            'gd-pivot-table-header-arrow-down': currentSortDirection === 'desc'
        });

        return currentSortDirection && enableSorting && (
            <span className="gd-pivot-table-header-next-sort">
                <span className={sortClasses} />
            </span>
        );
    }

    public renderText() {
        const { displayText, textAlign, enableSorting } = this.props;

        const classes = classNames('s-header-cell-label', 'gd-pivot-table-header-label', {
            'gd-pivot-table-header-label--right': textAlign === 'right',
            'gd-pivot-table-header-label--center': textAlign === 'center',
            'gd-pivot-table-header-label--clickable': enableSorting
        });

        return (
            <div className={classes} onClick={this.onTextClick}>
                <span>{displayText}</span>
                {this.renderSorting()}
            </div>
        );
    }

    public render() {
        const { menuPosition } = this.props;

        return (
                <div
                    className={classNames(
                        'gd-pivot-table-header',
                        {
                            'gd-pivot-table-header--open': this.state.isMenuOpen
                        }
                    )}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                >
                    {menuPosition === 'left' && this.renderMenu()}
                    {this.renderText()}
                    {menuPosition === 'right' && this.renderMenu()}
                </div>
        );
    }
}
