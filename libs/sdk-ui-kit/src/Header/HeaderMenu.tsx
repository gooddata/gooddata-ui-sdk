// (C) 2007-2025 GoodData Corporation
import React, { memo, ReactNode } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";
import identity from "lodash/identity.js";
import cx from "classnames";

import { IHeaderMenuProps, IHeaderMenuItem } from "./typings.js";

export const HeaderMenu = memo(function HeaderMenu({
    className = "",
    onMenuItemClick = identity,
    sections = [],
}: IHeaderMenuProps): ReactNode {
    const intl = useIntl();

    function getClassNames(): string {
        return cx("gd-header-menu", className);
    }

    function renderSection(items: IHeaderMenuItem[]): ReactNode {
        return items.map((item) => {
            const clickHandler = item.onClick
                ? item.onClick
                : (event: React.MouseEvent) => onMenuItemClick(item, event);

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

    function renderSections(): ReactNode {
        return sections.map((items) => {
            return (
                <nav
                    aria-label={intl.formatMessage({ id: "gs.header.menu.accessibility.label" })}
                    key={`section-${uuid()}`}
                    className="gd-header-menu-section gd-header-measure"
                >
                    {renderSection(items)}
                </nav>
            );
        });
    }

    return <div className={getClassNames()}>{renderSections()}</div>;
});
