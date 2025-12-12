// (C) 2007-2025 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, useCallback, useRef, useState } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { type IHeaderAccountProps, type IHeaderMenuItem } from "./typings.js";
import { UiFocusManager } from "../@ui/UiFocusManager/UiFocusManager.js";
import { Button } from "../Button/index.js";
import { Overlay } from "../Overlay/index.js";
import { isActionKey } from "../utils/events.js";
import { useIdPrefixed } from "../utils/useId.js";

export function HeaderAccount({
    className = "",
    items = [],
    userName = "",
    onMenuItemClick,
}: IHeaderAccountProps) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const intl = useIntl();
    const dropdownId = useIdPrefixed("account-dropdown");

    const classNames = cx("gd-header-button", {
        "gd-header-account": true,
        "is-open": isOpen,
        [className]: !!className,
    });

    const toggleAccountMenu = useCallback(
        (newIsOpen = !isOpen): void => {
            setIsOpen(newIsOpen);
        },
        [isOpen],
    );

    const toggleAccountMenuHandler = useCallback((): void => {
        toggleAccountMenu();
    }, [toggleAccountMenu]);

    const getMenuItems = () => {
        return items.map((item) => {
            return (
                <MenuItem
                    key={item.key}
                    item={item}
                    toggleMenu={toggleAccountMenu}
                    onMenuItemClick={onMenuItemClick}
                />
            );
        });
    };

    const renderAccountMenu = (): ReactNode => {
        return isOpen ? (
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
                closeOnEscape
                onClose={() => {
                    toggleAccountMenu(false);
                }}
            >
                <div className="gd-dialog gd-dropdown overlay gd-header-account-dropdown" id={dropdownId}>
                    <div className="gd-list small">
                        <UiFocusManager
                            enableAutofocus
                            enableFocusTrap
                            enableReturnFocusOnUnmount={{ returnFocusTo: buttonRef }}
                        >
                            {getMenuItems()}
                        </UiFocusManager>
                    </div>
                </div>
            </Overlay>
        ) : (
            false
        );
    };

    return (
        <Button
            ref={buttonRef}
            className={classNames}
            onClick={toggleAccountMenuHandler}
            title={intl.formatMessage({ id: "gs.header.account.title" })}
            accessibilityConfig={{
                isExpanded: isOpen,
                popupId: dropdownId,
            }}
        >
            <span className="gd-header-account-icon gd-icon-user" />
            <span className="gd-header-account-user">{userName}</span>
            {renderAccountMenu()}
        </Button>
    );
}

function MenuItem({
    item,
    toggleMenu,
    onMenuItemClick,
}: {
    item: IHeaderMenuItem;
    toggleMenu: (isOpen: boolean) => void;
    onMenuItemClick: (item: IHeaderMenuItem, e: MouseEvent<HTMLAnchorElement> | KeyboardEvent) => void;
}) {
    const tabIndexProp = item.href ? {} : { tabIndex: 0 };

    const handleClick = useCallback(
        (e: MouseEvent<HTMLAnchorElement>): void => {
            toggleMenu(false);
            onMenuItemClick(item, e);
        },
        [item, toggleMenu, onMenuItemClick],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent): void => {
            if (isActionKey(e)) {
                e.preventDefault();
                toggleMenu(false);
                onMenuItemClick(item, e);
            }
        },
        [item, toggleMenu, onMenuItemClick],
    );

    return (
        <a
            href={item.href}
            onClick={handleClick}
            className={`gd-list-item ${item.className}`}
            onKeyDown={handleKeyDown}
            {...tabIndexProp}
        >
            <FormattedMessage id={item.key} />
        </a>
    );
}
