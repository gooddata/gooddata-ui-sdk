// (C) 2007-2025 GoodData Corporation
import React, { PureComponent, ReactNode } from "react";
import { injectIntl, FormattedMessage, WrappedComponentProps } from "react-intl";
import { v4 as uuid } from "uuid";
import identity from "lodash/identity.js";
import cx from "classnames";

import { IHeaderMenuProps, IHeaderMenuItem } from "./typings.js";

class WrappedHeaderMenu extends PureComponent<IHeaderMenuProps & WrappedComponentProps> {
    static defaultProps: Pick<IHeaderMenuProps, "className" | "onMenuItemClick" | "sections"> = {
        className: "",
        onMenuItemClick: identity,
        sections: [],
    };

    getClassNames(): string {
        return cx("gd-header-menu", this.props.className);
    }

    renderSection(items: IHeaderMenuItem[]): ReactNode {
        return items.map((item) => {
            const clickHandler = item.onClick
                ? item.onClick
                : (event: React.MouseEvent) => this.props.onMenuItemClick(item, event);

            const classNames = cx("gd-header-menu-item gd-list-help-menu-item", {
                active: item.isActive,
                [item.className]: !!item.className,
            });

            return (
                <a
                    key={item.key}
                    onClick={clickHandler} // eslint-disable-line react/jsx-no-bind
                    href={item.href}
                    className={classNames}
                    target={item.target}
                    rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
                >
                    {item.icon ? item.icon : null}
                    {item.iconName ? <i className={cx(item.iconName, "gd-icon")} /> : null}
                    <span className={item.className}>
                        <FormattedMessage id={item.key} />
                    </span>
                </a>
            );
        });
    }

    renderSections(): ReactNode {
        return this.props.sections.map((items) => {
            return (
                <nav
                    aria-label={this.props.intl.formatMessage({ id: "gs.header.menu.accessibility.label" })}
                    key={`section-${uuid()}`}
                    className="gd-header-menu-section gd-header-measure"
                >
                    {this.renderSection(items)}
                </nav>
            );
        });
    }

    render(): ReactNode {
        return <div className={this.getClassNames()}>{this.renderSections()}</div>;
    }
}

export const HeaderMenu = injectIntl(WrappedHeaderMenu);
