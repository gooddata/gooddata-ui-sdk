// (C) 2021-2022 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import cx from "classnames";
import {
    Bubble,
    BubbleHoverTrigger,
    Button,
    IAlignPoint,
    ItemsWrapper,
    Overlay,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";

import { IMenuButtonProps } from "./types.js";

const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];
const bubbleAlignPoints: IAlignPoint[] = [{ align: "cl tr" }];

/**
 * @alpha
 */
export const DefaultMenuButton = (props: IMenuButtonProps): JSX.Element | null => {
    const { menuItems } = props;
    const [isOpen, setIsOpen] = useState(false);

    const onMenuButtonClick = useCallback(() => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    }, []);

    const visibleMenuItems = useMemo(() => menuItems.filter((item) => item.visible !== false), [menuItems]);

    if (!visibleMenuItems.length) {
        if (!menuItems.length) {
            // only warn if the items were really empty before filtering
            console.warn(
                "DefaultMenuButton rendered without menu items. Make sure you are passing some items there.",
            );
        }

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
                    {visibleMenuItems.map((menuItem) => {
                        if (menuItem.type === "separator") {
                            return (
                                <SingleSelectListItem
                                    key={menuItem.itemId}
                                    type={menuItem.type}
                                    className={menuItem.className}
                                />
                            );
                        }

                        if (menuItem.type === "header") {
                            return (
                                <SingleSelectListItem
                                    key={menuItem.itemId}
                                    type={menuItem.type}
                                    title={menuItem.itemName}
                                    className={menuItem.className}
                                />
                            );
                        }

                        const selectorClassName = `gd-menu-item-${menuItem.itemId}`;
                        const body = (
                            <SingleSelectListItem
                                className={cx("gd-menu-item", menuItem.className, `s-${menuItem.itemId}`, {
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
            {isOpen ? renderMenuItems() : null}
        </>
    );
};
