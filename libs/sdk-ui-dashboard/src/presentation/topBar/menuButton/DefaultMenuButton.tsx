// (C) 2021-2025 GoodData Corporation
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
import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { IMenuButtonItem, IMenuButtonProps } from "./types.js";
import { useDashboardAutomations } from "../../../model/index.js";

const ALIGN_POINTS_TOOLTIP = [{ align: "bc tr" }, { align: "cl cr" }];
const overlayAlignPoints: IAlignPoint[] = [{ align: "br tr" }];
const bubbleAlignPoints: IAlignPoint[] = [{ align: "cl tr" }];

/**
 * @alpha
 */
export const DefaultMenuButton = (props: IMenuButtonProps): JSX.Element | null => {
    const { menuItems } = props;
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();
    const tooltipText = intl.formatMessage({ id: "controlButtons.options.tooltip" });

    // generate unique anchor class name to open dropdown next to the correct button if app uses multiple
    // dashboard components
    const dropdownAnchorClassName = useMemo(() => `dash-header-options-anchor-${uuid()}`, []);

    const { initializeAutomations, isInitialized, isLoading } = useDashboardAutomations();

    const onMenuButtonClick = useCallback(() => {
        initializeAutomations();
        setIsOpen((prevIsOpen) => !prevIsOpen);
    }, [initializeAutomations, setIsOpen]);

    const onMenuButtonClose = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

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

    const isLoadingActions = !isInitialized || isLoading;

    const renderMenuItems = () => {
        return (
            <Overlay
                key={"topBarMenuButton"}
                alignTo={`.${dropdownAnchorClassName}`}
                alignPoints={overlayAlignPoints}
                className="gd-header-menu-overlay"
                closeOnMouseDrag={true}
                closeOnOutsideClick={true}
                onClose={onMenuButtonClick}
            >
                <ItemsWrapper smallItemsSpacing>
                    {isLoadingActions ? (
                        <DefaultMenuButtonItem
                            menuItem={{
                                tooltip: intl.formatMessage({ id: "options.menu.loading.tooltip" }),
                                itemName: intl.formatMessage({ id: "options.menu.loading.tooltip" }),
                                itemId: "loading",
                                type: "button",
                                disabled: true,
                                isLoading: true,
                            }}
                            onClose={onMenuButtonClose}
                        />
                    ) : (
                        visibleMenuItems.map((menuItem) => (
                            <DefaultMenuButtonItem
                                key={menuItem.itemId}
                                menuItem={menuItem}
                                onClose={onMenuButtonClose}
                            />
                        ))
                    )}
                </ItemsWrapper>
            </Overlay>
        );
    };

    return (
        <>
            <BubbleHoverTrigger className="dash-header-options-wrapper" showDelay={100}>
                <Button
                    onClick={onMenuButtonClick}
                    value="&#8943;"
                    className={cx(
                        "gd-button-primary dash-header-options-button s-header-options-button gd-button",
                        dropdownAnchorClassName,
                    )}
                    ariaLabel={tooltipText}
                />
                {!isOpen ? (
                    <Bubble
                        alignTo="gd-button-primary dash-header-options-button"
                        alignPoints={ALIGN_POINTS_TOOLTIP}
                    >
                        {tooltipText}
                    </Bubble>
                ) : null}
            </BubbleHoverTrigger>
            {isOpen ? renderMenuItems() : null}
        </>
    );
};

function DefaultMenuButtonItem({ menuItem, onClose }: { menuItem: IMenuButtonItem; onClose: () => void }) {
    if (menuItem.type === "separator") {
        return <SingleSelectListItem type={menuItem.type} className={menuItem.className} />;
    }

    if (menuItem.type === "header") {
        return (
            <SingleSelectListItem
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
            title={menuItem.itemName}
            icon={menuItem.icon}
            isLoading={menuItem.isLoading}
            onClick={
                menuItem.disabled
                    ? undefined
                    : () => {
                          menuItem.onClick?.();
                          onClose();
                      }
            }
        />
    );

    if (!menuItem.tooltip) {
        return body;
    }

    return (
        <BubbleHoverTrigger eventsOnBubble={true}>
            {body}
            <Bubble alignTo={`.${selectorClassName}`} alignPoints={bubbleAlignPoints}>
                <span>{menuItem.tooltip}</span>
            </Bubble>
        </BubbleHoverTrigger>
    );
}
