// (C) 2021-2025 GoodData Corporation
import React, { useState, useRef, useCallback } from "react";
import { FormattedMessage, injectIntl, IntlShape } from "react-intl";
import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";

import { Overlay } from "../Overlay/index.js";
import { HelpMenuDropdownAlignPoints, IAlignPoint } from "../typings/positioning.js";
import { Button } from "../Button/index.js";
import { UiFocusTrap } from "../@ui/UiFocusTrap/UiFocusTrap.js";
import { useIdPrefixed } from "../utils/useId.js";

interface IHelpItem {
    key: string;
    href?: string;
    isActive?: boolean;
    className?: string;
    target?: string;
    iconName?: string;
    icon?: React.ReactNode;
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
    intl,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const helpMenuButtonRef = useRef<HTMLButtonElement>(null);

    const dropdownId = useIdPrefixed("help-dropdown");

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
                role="option"
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
                onClick={() => {
                    menuItemClicked(item);
                }}
                className={cx("gd-list-item gd-list-help-menu-item", { [item.className]: !!item.className })}
            >
                {item.iconName ? <i className={cx(item.iconName, "gd-icon")} /> : null}
                {item.icon ? item.icon : null}
                <span>
                    <FormattedMessage id={item.key} />
                </span>
            </a>
        );
    });

    const toggleHelpMenu = useCallback(
        (isMenuOpen = !isOpen) => {
            onHelpClicked?.(isMenuOpen);
            setIsOpen(isMenuOpen);
        },
        [isOpen, onHelpClicked],
    );

    const menuItemClicked = (...args: any[]) => {
        toggleHelpMenu(false);
        onMenuItemClick(...args);
    };

    /**
     * Menu dropdown content is long enough to make it max-width (240px),
     * so it should just switch alignment to bottom right corner of the Help button.
     */
    const getHelpDropdownAlignPoints = (): IAlignPoint[] => {
        const defaultAlignPoints = [
            {
                align: "br tr",
            },
        ];
        if (
            !helpMenuButtonRef.current ||
            !helpMenuDropdownAlignPoints ||
            helpMenuDropdownAlignPoints === "br tr" ||
            window.innerWidth - helpMenuButtonRef.current.offsetLeft < 240
        ) {
            return defaultAlignPoints;
        }

        return [
            {
                align: helpMenuDropdownAlignPoints,
            },
        ];
    };

    const renderHelpMenu = () => {
        return isOpen ? (
            <Overlay
                alignTo=".gd-header-help"
                alignPoints={getHelpDropdownAlignPoints()}
                closeOnOutsideClick
                closeOnMouseDrag
                closeOnParentScroll
                closeOnEscape
                onClose={() => {
                    toggleHelpMenu(false);
                }}
            >
                {!disableDropdown ? (
                    <UiFocusTrap returnFocusTo={helpMenuButtonRef} autofocusOnOpen={true}>
                        <div
                            id={dropdownId}
                            className="gd-dialog gd-dropdown overlay gd-header-help-dropdown"
                            role="listbox"
                            aria-label={intl.formatMessage({ id: "gs.header.help.label" })}
                        >
                            <div className="gd-list small">{menuItems}</div>
                        </div>
                    </UiFocusTrap>
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
        <Button
            className={cx(classNames, "gd-header-button")}
            onClick={() => toggleHelpMenu()}
            accessibilityConfig={{
                isExpanded: isOpen,
                popupId: dropdownId,
            }}
            ref={helpMenuButtonRef}
        >
            <FormattedMessage id="gs.header.help" />
            {renderHelpMenu()}
        </Button>
    );
};

export const HeaderHelp = injectIntl(CoreHeaderHelp);
