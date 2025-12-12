// (C) 2007-2025 GoodData Corporation

import { type MouseEvent, type ReactNode, memo, useCallback, useMemo } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { type IHeaderMenuItem, type IHeaderMenuProps } from "./typings.js";

export const HeaderMenu = memo(function HeaderMenu({
    className = "",
    onMenuItemClick = (v) => v,
    sections = [],
}: IHeaderMenuProps): ReactNode {
    const intl = useIntl();
    const classNames = useMemo(() => cx("gd-header-menu", className), [className]);

    const ariaLabel = useMemo(() => intl.formatMessage({ id: "gs.header.menu.accessibility.label" }), [intl]);

    const handleItemClick = useCallback(
        (item: IHeaderMenuItem) => {
            return item.onClick ? item.onClick : (event: MouseEvent) => onMenuItemClick(item, event);
        },
        [onMenuItemClick],
    );

    const renderSection = useCallback(
        (items: IHeaderMenuItem[]): ReactNode => {
            return items.map((item) => {
                const clickHandler = handleItemClick(item);

                const itemClassNames = cx("gd-header-menu-item gd-list-help-menu-item", {
                    active: item.isActive,
                    [item.className as string]: !!item.className,
                });

                return (
                    <a
                        key={item.key}
                        onClick={clickHandler}
                        href={item.href}
                        className={itemClassNames}
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
        },
        [handleItemClick],
    );

    const renderSections = useCallback((): ReactNode => {
        return sections.map((items) => {
            return (
                <nav
                    aria-label={ariaLabel}
                    key={`section-${uuid()}`}
                    className="gd-header-menu-section gd-header-measure"
                >
                    {renderSection(items)}
                </nav>
            );
        });
    }, [sections, ariaLabel, renderSection]);

    return <div className={classNames}>{renderSections()}</div>;
});
