// (C) 2007-2025 GoodData Corporation
import React, { useState, useRef, ReactNode, useCallback } from "react";
import cx from "classnames";
import { useIntl, FormattedMessage } from "react-intl";

import { Overlay } from "../Overlay/index.js";
import { Button } from "../Button/index.js";

import { IHeaderMenuItem, IHeaderAccountProps } from "./typings.js";
import { UiFocusTrap } from "../@ui/UiFocusTrap/UiFocusTrap.js";
import { useId } from "../utils/useId.js";

export const HeaderAccount: React.FC<IHeaderAccountProps> = ({
    className = "",
    items = [],
    userName = "",
    onMenuItemClick,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const intl = useIntl();
    const id = useId();
    const dropdownId = `account-dropdown-${id}`;

    const getClassNames = (): string => {
        return cx("gd-header-button", {
            "gd-header-account": true,
            "is-open": isOpen,
            [className]: !!className,
        });
    };

    const toggleAccountMenu = useCallback(
        (newIsOpen = !isOpen): void => {
            setIsOpen(newIsOpen);
        },
        [isOpen],
    );

    const toggleAccountMenuHandler = useCallback((): void => {
        toggleAccountMenu();
    }, [toggleAccountMenu]);

    const menuItemClicked = useCallback(
        (item: IHeaderMenuItem, e: React.MouseEvent<HTMLAnchorElement>): void => {
            toggleAccountMenu(false);
            onMenuItemClick(item, e);
        },
        [toggleAccountMenu, onMenuItemClick],
    );

    const getMenuItems = () => {
        return items.map((item) => {
            const tabIndexProp = item.href ? {} : { tabIndex: 0 };
            return (
                <a
                    key={item.key}
                    href={item.href}
                    onClick={(e) => {
                        menuItemClicked(item, e);
                    }}
                    className={`gd-list-item ${item.className}`}
                    {...tabIndexProp}
                >
                    <FormattedMessage id={item.key} />
                </a>
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
                        <UiFocusTrap returnFocusTo={buttonRef.current}>{getMenuItems()}</UiFocusTrap>
                    </div>
                </div>
            </Overlay>
        ) : (
            false
        );
    };

    return (
        <Button
            buttonRef={buttonRef}
            className={getClassNames()}
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
};
