// (C) 2007-2021 GoodData Corporation
import React, { PureComponent, ReactNode } from "react";
import cx from "classnames";
import { injectIntl, FormattedMessage, WrappedComponentProps } from "react-intl";

import { Overlay } from "../Overlay/index.js";

import { IHeaderAccountState, IHeaderMenuItem, IHeaderAccountProps } from "./typings.js";

class WrappedHeaderAccount extends PureComponent<
    IHeaderAccountProps & WrappedComponentProps,
    IHeaderAccountState
> {
    static defaultProps: Pick<IHeaderAccountProps, "className" | "items" | "userName"> = {
        className: "",
        items: [],
        userName: "",
    };

    constructor(props: IHeaderAccountProps & WrappedComponentProps) {
        super(props);

        this.state = {
            isOpen: false,
        };
    }

    getClassNames(): string {
        return cx({
            "gd-header-account": true,
            "is-open": this.state.isOpen,
            [this.props.className]: !!this.props.className,
        });
    }

    getMenuItems() {
        return this.props.items.map((item) => {
            return (
                <a
                    key={item.key}
                    href={item.href}
                    onClick={(e) => {
                        this.menuItemClicked(item, e);
                    }}
                    className={`gd-list-item ${item.className}`}
                >
                    <FormattedMessage id={item.key} />
                </a>
            );
        });
    }

    toggleAccountMenu = (isOpen = !this.state.isOpen): void => {
        this.setState({
            isOpen,
        });
    };

    toggleAccountMenuHandler = (): void => {
        this.toggleAccountMenu();
    };

    menuItemClicked(item: IHeaderMenuItem, e: React.MouseEvent<HTMLAnchorElement>): void {
        this.toggleAccountMenu(false);
        this.props.onMenuItemClick(item, e);
    }

    renderAccountMenu(): ReactNode {
        return this.state.isOpen ? (
            <Overlay
                alignTo=".gd-header-account"
                alignPoints={[
                    {
                        align: "br tr",
                    },
                ]}
                closeOnOutsideClick
                closeOnMouseDrag
                closeOnParentScroll
                onClose={() => {
                    this.toggleAccountMenu(false);
                }}
            >
                <div className="gd-dialog gd-dropdown overlay gd-header-account-dropdown">
                    <div className="gd-list small">{this.getMenuItems()}</div>
                </div>
            </Overlay>
        ) : (
            false
        );
    }

    render(): ReactNode {
        return (
            <div className={this.getClassNames()} onClick={this.toggleAccountMenuHandler}>
                <span className="gd-header-account-icon gd-icon-user" />
                <span className="gd-header-account-user">{this.props.userName}</span>

                {this.renderAccountMenu()}
            </div>
        );
    }
}

export const HeaderAccount = injectIntl(WrappedHeaderAccount);
