// (C) 2007-2025 GoodData Corporation
import { FunctionComponent, ReactNode, MouseEvent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";
import identity from "lodash/identity.js";
import cx from "classnames";

import { IHeaderMenuProps, IHeaderMenuItem } from "./typings.js";

export const HeaderMenu: FunctionComponent<IHeaderMenuProps> = ({
    className = "",
    onMenuItemClick = identity,
    sections = [],
}) => {
    const intl = useIntl();

    const getClassNames = (): string => cx("gd-header-menu", className);

    const renderSection = (items: IHeaderMenuItem[]): ReactNode =>
        items.map((item) => {
            const clickHandler = item.onClick
                ? item.onClick
                : (event: MouseEvent) => onMenuItemClick(item, event);

            const classNames = cx("gd-header-menu-item gd-list-help-menu-item", {
                active: item.isActive,
                [item.className ?? ""]: !!item.className,
            });

            return (
                <a
                    key={item.key}
                    onClick={clickHandler}
                    href={item.href}
                    className={classNames}
                    target={item.target}
                    rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
                >
                    {item.icon ?? null}
                    {item.iconName ? <i className={cx(item.iconName, "gd-icon")} /> : null}
                    <span className={item.className}>
                        <FormattedMessage id={item.key} />
                    </span>
                </a>
            );
        });

    const renderSections = (): ReactNode =>
        sections.map((items) => (
            <nav
                aria-label={intl.formatMessage({ id: "gs.header.menu.accessibility.label" })}
                key={`section-${uuid()}`}
                className="gd-header-menu-section gd-header-measure"
            >
                {renderSection(items)}
            </nav>
        ));

    return <div className={getClassNames()}>{renderSections()}</div>;
};
