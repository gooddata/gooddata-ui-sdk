// (C) 2021 GoodData Corporation
import React, { ComponentType, useState } from "react";
import { Placement } from "../model/types/topBarTypes";
import { Button, SingleSelectListItem, ItemsWrapper, Overlay } from "@gooddata/sdk-ui-kit";

import { useIntl } from "react-intl";

/**
 * @internal
 */
export interface IDashboardMenuButtonProps {
    onMenuItemHover: (itemId: string) => void;
    onMenuItemClicked: (itemId: string) => void;
}

/**
 * @internal
 */
export type MenuButtonItem = {
    itemId: string;
    itemName: string;
    callback?: (...params: any) => void;
    /**
     * If type is not specified, then common menu button item rendered.
     */
    type?: "separator" | "header";
};

/**
 * @internal
 */
export interface IDefaultMenuButtonProps {
    /**
     * Optionally specify how the menu button looks like
     */
    ButtonComponent?: React.FC;

    /**
     * Optionally specify custom items that will be in the menu. Using this setting fully overrides the
     * menu items. The default items will not be shown.
     */
    menuItems?: MenuButtonItem[];

    /**
     * Optionally specify additional menu items to add on top of the default items.
     *
     * If specified, this should be a list of tuples: index to add item at, the menu item to add. If you want
     * to add item at the end of the list, use index `-1`.
     */
    AdditionalMenuItems?: [number, MenuButtonItem][];
}

/**
 * Default implementation of the menu. Apart from fulfilling the dashboard menu contract, the default implementation
 * allows customization of the button itself.
 *
 * @internal
 */
export const DashboardMenuButton: React.FC<IDashboardMenuButtonProps & IDefaultMenuButtonProps> = (
    props: IDashboardMenuButtonProps & IDefaultMenuButtonProps,
) => {
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();
    const renderDefaultMenuItems = () => {
        return props.menuItems?.map((menuItem) => {
            return (
                <SingleSelectListItem
                    key={menuItem.itemId}
                    title={intl.formatMessage({ id: menuItem.itemName })}
                    type={menuItem.type}
                    onClick={menuItem.callback}
                />
            );
        });
    };

    const renderAdditionalMenuItems = () => {
        //todo add render logic according to indexes specified.
        return props.AdditionalMenuItems?.map((item) => {
            const menuItem = item[1];
            return (
                <SingleSelectListItem
                    key={menuItem.itemId}
                    title={menuItem.itemName}
                    type={menuItem.type}
                    onClick={menuItem.callback}
                />
            );
        });
    };

    const onMenuButtonClick = () => {
        setIsOpen(!isOpen);
    };

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
                <ItemsWrapper>
                    {renderDefaultMenuItems()}
                    {renderAdditionalMenuItems()}
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
 * @internal
 */
export type DashboardMenuButtonComponent = ComponentType<IDashboardMenuButtonProps & IDefaultMenuButtonProps>;

export const defaultMenuButtonProps = {
    Component: DashboardMenuButton,
    placement: "right" as Placement,
};
