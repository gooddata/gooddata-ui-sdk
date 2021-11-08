// (C) 2021 GoodData Corporation
import React, { useCallback, useState } from "react";
import cx from "classnames";
import {
    Button,
    SingleSelectListItem,
    ItemsWrapper,
    Overlay,
    BubbleHoverTrigger,
    Bubble,
    IAlignPoint,
} from "@gooddata/sdk-ui-kit";

import { IMenuButtonProps } from "./types";
import { MenuButtonPropsProvider, useMenuButtonProps } from "./MenuButtonPropsContext";

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];
const bubbleAlignPoints: IAlignPoint[] = [{ align: "cl tr" }];

/**
 * @internal
 */
export const DefaultMenuButtonInner = (): JSX.Element | null => {
    const { menuItems } = useMenuButtonProps();
    const [isOpen, setIsOpen] = useState(false);

    const onMenuButtonClick = useCallback(() => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    }, []);

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
                alignPoints={overlayAlignPoints}
                className="gd-header-menu-overlay"
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                onClose={onMenuButtonClick}
            >
                <ItemsWrapper smallItemsSpacing>
                    {menuItems.map((menuItem) => {
                        if (menuItem.type === "separator") {
                            return <SingleSelectListItem key={menuItem.itemId} type={menuItem.type} />;
                        }

                        if (menuItem.type === "header") {
                            return (
                                <SingleSelectListItem
                                    key={menuItem.itemId}
                                    type={menuItem.type}
                                    title={menuItem.itemName}
                                />
                            );
                        }

                        const selectorClassName = `gd-menu-item-${menuItem.itemId}`;
                        const body = (
                            <SingleSelectListItem
                                className={cx("gd-menu-item", `s-${menuItem.itemId}`, {
                                    [selectorClassName]: menuItem.tooltip,
                                    "is-disabled": menuItem.disabled,
                                })}
                                key={menuItem.itemId}
                                title={menuItem.itemName}
                                onClick={
                                    menuItem.disabled
                                        ? undefined
                                        : () => {
                                              menuItem.onClick?.();
                                              setIsOpen(false);
                                          }
                                }
                            />
                        );

                        if (!menuItem.tooltip) {
                            return body;
                        }

                        return (
                            <BubbleHoverTrigger key={menuItem.itemId}>
                                {body}
                                <Bubble alignTo={`.${selectorClassName}`} alignPoints={bubbleAlignPoints}>
                                    <span>{menuItem.tooltip}</span>
                                </Bubble>
                            </BubbleHoverTrigger>
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
