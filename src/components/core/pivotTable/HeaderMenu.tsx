// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as classNames from 'classnames';
import { noop } from 'lodash';

export interface IProps {
    isOpen: boolean;
    isVisible: boolean;
    onClick?: () => void;
    onClickOutside?: () => void;
}

class HeaderMenu extends React.Component<IProps> {
    public static defaultProps: Partial<IProps> = {
        onClick: noop,
        onClickOutside: noop
    };

    private buttonNode: HTMLDivElement = null;

    public componentWillReceiveProps(nextProps: IProps) {
        if (nextProps.isOpen && !this.props.isOpen) {
            document.addEventListener('mousedown', this.handleClick, false);
        }
    }

    public componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false);
    }

    public handleClick = (ev: any) => {
        if (this.buttonNode.contains(ev.target)) {
            return;
        }

        this.props.onClickOutside();
    }

    public onMenuClick = () => {
        this.props.onClick();
    }

    public renderDropdown() {
        return (
            <div className="dropdown" style={{ position: 'absolute', bottom: 0, left: 0, width: 250 }} />
        );
    }

    public render() {
        const { isOpen, isVisible } = this.props;

        const classes = classNames('s-table-header-menu', 'gd-pivot-table-header-menu', {
            'gd-pivot-table-header-menu--show': (isVisible || isOpen),
            'gd-pivot-table-header-menu--hide': !(isVisible || isOpen)
        });

        return (
            <div className={classes} onClick={this.onMenuClick} ref={node => this.buttonNode = node}>
                <svg className="menu-icon">
                    <g transform="translate(4 3)" >
                        <path d="M0 0h8v2H0V0zm0 4h8v2H0V4zm0 4h8v2H0V8z" fill="currentColor"/>
                    </g>
                </svg>
            </div>
        );
    }
}

export default HeaderMenu;
