// (C) 2021 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import isEmpty from "lodash/isEmpty";

import { Overlay } from "../Overlay";

interface IHelpItem {
    key: string;
    href?: string;
    isActive?: boolean;
    className?: string;
    target?: string;
    onClick?: (obj: any) => void;
}

interface IHeaderHelpProps {
    className: string;
    items: IHelpItem[];
    onMenuItemClick?: (...args: any[]) => void;
    disableDropdown?: boolean;
    onHelpClicked?: (isOpen?: boolean) => void;
    helpRedirectUrl?: string;
}

export const HeaderHelp: React.FC<IHeaderHelpProps> = ({
    className,
    items,
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
                className={`gd-list-item ${item.className}`}
            >
                <FormattedMessage id={item.key} />
            </a>
        );
    });

    const toggleHelpMenu = (isMenuOpen = !isOpen) => {
        onHelpClicked && onHelpClicked(isMenuOpen);
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
                        align: "br tr",
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
