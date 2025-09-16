// (C) 2007-2025 GoodData Corporation

import { MouseEvent, ReactNode, memo, useCallback, useMemo } from "react";

import cx from "classnames";
import identity from "lodash/identity.js";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { IHeaderMenuItem, IHeaderMenuProps } from "./typings.js";

function WrappedHeaderMenu(props: IHeaderMenuProps & WrappedComponentProps): ReactNode {
    const { className = "", onMenuItemClick = identity, sections = [], intl } = props;

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
                    [item.className]: !!item.className,
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
}

export const HeaderMenu = memo(injectIntl(WrappedHeaderMenu));
