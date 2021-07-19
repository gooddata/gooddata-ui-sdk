// (C) 2021 GoodData Corporation
import React, { useState } from "react";
import { Button, SingleSelectListItem, ItemsWrapper, Overlay } from "@gooddata/sdk-ui-kit";

import { IMenuButtonProps } from "./types";
import { MenuButtonPropsProvider, useMenuButtonProps } from "./MenuButtonPropsContext";

/**
 * @internal
 */
export const DefaultMenuButtonInner = (): JSX.Element | null => {
    const { menuItems } = useMenuButtonProps();
    const [isOpen, setIsOpen] = useState(false);

    const onMenuButtonClick = () => {
        setIsOpen(!isOpen);
    };

    if (!menuItems.length) {
        // eslint-disable-next-line no-console
        console.warn(
            "DefaultMenuButton rendered without menu items. Make sure you are passing some items there.",
        );

        return null;
    }

    const renderMenuItems = () => {
        return (
            <Overlay
                key={"topBarMenuButton"}
                alignTo=".s-header-options-button"
                alignPoints={[{ align: "br tr" }]}
                className="gd-header-menu-overlay"
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                onClose={onMenuButtonClick}
            >
                <ItemsWrapper smallItemsSpacing>
                    {menuItems.map((menuItem) => {
                        return (
                            <SingleSelectListItem
                                className="gd-menu-item"
                                key={menuItem.itemId}
                                title={menuItem.itemName}
                                type={menuItem.type}
                                onClick={() => {
                                    menuItem.onClick?.();
                                    setIsOpen(false);
                                }}
                            />
                        );
                    })}
                </ItemsWrapper>
            </Overlay>
        );
    };

    return (
        <>
            <Button
                onClick={onMenuButtonClick}
                value="&#8943;"
                className={"gd-button-primary dash-header-options-button s-header-options-button gd-button"}
            />
            {isOpen && renderMenuItems()}
        </>
    );
};

/**
 * @alpha
 */
export const DefaultMenuButton = (props: IMenuButtonProps): JSX.Element => {
    return (
        <MenuButtonPropsProvider {...props}>
            <DefaultMenuButtonInner />
        </MenuButtonPropsProvider>
    );
};
