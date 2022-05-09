// (C) 2021-2022 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage, injectIntl, IntlShape } from "react-intl";
import cx from "classnames";
import isEmpty from "lodash/isEmpty";

import { Overlay } from "../Overlay";
import { HelpMenuDropdownAlignPoints } from "../typings/positioning";

interface IHelpItem {
    key: string;
    href?: string;
    isActive?: boolean;
    className?: string;
    target?: string;
    iconName?: string;
    onClick?: (obj: any) => void;
}

interface IHeaderHelpProps {
    intl: IntlShape;
    className: string;
    helpMenuDropdownAlignPoints?: HelpMenuDropdownAlignPoints;
    items: IHelpItem[];
    onMenuItemClick?: (...args: any[]) => void;
    disableDropdown?: boolean;
    onHelpClicked?: (isOpen?: boolean) => void;
    helpRedirectUrl?: string;
}

export const CoreHeaderHelp: React.FC<IHeaderHelpProps> = ({
    className,
    items,
    helpMenuDropdownAlignPoints,
    onMenuItemClick,
    disableDropdown,
    onHelpClicked,
    helpRedirectUrl,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const classNames = cx({
        "gd-header-help": true,
        "gd-icon-header-help": true,
        "is-open": isOpen && !helpRedirectUrl,
        "anchor-tag-header-help": !isEmpty(helpRedirectUrl),
        [className]: !!className,
    });

    const menuItems = items.map((item) => {
        return (
            <a
                key={item.key}
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
                onClick={() => {
                    menuItemClicked(item);
                }}
                className={`gd-list-item gd-list-help-menu-item ${item.className}`}
            >
                {item.iconName && <i className={cx(item.iconName, "gd-icon")} />}
                <span>
                    <FormattedMessage id={item.key} />
                </span>
            </a>
        );
    });

    const toggleHelpMenu = (isMenuOpen = !isOpen) => {
        onHelpClicked?.(isMenuOpen);
        setIsOpen(isMenuOpen);
    };

    const menuItemClicked = (...args: any[]) => {
        toggleHelpMenu(false);
        onMenuItemClick(...args);
    };

    const renderHelpMenu = () => {
        return isOpen ? (
            <Overlay
                alignTo=".gd-header-help"
                alignPoints={[
                    {
                        align: helpMenuDropdownAlignPoints || "br tr",
                    },
                ]}
                closeOnOutsideClick
                closeOnMouseDrag
                closeOnParentScroll
                onClose={() => {
                    toggleHelpMenu(false);
                }}
            >
                {!disableDropdown ? (
                    <div className="gd-dialog gd-dropdown overlay gd-header-help-dropdown">
                        <div className="gd-list small">{menuItems}</div>
                    </div>
                ) : null}
            </Overlay>
        ) : (
            false
        );
    };

    return helpRedirectUrl ? (
        <a className={classNames} href={helpRedirectUrl} target="_blank" rel="noreferrer noopener">
            <FormattedMessage id="gs.header.help" />
        </a>
    ) : (
        <div className={classNames} onClick={() => toggleHelpMenu()}>
            <FormattedMessage id="gs.header.help" />
            {renderHelpMenu()}
        </div>
    );
};

export const HeaderHelp = injectIntl(CoreHeaderHelp);
